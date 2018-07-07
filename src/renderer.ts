import {remote} from "electron";
import * as $ from "jquery";
import * as SocketIOClient from "socket.io-client";
import * as SocketIOWildcard from "socketio-wildcard";
import {Log} from "./log";
import {PrettyPrint} from "./prettyprint";

// load ace editor
const editor = ace.edit("editor");
editor.setTheme("ace/theme/tomorrow_night_eighties");
editor.session.setMode("ace/mode/json");
editor.renderer.setShowGutter(false);

// create socket.io client
let active: boolean = false; // whether the connection is "active" (connecting, connected, error, etc.)
let host: string = null; // the current hostname of the attempted connection
let socket: SocketIOClient.Socket = null; // the socket connection

function setConnectionStatus(status: string) {
    const $connect = $("#connect");
    $connect
        .removeClass("button--error")
        .removeClass("button--warning")
        .removeClass("button--active");
    switch (status) {
        case "success":
            $connect.addClass("button--active");
            break;
        case "working":
            $connect.addClass("button--warning");
            break;
        case "error":
            $connect.addClass("button--error");
            break;
    }
}

/**
 * Attempt to connect to the server
 * @param {string} url The URL of the socket to connect to
 */
function connect(url: string) {
    if (url === "") { // don't connect to an empty server
        return;
    }
    if (socket !== null) { // disconnect from old socket if still connected
        socket.close();
    }

    // set connection status as working
    active = true;
    setConnectionStatus("working");
    Log.info(`Connecting to ${url}`);

    // connect to server
    socket = SocketIOClient.connect(url);
    host = url;

    // patch socket.io client to handle wildcards
    const patch = SocketIOWildcard(SocketIOClient.Manager);
    patch(socket);

    // handle all events
    socket.on("*", (pkg) => {
        let output: string = `Received event: ${Log.escape(pkg.data[0])}<br/>Data: `;

        // format the event data
        if (pkg.data[1]) {
            const formattedData: string = PrettyPrint.format(pkg.data[1]);
            output += Log.escape(formattedData)
                .replace(new RegExp("\n", "g"), "<br/>")
                .replace(new RegExp(" ", "g"), "&nbsp;");
        }

        Log.info(output, true);
    });

    // handle connection established
    socket.on("connect", () => {
        setConnectionStatus("success");
        Log.success(`Connected to ${host}`);
    });

    // handle connection error
    socket.on("connect_timeout", () => {
        setConnectionStatus("working");
        Log.error(`Connection to ${host} timed out`);
        active = false;
        socket.close();
    });

    // handle timeout
    socket.on("connect_error", (error: Error) => {
        setConnectionStatus("error");
        Log.error(`Failed to connect to ${host}: ${error}`);
        active = false;
        socket.close();
    });

    // handle reconnecting
    socket.on("reconnecting", () => {
        setConnectionStatus("working");
        Log.warn(`Lost connection to ${host}, attempting to reconnect...`);
    });

    // handle reconnect
    socket.on("reconnect", () => {
        setConnectionStatus("success");
        Log.success(`Reconnected to ${host}`);
    });

    // handle forced disconnect
    socket.on("disconnect", () => {
        if (active) {
            active = false;
            socket = null;
            setConnectionStatus("error");
            Log.error(`Lost connection to ${host}`);
        }
    });
}

/**
 * Disconnect from the server
 */
function disconnect() {
    active = false;
    socket.close();
    socket = null;
    setConnectionStatus(null);
    Log.info(`Disconnected from ${host}`);
}

function send(name: string, type: string, data: string) {
    let finalData: object|string|number|boolean = null;
    if (data !== "") {
        try {
            switch (type) {
                case "object":
                    finalData = JSON.parse(data);
                    break;
                case "string":
                    finalData = data;
                    break;
                case "integer":
                    finalData = parseInt(data, 10);
                    break;
                case "float":
                    finalData = parseFloat(data);
                    break;
                case "boolean":
                    finalData = data === "true";
                    break;
            }
        } catch (ex) {
            remote.dialog.showErrorBox("Invalid data", `Event data is not of the type ${type}.`);
            return;
        }
    }
    socket.emit(name, finalData);

    // format data for display
    const displayData: string = Log.escape(PrettyPrint.format(finalData))
        .replace(new RegExp("\n", "g"), "<br/>")
        .replace(new RegExp(" ", "g"), "&nbsp;");
    Log.request(`Sent event: ${name}<br/>Data: ${displayData}`, true);
}

// connect to server on enter key in url
$("#url").on("keyup", (e: JQuery.Event) => {
    if (e.which === 13) { // enter key was pressed
        const url: string = <string>($("#url").val());
        connect(url);
    }
});

// connect/disconnect on connect button click
$("#connect").on("click", () => {
    if (!active) { // not connected to server, establish connection
        const url: string = <string>($("#url").val());
        connect(url);
    } else { // socket is connected, disconnect
        disconnect();
    }
});

// change editor modes when the data type changes
const $newEventType = $("#new-event-type");
$newEventType.on("change", () => {
    switch ($newEventType.val()) {
        case "object":
            editor.session.setMode("ace/mode/json");
            break;
        default:
            editor.session.setMode("ace/mode/plain_text");
    }
});

// handle send button
$("#send__button").on("click", () => {
    const name: string = <string>($("#new-event-name").val());
    const type: string = <string>($("#new-event-type").val());
    const data: string = editor.getValue();
    if (name === "" || !active) {
        return;
    }
    send(name, type, data);
});

// handle keyboard shortcut for sending requests
$(document).on("keydown", (e: JQuery.Event) => {

    // only continue if correct keyboard shortcut is performed
    const isModifierKeyPressed: boolean = process.platform === "darwin" ? e.metaKey : e.ctrlKey; // command key on macos
    if (!isModifierKeyPressed || e.which !== 13) {
        return;
    }

    // extract data from ui
    const name: string = <string>($("#new-event-name").val());
    const type: string = <string>($("#new-event-type").val());
    const data: string = editor.getValue();
    if (name === "" || !active) { // name is not specified or not connected to a server, don't do anything
        return;
    }

    // fire the event
    send(name, type, data);

});
