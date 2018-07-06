import {app, BrowserWindow} from "electron";
import * as Path from "path";

let mainWindow; // keep a global reference to the window to keep it from being gc'd

/**
 * Creates a new window
 */
function createWindow() {
    mainWindow = new BrowserWindow({
        "height": 600,
        "icon": Path.join(__dirname, "assets/icons/png/64x64.png"),
        "width": 800
    });

    // load the main view
    mainWindow.loadFile("assets/views/index.html");

    // handle window closed
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

// open window when app is ready
app.on("ready", createWindow);

// quit when all windows are closed.
app.on("window-all-closed", function () {
    if (process.platform !== "darwin") { // don't close all windows on "darwin" kernel platforms (aka macOS)
        app.quit();
    }
});

app.on("activate", function () {
    if (mainWindow === null) { // macOS keeps apps running and allows re-creating windows
        createWindow();
    }
});
