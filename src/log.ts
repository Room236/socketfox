import * as $ from "jquery";

export namespace Log {

    function appendMessage(category: string, message: string) {
        const $item = $("<li></li>")
            .addClass("log-item")
            .addClass(`log-item--${category}`);
        const $body = $("<div></div>")
            .addClass("log-item__body")
            .text(message);

        $item.append($body);
        $(".log").append($item);
    }

    export function error(message: string) {
        appendMessage("error", message);
    }

    export function info(message: string) {
        appendMessage("info", message);
    }

    export function request(message: string) {
        appendMessage("request", message);
    }

    export function success(message: string) {
        appendMessage("success", message);
    }

    export function warn(message: string) {
        appendMessage("warning", message);
    }

}
