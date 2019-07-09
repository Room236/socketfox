import { AbstractEvent } from "./AbstractEvent";

export class UpdateInstallEvent extends AbstractEvent {

    public static readonly eventName: string = "UPDATE_INSTALL";

    public constructor() {
        super();
    }

}
