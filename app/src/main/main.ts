import {app, Menu, MenuItemConstructorOptions} from "electron";
import * as isDev from "electron-is-dev";
import { autoUpdater} from "electron-updater";
import { AboutWindow } from "./window/AboutWindow";
import {AbstractWindow} from "./window/AbstractWindow";
import { ConnectionWindow } from "./window/ConnectionWindow";

const isDarwin: boolean = process.platform === "darwin"; // darwin is the macos kernel

let isUpdateAvailable: boolean = false; // whether an update is known to be available

/**
 * Creates a new window
 */
function createWindow() {
    const window = new ConnectionWindow();
    if (isUpdateAvailable) {
        window.displayUpdateBanner(!isDarwin); // macOS doesn't allow auto-updates unless the binary is signed
    }
    window.present();
}

/**
 * Initializes the app on startup
 */
function init() {

    // initialize window prefs
    global["prefs"] = {
        "builderWidth": 256 // width of builder panel for new windows
    };

    // create the application menus
    const menuTemplate: MenuItemConstructorOptions[] = [
        {
            "label": isDarwin ? app.getName() : "Help",
            "submenu": [
                {
                    "click": () => {
                        const window = new AboutWindow();
                        window.present();
                    },
                    "label": "About Socketfox"
                }
            ]
        },
        {
            "label": "File",
            "submenu": [
                {
                    "accelerator": "CommandOrControl+N",
                    "click": () => {
                        createWindow();
                    },
                    "label": "New Window"
                },
                {
                    "accelerator": "CommandOrControl+W",
                    "click": () => {
                        if (AbstractWindow.windows.length > 0) {
                            AbstractWindow.windows[0].close();
                        }
                    },
                    "label": "Close Window"
                }
            ]
        },
        {
            "label": "Edit",
            "submenu": [
                { "role": "undo" },
                { "role": "redo" },
                { "type": "separator" },
                { "role": "cut" },
                { "role": "copy" },
                { "role": "paste" },
                { "role": "delete" },
                { "role": "selectAll" }
            ]
        }
    ];

    // move help menu to end of menu bar if on windows/linux
    if (!isDarwin) {
        const helpMenu: MenuItemConstructorOptions = menuTemplate.splice(0, 1)[0];
        menuTemplate.push(helpMenu);
    }

    // add quit options to first menu
    (menuTemplate[0]["submenu"] as MenuItemConstructorOptions[]).push({ "type": "separator" });
    (menuTemplate[0]["submenu"] as MenuItemConstructorOptions[]).push({ "role": "quit" });

    // add dev settings to menu if running in dev mode
    if (isDev) {
        menuTemplate.push({
            "label": "Developer",
            "submenu": [
                { "role": "reload" },
                { "role": "toggledevtools" }
            ]
        });
    }

    // build application menu
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

    // create main window
    createWindow();

    // check for updates
    autoUpdater.autoDownload = false;
    autoUpdater.checkForUpdates()
        .catch((ex: Error) => {
            console.error(ex);
        });
    autoUpdater.on("update-available", () => {
        if (isDarwin) { // macOS doesn't support auto-updates unless the binary is signed
            isUpdateAvailable = true;
            AbstractWindow.windows.forEach((w) => { // show the banner
                if (w instanceof ConnectionWindow) {
                    w.displayUpdateBanner(false);
                }
            });
        } else { // not macOS, auto-updates should work
            autoUpdater.downloadUpdate()
                .then(() => { // update was downloaded
                    console.log("Downloaded update, waiting for restart");

                    // show the banner
                    isUpdateAvailable = true;
                    AbstractWindow.windows.forEach((w) => {
                        if (w instanceof ConnectionWindow) {
                            w.displayUpdateBanner(true);
                        }
                    });

                })
                .catch((err) => console.error(err));
        }
    });

}

// open window when app is ready
app.on("ready", init);

// quit when all windows are closed.
app.on("window-all-closed", function () {
    if (process.platform !== "darwin") { // don't close all windows on "darwin" kernel platforms (aka macOS)
        app.quit();
    }
});

// app is reactivated on macOS after it was deactivated (but not closed) - make a new window
app.on("activate", function () {
    if (AbstractWindow.windows.length === 0) {
        createWindow();
    }
});
