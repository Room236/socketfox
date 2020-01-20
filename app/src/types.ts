import { Event, IpcMainInvokeEvent } from "electron";

export type WindowPrefs = {
    builderWidth: number;
};

export function implementsIpcMainInvokeEvent(evt: Event): evt is IpcMainInvokeEvent {
    for (const property of ["frameId", "sender"]) {
        if (!(evt.hasOwnProperty(property))) {
            return false;
        }
    }
    return true;
}
