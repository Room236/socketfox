import * as $ from "jquery";
import * as SocketIOClient from "socket.io-client";
import {Log} from "./log";

// create socket.io client
let socket: SocketIOClient.Socket = null;

function setConnectionStatus(status: string) {
    switch (status) {
        case "success":
            $("#connect")
                .removeClass("nav__button--error")
                .removeClass("nav__button--working")
                .addClass("nav__button--active");
            break;
        case "working":
            $("#connect")
                .removeClass("nav__button--error")
                .removeClass("nav__button--working")
                .addClass("nav__button--active");
            break;
        case "error":
            $("#connect")
                .addClass("nav__button--error")
                .removeClass("nav__button--working")
                .removeClass("nav__button--active");
            break;
    }
}

// connect to server
function connect(url: string) {
    setConnectionStatus("working");
    Log.info(`Connecting to ${url}`);
    socket = io(url);

    // handle connection established
    socket.on("connect", () => {
        setConnectionStatus("success");
        Log.success(`Connected to ${url}`);
    });

    // handle connection error
    socket.on("connect_error", () => {
        setConnectionStatus("working");
        Log.error(`Connection to ${url} timed out`);
    });

    // handle timeout
    socket.on("connect_error", () => {
        setConnectionStatus("error");
        Log.error(`Failed to connect to ${url}`);
    });
}

// handle connect button
$("#url").on("keyup", (e: JQuery.Event) => {
    if (e.which === 13) {
        const url: string = <string>($("url").val());
        connect(url);
    }
});
