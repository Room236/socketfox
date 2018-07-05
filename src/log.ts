import * as $ from "jquery";

export namespace Log {

    function prependMessage(category: string, message: string, isRequest: boolean) {

        // build new log item
        const $item = $("<li></li>")
            .addClass("log-item")
            .addClass(`log-item--${category}`)
            .addClass(`log-item--${isRequest ? "request" : "response"}`);
        const $body = $("<div></div>")
            .addClass("log-item__body")
            .text(message);
        $item.append($body);

        // remove empty message if needed
        const $emptyMessage = $(".log__empty-message");
        if ($emptyMessage.length > 0) {
            $emptyMessage.hide();
        }

        // add log item to log
        $(".log").prepend($item);
    }

    export function error(message: string) {
        prependMessage("error", message, false);
    }

    export function info(message: string) {
        prependMessage("info", message, false);
    }

    export function request(message: string) {
        prependMessage("request", message, true);
    }

    export function success(message: string) {
        prependMessage("success", message, false);
    }

    export function warn(message: string) {
        prependMessage("warning", message, false);
    }

}
