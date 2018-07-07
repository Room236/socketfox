import {app, BrowserWindow, Menu, MenuItemConstructorOptions, shell} from "electron";
import openAboutWindow from "electron-about-window";
import * as isDev from "electron-is-dev";
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

/**
 * Initializes the app on startup
 */
function init() {

    // create the application menus
    const menuTemplate: MenuItemConstructorOptions[] = [
        {
            "label": process.platform === "darwin" ? app.getName() : "Help",
            "submenu": [
                {
                    "click": () => {
                        openAboutWindow({
                            "bug_report_url": "https://gitlab.com/richardkriesman/socketfox",
                            "copyright": "Copyright © 2018 Richard Kriesman.",
                            "description": "Develop better, faster backends in Socket.IO.",
                            "homepage": "https://gitlab.com/richardkriesman/socketfox",
                            "icon_path": "../../assets/icons/png/1024x1024.png",
                            "package_json_dir": "../",
                            "product_name": "Socketfox",
                            "use_version_info": false
                        });
                    },
                    "label": "About Socketfox"
                },
                { "role": "separator" },
                { "role": "quit" }
            ]
        }
    ];
    if (isDev) { // add dev settings if running in dev mode
        menuTemplate.push({
            "label": "Danger Zone",
            "submenu": [
                {
                    "click": () => {
                        shell.openExternal("https://www.youtube.com/watch?v=siwpn14IE7E");
                    },
                    "label": "Play Appropriate Music"
                },
                { "role": "reload" },
                { "role": "toggledevtools" }
            ]
        });
    }

    // build application menu
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

    // create main window
    createWindow();

}

// open window when app is ready
app.on("ready", init);

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
