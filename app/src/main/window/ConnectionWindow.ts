import { dialog as Dialog, OpenDialogReturnValue } from "electron";
import { autoUpdater as AutoUpdater } from "electron-updater";
import * as fs from "fs";
import * as path from "path";
import {FileAttachEvent} from "../../common/event/FileAttachEvent";
import { FileRequestEvent } from "../../common/event/FileRequestEvent";
import { UpdateAvailableEvent } from "../../common/event/UpdateAvailableEvent";
import { UpdateInstallEvent } from "../../common/event/UpdateInstallEvent";
import { AbstractWindow } from "./AbstractWindow";

export class ConnectionWindow extends AbstractWindow {

    /**
     * Fired when the user clicks the update install button. Quits the application and installs the update.
     */
    private static onUpdateInstall(event: UpdateInstallEvent): void {
        AutoUpdater.quitAndInstall();
    }

    public constructor() {
        super();

        // listen for user clicking update install button
        this.listenForEvent<UpdateInstallEvent>(UpdateInstallEvent.eventName,
            ConnectionWindow.onUpdateInstall.bind(this));

        // list for request for a file selection dialog
        this.listenForEvent<FileRequestEvent>(FileRequestEvent.eventName, this.onFileRequest.bind(this));
    }

    /**
     * Signals the window to display an update banner.
     *
     * @param isUpdateAllowed Whether automatic updating is allowed.
     */
    public displayUpdateBanner(isUpdateAllowed: boolean): void {
        this.emit(UpdateAvailableEvent.eventName, new UpdateAvailableEvent(isUpdateAllowed));
    }

    protected onAfterClosed(): void {}

    protected onAfterFocus(): void {}

    protected onBeforePresent(): void {}

    protected get viewPath(): string {
        return "views/index.html";
    }

    /**
     * Fired when the UI requests that a file be selected from the disk.
     */
    private onFileRequest(event: FileRequestEvent): void {
        Dialog.showOpenDialog(this.window, {
            "title": "Select attachment"
        })
            .then((result: OpenDialogReturnValue) => {
                if (result.canceled || result.filePaths.length === 0) { // no file was selected, don't do anything
                    return;
                }

                // read the file into a buffer
                fs.readFile(result.filePaths[0], ((err: Error, data: Buffer) => {
                    if (err) { // error occurred, print error to console
                        console.error(err);
                        return;
                    }

                    // send file buffer back to renderer
                    const filePath: string = path.basename(result.filePaths[0]);
                    this.emit(FileAttachEvent.eventName, new FileAttachEvent(filePath, data));
                }));
            });
    }

}
