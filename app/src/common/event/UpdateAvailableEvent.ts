import { AbstractEvent } from "./AbstractEvent";

export class UpdateAvailableEvent extends AbstractEvent {

    public static readonly eventName: string = "UPDATE_AVAILABLE";

    /**
     * Whether the user should be given the option to automatically install the update.
     */
    public readonly isInstallAllowed: boolean;

    /**
     * @param allowInstall Whether to allow the user to install the update automatically.
     */
    public constructor(allowInstall: boolean) {
        super();
        this.isInstallAllowed = allowInstall;
    }

}
