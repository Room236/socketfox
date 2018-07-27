/*
 * pretty-print
 * Format any JS data as a human-readable string
 * Version 1.0.0
 *
 * Author: Richard Kriesman
 * Git Repo: https://gitlab.com/room236/packages/pretty-print.git
 *
 * Copyright © Room236 Technologies, LLC
 */

export type PrintablePrimitive = string | number | boolean | null | undefined;
export type Printable = object | PrintablePrimitive | object[] | PrintablePrimitive[];

export namespace PrettyPrint {

    /**
     * Formats the {@link Printable} data into a pretty-printed string.
     *
     * @param {Printable} data The data to be formatted.
     * @returns {string} A string representation of the data.
     */
    export function format(data: Printable): string {
        if (data === null || ["undefined", "string", "number", "boolean"].indexOf(typeof data) >= 0) { // primitives
            return Formatter.formatPrimitive(<PrintablePrimitive>data);
        } else if (Array.isArray(data)) { // array
            return Formatter.formatArray(data);
        } else { // object
            return Formatter.formatObject(<object>data);
        }
    }

    export namespace Formatter {

        /**
         * Formats an array of {@link Printable} values as a pretty-printed string.
         *
         * @param {Printable[]} data The array to format
         * @returns {string} The formatted string representation.
         */
        export function formatArray(data: Printable[]): string {
            let output: string = "";

            // add array type
            output += `{Array}\n`;

            // print array data
            for (const elem of data) {
                output += `  - ${Indentation.increaseIndent(format(elem), 1)}`;
            }

            return output;
        }

        /**
         * Formats an object into a pretty-printed string.
         *
         * @param {object} obj The object to format.
         * @returns {string} The formatted string representation.
         */
        export function formatObject(obj: object): string {
            let output: string = "";

            // print constructor name if possible
            const constructorName: string = typeof obj === "object" ? obj.constructor.name : undefined;
            if (constructorName !== undefined)
                output += `{${constructorName}}\n`;

            // build array of object property keys, including everything in its prototype chain
            /* tslint:disable:forin */
            const keys = [];
            for (const key in obj) {
                // noinspection JSUnfilteredForInLoop
                keys.push(key);
            }
            /* tslint:enable:forin */

            // determine longest key - we'll determine the alignment of types and primitives using this
            let longestKeyLength: number = 0;
            for (const key of keys) {
                if (key.length > longestKeyLength)
                    longestKeyLength = key.length;
            }

            // add object properties to output
            for (const key of keys) {
                output += `${Indentation.indent(1)}${key}:`;

                // add extra indentation as needed to align the values
                for (let i = key.length; i < longestKeyLength + 1; i++)
                    output += " ";

                output += Indentation.increaseIndent(format(obj[key]), 1);
            }

            return output;
        }

        /**
         * Formats a primitive value as a string pretty-printed string.
         *
         * @param {string | number | boolean} val The primitive value to print.
         * @returns {string} The formatted string representation.
         */
        export function formatPrimitive(val: PrintablePrimitive): string {
            if (val === null)
                return "(null)\n";
            switch (typeof val) {
                case "string":
                    if (val === "")
                        return "(empty)\n";
                    else
                        return `${val}\n`;
                case "number":
                case "boolean":
                    return `${val}\n`;
                case "undefined":
                    return "(undefined)\n";
                default:
                    return "(unknown)\n";
            }
        }

    }

    export namespace Indentation {

        /**
         * Increases the indentation of a string by the specified number of indentation levels.
         *
         * @param {string} str The string to indent
         * @param {number} level The number of indentation levels to add
         * @returns {string} The newly indented string
         */
        export function increaseIndent(str: string, level: number) {
            return str.replace(/\n(?=.+\n)/g, `\n${indent(level)}`);
        }

        /**
         * Creates an indentation string containing 4 spaces for every indentation level.
         *
         * @param {number} level The indentation level.
         * @return {string} The string containing the correct level of indentation.
         */
        export function indent(level: number): string {
            let str: string = "";
            for (let i = 0; i < level; i++)
                str += "    ";
            return str;
        }

    }

}
