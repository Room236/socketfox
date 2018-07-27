import {app, Menu, MenuItemConstructorOptions} from "electron";
import openAboutWindow from "electron-about-window";
import * as isDev from "electron-is-dev";
import {InstanceWindow} from "./instanceWindow";

/**
 * Creates a new window
 */
function createWindow() {
    const window: InstanceWindow = new InstanceWindow();
    window.load();
}

/**
 * Initializes the app on startup
 */
function init() {
    const isDarwin: boolean = process.platform === "darwin"; // darwin is the macos kernel

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
                            "icon_path": "../../assets/icons/png/1024x1024.png",
                            "package_json_dir": "../",
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

}

// open window when app is ready
app.on("ready", init);

// quit when all windows are closed.
app.on("window-all-closed", function () {
    if (process.platform !== "darwin") { // don't close all windows on "darwin" kernel platforms (aka macOS)
        app.quit();
    }
});

// app is reactivated on macos after it was deactivated (but not closed) - make a new window
app.on("activate", function () {
    if (InstanceWindow.windows.length === 0) {
        createWindow();
    }
});
