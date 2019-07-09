import { AbstractEvent } from "./AbstractEvent";

export class FileAttachEvent extends AbstractEvent {

    public static readonly eventName: string = "FILE_ATTACH";

    public readonly data: Buffer;
    public readonly name: string;

    public constructor(name: string, data: Buffer) {
        super();
        this.name = name;
        this.data = data;
    }

}
