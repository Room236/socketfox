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
            .html(message);
        $item.append($body);

        // remove empty message if needed
        const $emptyMessage = $(".log__empty-message");
        if ($emptyMessage.length > 0) {
            $emptyMessage.hide();
        }

        // add log item to log
        $(".log").prepend($item);
    }

    export function escape(message: string) {
        return $("<span></span>").text(message).html();
    }

    export function error(message: string, html: boolean = false) {
        const content = html ? message : escape(message);
        prependMessage("error", content, false);
    }

    export function info(message: string, html: boolean = false) {
        const content = html ? message : escape(message);
        prependMessage("info", content, false);
    }

    export function request(message: string, html: boolean = false) {
        const content = html ? message : escape(message);
        prependMessage("request", content, true);
    }

    export function success(message: string, html: boolean = false) {
        const content = html ? message : escape(message);
        prependMessage("success", content, false);
    }

    export function warn(message: string, html: boolean = false) {
        const content = html ? message : escape(message);
        prependMessage("warning", content, false);
    }

}
