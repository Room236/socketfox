import {app, dialog, Menu, MenuItemConstructorOptions} from "electron";
import openAboutWindow from "electron-about-window";
import * as isDev from "electron-is-dev";
import { autoUpdater, UpdateCheckResult, UpdateInfo } from "electron-updater";
import * as fs from "fs";
import * as path from "path";
import {loadAsset} from "../assets";
import {InstanceWindow} from "./instanceWindow";

const isDarwin: boolean = process.platform === "darwin"; // darwin is the macos kernel

let isUpdateAvailable: boolean = false; // whether an update is known to be available

/**
 * Creates a new window
 */
function createWindow() {
    const window: InstanceWindow = new InstanceWindow();
    if (isUpdateAvailable) {
        window.displayUpdateBanner(!isDarwin); // macOS doesn't allow auto-updates unless the binary is signed
    }

    // handle prompting the user for a file on disk
    window.on("request-file", (event: Electron.Event) => {
        dialog.showOpenDialog(window.window, {
            "title": "Select attachment"
        }, (filePaths: string[]) => { // response from dialog
            if (!filePaths || filePaths.length === 0) { // no file was selected, don't do anything
                return;
            }

            // read the file into a buffer
            fs.readFile(filePaths[0], ((err: Error, data: Buffer) => {
                if (err) { // error occurred, print error to console
                    console.error(err);
                    return;
                }

                // send file buffer back to renderer
                event.sender.send("attach-file", {
                    "data": data,
                    "name": path.basename(filePaths[0])
                });
            }));
        });
    });

    // handle requesting to restart and install an update
    window.on("install-update", () => {
        autoUpdater.quitAndInstall();
    });

    window.load();
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
                        openAboutWindow({
                            "bug_report_url": "https://gitlab.com/richardkriesman/socketfox",
                            "copyright": "Copyright © 2018 Richard Kriesman.",
                            "description": "Develop better, faster backends in Socket.IO.",
                            "homepage": "https://gitlab.com/richardkriesman/socketfox",
                            "icon_path": loadAsset("icons/png/1024x1024.png"),
                            "package_json_dir": "../../",
                            "product_name": "Socketfox",
                            "use_version_info": false
                        });
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
                        if (InstanceWindow.windows.length > 0) {
                            InstanceWindow.windows[0].window.close();
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
            InstanceWindow.windows.forEach((w) => { // show the banner
                w.displayUpdateBanner(false);
            });
        } else { // not macOS, auto-updates should work
            autoUpdater.downloadUpdate()
                .then(() => { // update was downloaded
                    console.log("Downloaded update, waiting for restart");

                    // show the banner
                    isUpdateAvailable = true;
                    InstanceWindow.windows.forEach((w) => {
                        w.displayUpdateBanner();
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
    if (InstanceWindow.windows.length === 0) {
        createWindow();
    }
});
