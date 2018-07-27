import {BrowserWindow} from "electron";
import {loadAsset} from "./assets";

export class InstanceWindow {

    private static readonly _windows: InstanceWindow[] = []; // global array of windows

    public static get windows(): InstanceWindow[] {
        return [...this._windows];
    }

    /**
     * Update internal window indices to reflect their position in the global window array.
     */
    private static updateWindowIndices(start: number = 0): void {
        for (let i = start; i < InstanceWindow._windows.length; i++) {
            InstanceWindow._windows[i].currentIndex = i;
        }
    }

    public readonly window: BrowserWindow;

    private currentIndex: number; // the current index of the window in the global window array

    public constructor() {

        // create a new browser window
        this.window = new BrowserWindow({
            "height": 600,
            "icon": loadAsset("icons/64x64.png"),
            "show": false,
            "width": 800
        });

        // handle window ready
        this.window.once("ready-to-show", this.onReady.bind(this));

        // handle window gaining focus
        this.window.on("focus", this.onFocus.bind(this));

        // handle window closed
        this.window.on("closed", this.onClosed.bind(this));

    }

    /**
     * Load the window and display it when ready
     */
    public load() {
        this.window.loadFile(loadAsset("views/index.html"));

        // add window to global window array
        InstanceWindow._windows.unshift(this);
        InstanceWindow.updateWindowIndices();
    }

    /**
     * Handle window close - remove window from global window array
     */
    private onClosed(): void {
        InstanceWindow._windows.splice(this.currentIndex, 1);
        InstanceWindow.updateWindowIndices(this.currentIndex);
    }

    /**
     * Handle window focus - move window to front of global window array
     */
    private onFocus(): void {
        InstanceWindow._windows.splice(this.currentIndex, 1);
        InstanceWindow._windows.unshift(this);
        InstanceWindow.updateWindowIndices();
    }

    /**
     * Handle window ready - show the window to the user
     */
    private onReady(): void {
        this.window.show();
    }

}
