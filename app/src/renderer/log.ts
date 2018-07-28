import * as $ from "jquery";

enum LogLevel {
    INFO = "info",
    SUCCESS = "success",
    WARNING = "warning",
    ERROR = "error"
}

export enum LogType {
    REQUEST = "request",
    RESPONSE = "response",
    SERVICE = "service"
}

export namespace Log {

    function prependMessage(message: string, type: LogType, level?: LogLevel) {

        // escape the message and format it to valid html
        let safeMessage: string = $("<span></span>")
            .text(message)
            .html()
            .replace(/ /g, "&nbsp;")
            .replace(/[\r\n]+/g, "<br/>");

        // add highlighting for anything that references a variable
        safeMessage = safeMessage.replace(/\${[a-zA-Z0-9]+}/g,
            (match: string) => `<span class="log-text-variable">${match}</span>`);

        // create a new log row
        const $row = $("<li></li>")
            .addClass("log-row");
        if (type === LogType.REQUEST) { // requests are floated right, the row needs a clearfix
            $row.addClass("clearfix");
        }

        // build new log item inside the row
        const $item = $("<div></div>")
            .addClass("log-item")
            .addClass(`log-item--${type}`);
        if (level) {
            $item.addClass(`log-item--${level}`);
        }

        // create the body
        const $body = $("<div></div>")
            .addClass("log-item__body")
            .html(safeMessage);
        $item.append($body);
        $row.append($item);

        // remove empty message if needed
        const $emptyMessage = $(".log__empty-message");
        if ($emptyMessage.length > 0) {
            $emptyMessage.hide();
        }

        // add log item to log
        $(".log").prepend($row);
    }

    export function clear() {
        $(".log").find(":not(.log__empty-message)").remove();
        $(".log__empty-message").show();
    }

    export function escape(message: string) {
        return $("<span></span>").text(message).html();
    }

    export function error(message: string, type: LogType) {
        prependMessage(message, type, LogLevel.ERROR);
    }

    export function info(message: string, type: LogType) {
        prependMessage(message, type, LogLevel.INFO);
    }

    export function print(message: string) {
        prependMessage(message, LogType.SERVICE);
    }

    export function success(message: string, type: LogType) {
        prependMessage(message, type, LogLevel.SUCCESS);
    }

    export function warn(message: string, type: LogType) {
        prependMessage(message, type, LogLevel.WARNING);
    }

}
