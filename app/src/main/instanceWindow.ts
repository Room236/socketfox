import {BrowserWindow, ipcMain} from "electron";
import {loadAsset} from "../assets";

type HandlerMap = {
    [key: string]: HandlerInfo;
};

type HandlerInfo = {
    registeredHandlers: Array<(event: Event, ...args) => void>;

    forwardHandler(event: Electron.Event, ...args): void;
};

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

    private currentIndex: number;          // the current index of the window in the global window array
    private ipcHandlers: HandlerMap = {}; // map of ipc channels to handler functions

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
     * Binds a handler to events on this {@link InstanceWindow}.
     *
     * @param {string} channel The name of the channel to bind to
     * @param handler A handler to be invoked when the event occurs.
     */
    public on(channel: string, handler: (event: Electron.Event, ...args) => void) {

        // build handler info for this channel if it doesn't exist yet
        if (!(channel in this.ipcHandlers)) {
            this.ipcHandlers[channel] = {
                "forwardHandler": this.onIpcMessage.bind(this, channel),
                "registeredHandlers": []
            };
        }

        // add handler to registered handlers map
        this.ipcHandlers[channel].registeredHandlers.push(handler);

        // bind the forward handler to the ipc event
        ipcMain.on(channel, this.ipcHandlers[channel].forwardHandler);
    }

    /**
     * Handle window close - tear down and clean up
     */
    private onClosed(): void {

        // remove window from global window array
        InstanceWindow._windows.splice(this.currentIndex, 1);
        InstanceWindow.updateWindowIndices(this.currentIndex);

        // unbind ipc message handler from ipc
        for (const channel of Object.keys(this.ipcHandlers)) {
            ipcMain.removeListener(channel, this.ipcHandlers[channel].forwardHandler);
        }

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
     * Handle an IPC message from any window - only fire the registered handler if this window was the sender
     */
    private onIpcMessage(channel: string, event: Electron.Event, ...args): void {
        if (event.sender === this.window.webContents) { // this window was the sender, fire the handler
            for (const handler of this.ipcHandlers[channel].registeredHandlers) {
                handler(event, args);
            }
        }
    }

    /**
     * Handle window ready - show the window to the user
     */
    private onReady(): void {
        this.window.show();
    }

}
