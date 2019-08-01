import { AbstractWindow } from "./AbstractWindow";

export class AboutWindow extends AbstractWindow {

    public constructor() {
        super(380, 370, false);
        this.window.setMenu(null);
    }

    protected onAfterClosed(): void {}

    protected onAfterFocus(): void {}

    protected onBeforePresent(): void {}

    protected get viewPath(): string {
        return "views/about.html";
    }
}
