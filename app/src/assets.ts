import * as Path from "path";

export function loadAsset(path: string) {
    return Path.join(__dirname, "../assets", path);
}
