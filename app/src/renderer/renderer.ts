import {ipcRenderer, remote} from "electron";
import * as $ from "jquery";
import * as SocketIOClient from "socket.io-client";
import * as SocketIOWildcard from "socketio-wildcard";
import {PrettyPrint} from "../prettyprint";
import {WindowPrefs} from "../types";
import {Log, LogType} from "./log";
import "./theme.js";

// load jquery-ui (it requires a global reference to jQuery)
global["jQuery"] = $;
import "jqueryui";
import {isArray, isObject, isString} from "util";

// get shared window prefs
const prefs: WindowPrefs = remote.getGlobal("prefs");

// load ace editor
const editor = ace.edit("editor");
editor.setTheme("ace/theme/socketfox");
editor.session.setMode("ace/mode/json");
editor.renderer.setShowGutter(false);

// make the builder resizable
$(".builder").width(prefs.builderWidth).resizable({
    "handles": "e",
    "minWidth": 256,
    "stop": (event: Event, ui: JQueryUI.ResizableUIParams) => {
        prefs.builderWidth = ui.size["width"];
    }
});

// create socket.io client
let active: boolean = false; // whether the connection is "active" (connecting, connected, error, etc.)
let fileVarCount: number = 0; // next "index" of a file variable to be added
let host: string = null; // the current hostname of the attempted connection
let socket: SocketIOClient.Socket = null; // the socket connection
const vars: object = {}; // variables to be interpolated into the data

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
    Log.info(`Connecting to ${url}`, LogType.RESPONSE);

    // connect to server
    socket = SocketIOClient.connect(url, {
        "transports": [ "websocket" ],
        "upgrade": false
    });
    host = url;

    // patch socket.io client to handle wildcards
    const patch = SocketIOWildcard(SocketIOClient.Manager);
    patch(socket);

    // handle all events
    socket.on("*", (pkg) => {
        let output: string = `Received event: ${Log.escape(pkg.data[0])}\nData: `;

        // format the event data
        if (pkg.data[1]) {
            output += PrettyPrint.format(pkg.data[1]);
        }

        Log.info(output, LogType.RESPONSE);
    });

    // handle connection established
    socket.on("connect", () => {
        setConnectionStatus("success");
        Log.success(`Connected to ${host}`, LogType.RESPONSE);
    });

    // handle connection error
    socket.on("connect_timeout", () => {
        setConnectionStatus("working");
        Log.error(`Connection to ${host} timed out`, LogType.RESPONSE);
        active = false;
        socket.close();
    });

    // handle timeout
    socket.on("connect_error", (error: Error) => {
        setConnectionStatus("error");
        Log.error(`Failed to connect to ${host}: ${error}`, LogType.RESPONSE);
        active = false;
        socket.close();
    });

    // handle reconnecting
    socket.on("reconnecting", () => {
        setConnectionStatus("working");
        Log.warn(`Lost connection to ${host}, attempting to reconnect...`, LogType.RESPONSE);
    });

    // handle reconnect
    socket.on("reconnect", () => {
        setConnectionStatus("success");
        Log.success(`Reconnected to ${host}`, LogType.RESPONSE);
    });

    // handle forced disconnect
    socket.on("disconnect", () => {
        if (active) {
            active = false;
            socket = null;
            setConnectionStatus("error");
            Log.error(`Lost connection to ${host}`, LogType.RESPONSE);
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
    Log.info(`Disconnected from ${host}`, LogType.RESPONSE);
}

function send(name: string, data: string) {
    let jsonData: object | string | number | boolean = null; // data parsed from json, with interpolators as strings
    let finalData: object | string | number | boolean = null; // data at the end of processing

    // parse json and interpolators into a JS object
    if (data) {

        // temporarily change any referenced variables to a string before parsing (so it's valid JSON)
        const validationString: string = data.replace(/\${[a-zA-Z0-9]+}/g,
            (match: string) => `"${match}"`);

        // try to parse the data
        if (data) {
            try {
                jsonData = JSON.parse(validationString);
            } catch (ex) {
                remote.dialog.showErrorBox("Invalid data", `Event data is not of a valid type.`);
                return;
            }
        }

        // interpolate any referenced variables into the final data
        function interpolate(item: object | string | number | boolean) {
            if (isArray(item)) { // data is an array, iterate over each item
                for (let i = 0; i < item.length; i++) {
                    if (typeof item[i] === "undefined") { // item is undefined already, don't bother trying to parse it
                        continue;
                    }

                    // get the final value of the prop
                    const result: any = interpolate(item[i]);
                    if (typeof result !== "undefined") { // key needs to be interpolated in
                        item[i] = result;
                    }
                }
                return item;
            } else if (isObject(item)) { // just a normal object, iterate over each property
                for (const key of Object.keys(item)) {
                    if (typeof item[key] === "undefined") { // item is undefined already, don't bother parsing it
                        continue;
                    }

                    // get the final value of the prop
                    const result: any = interpolate(item[key]);
                    if (typeof result !== "undefined") { // item needs to be interpolated in
                        item[key] = result;
                    }
                }
                return item;
            } else if (isString(item)) { // just a string, check if it's a temporarily encapsulated interpolator
                const match: RegExpMatchArray = item.match(/^\${([a-zA-Z0-9]+)}$/);
                if (!match) { // doesn't look like an interpolator, skip it
                    return undefined;
                }
                const varName: string = match[1]; // the name of the variable

                // get the variable, if it's defined
                if (varName in vars) { // variable is defined, replace it
                    return vars[varName];
                } else { // variable is not defined, stop processing
                    throw new Error(`Variable \${${varName}} is not defined`);
                }
            }
        }

        // interpolate any referenced variables into the final data
        finalData = JSON.parse(validationString);
        try {
            finalData = interpolate(finalData);
        } catch (ex) {
            Log.error(ex.message, LogType.REQUEST);
            return;
        }

    }

    // emit the event over the socket
    socket.emit(name, finalData);

    // format data for display
    const displayData: string = PrettyPrint.format(jsonData); // use data without the interpolated variables
    Log.info(`Sent event: ${name}\nData: ${displayData}`, LogType.REQUEST);
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

// handle attach button - attach a file to a variable
$("#attach").on("click", () => {
    ipcRenderer.send("request-file");
});

// handle a file attachment buffer being returned from the main process
ipcRenderer.on("attach-file", (event: Electron.Event, file: object) => {

    // add buffer to array of vars
    vars[`file${fileVarCount}`] = file["data"];

    // notify the user that the variable has been added
    Log.print(`Assigned file ${file["name"]} to variable \${file${fileVarCount}}`);

    // increment the file variable index for next time
    fileVarCount++;
});

// handle send button
$("#send").on("click", () => {
    const name: string = <string>($("#new-event-name").val());
    const data: string = editor.getValue();
    if (name === "" || !active) {
        return;
    }
    send(name, data);
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
    const data: string = editor.getValue();
    if (name === "" || !active) { // name is not specified or not connected to a server, don't do anything
        return;
    }

    // fire the event
    send(name, data);

});

// handle clear history button
$("#clear__button").on("click", () => {
    Log.clear();
});

// handle restart button
$("#restart").on("click", () => {
    ipcRenderer.send("install-update");
});

// handle display update banner command
ipcRenderer.on("display-update-banner", (event: Electron.Event, allowInstall: boolean) => {
    console.log(allowInstall);
    if (allowInstall) {
        $("#restart").show();
        $("#update-banner__install-prompt").show();
    } else {
        $("#restart").hide();
        $("#update-banner__install-prompt").hide();
    }
    $("#update-banner").show();
});
