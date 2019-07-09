import {BrowserWindow, ipcMain} from "electron";
import {loadAsset} from "../../assets";
import { AbstractEvent } from "../../common/event/AbstractEvent";

type HandlerMap = {
    [key: string]: HandlerInfo;
};

type HandlerInfo = {
    registeredHandlers: Array<(event: AbstractEvent) => void>;

    forwardHandler(event: Electron.Event, ...args): void;
};

export abstract class AbstractWindow {

    private static readonly _windows: AbstractWindow[] = []; // global array of windows

    public static get windows(): AbstractWindow[] {
        return [...this._windows];
    }

    /**
     * Update internal window indices to reflect their position in the global window array.
     */
    private static updateWindowIndices(start: number = 0): void {
        for (let i = start; i < AbstractWindow._windows.length; i++) {
            AbstractWindow._windows[i].currentIndex = i;
        }
    }

    protected readonly window: BrowserWindow;

    private currentIndex: number;          // the current index of the window in the global window array
    private readonly ipcHandlers: HandlerMap = {};  // map of ipc channels to handler functions

    protected constructor(height: number = 600, width: number = 800, resizable: boolean = true) {

        // create a new browser window
        this.window = new BrowserWindow({
            height,
            "icon": loadAsset("icons/64x64.png"),
            resizable,
            "show": false,
            width
        });

        // handle window ready
        this.window.once("ready-to-show", this.onReady.bind(this));

        // handle window gaining focus
        this.window.on("focus", this.onFocus.bind(this));

        // handle window closed
        this.window.on("closed", this.onClosed.bind(this));

    }

    /**
     * Closes the window.
     */
    public close(): void {
        this.window.close();
    }

    /**
     * Loads the window and presents it to the user when ready.
     */
    public present(): void {
        this.window.loadFile(loadAsset(this.viewPath));
    }

    /**
     * Gets the path of the view to be rendered.
     */
    protected abstract get viewPath(): string;

    /**
     * Emits an {@link AbstractEvent} to the renderer.
     *
     * @param name Name of the event
     * @param event Event to send
     */
    protected emit(name: string, event: AbstractEvent): void {
        this.window.webContents.send(name, event);
    }

    /**
     * Binds a handler to events on this {@link AbstractWindow}.
     *
     * @param name Name of the event
     * @param handler Handler to be invoked when the event occurs
     */
    protected listenForEvent<T extends AbstractEvent>(name: string, handler: (event: T) => void): void {

        // build handler info for this channel if it doesn't exist yet
        if (!(name in this.ipcHandlers)) {
            this.ipcHandlers[name] = {
                "forwardHandler": this.onIpcMessage.bind(this, name),
                "registeredHandlers": []
            };
        }

        // add handler to registered handlers map
        this.ipcHandlers[name].registeredHandlers.push(handler);

        // bind the forward handler to the ipc event
        ipcMain.on(name, this.ipcHandlers[name].forwardHandler);
    }

    /**
     * Fires after the window has closed.
     */
    protected abstract onAfterClosed(): void;

    /**
     * Fires after the window has gained focus.
     */
    protected abstract onAfterFocus(): void;

    /**
     * Fires before the window is presented.
     */
    protected abstract onBeforePresent(): void;

    /**
     * Fires after the window is closed.
     */
    private onClosed(): void {

        // remove window from global window array
        AbstractWindow._windows.splice(this.currentIndex, 1);
        AbstractWindow.updateWindowIndices(this.currentIndex);

        // unbind ipc message handler from ipc
        for (const channel of Object.keys(this.ipcHandlers)) {
            ipcMain.removeListener(channel, this.ipcHandlers[channel].forwardHandler);
        }

        // fire onAfterClosed
        this.onAfterClosed();
    }

    /**
     * Fires after the window gains focus.
     */
    private onFocus(): void {
        AbstractWindow._windows.splice(this.currentIndex, 1);
        AbstractWindow._windows.unshift(this);
        AbstractWindow.updateWindowIndices();

        this.onAfterFocus();
    }

    /**
     * Handle an IPC message from any window - only fire the registered handler if this window was the sender
     */
    private onIpcMessage(channel: string, event: Electron.Event, payload: AbstractEvent): void {
        if (event.sender === this.window.webContents) { // this window was the sender, fire the handler
            for (const handler of this.ipcHandlers[channel].registeredHandlers) {
                handler(payload);
            }
        }
    }

    /**
     * Fired when the window is ready.
     */
    private onReady(): void {

        // add window to global window array
        AbstractWindow._windows.unshift(this);
        AbstractWindow.updateWindowIndices();

        // fire onBeforePresent
        this.onBeforePresent();

        // present the window to the user
        this.window.show();

    }

}
