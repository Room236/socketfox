import { AbstractEvent } from "./AbstractEvent";

export class FileRequestEvent extends AbstractEvent {

    public static readonly eventName: string = "FILE_REQUEST";

    public constructor() {
        super();
    }

}
