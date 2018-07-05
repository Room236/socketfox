import * as $ from "jquery";
import * as SocketIOClient from "socket.io-client";
import * as SocketIOWildcard from "socketio-wildcard";
import {Log} from "./log";
import {PrettyPrint} from "./prettyprint";

// create socket.io client
let active: boolean = false; // whether the connection is "active" (connecting, connected, error, etc.)
let host: string = null; // the current hostname of the attempted connection
let socket: SocketIOClient.Socket = null; // the socket connection

function setConnectionStatus(status: string) {
    const $connect = $("#connect");
    $connect
        .removeClass("nav__button--error")
        .removeClass("nav__button--warning")
        .removeClass("nav__button--active");
    switch (status) {
        case "success":
            $connect.addClass("nav__button--active");
            break;
        case "working":
            $connect.addClass("nav__button--warning");
            break;
        case "error":
            $connect.addClass("nav__button--error");
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
        let output: string = `Received event: ${Log.escape(pkg.data[0])}<br/>`;

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
