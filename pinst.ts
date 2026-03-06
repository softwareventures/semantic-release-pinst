import {readFileSync, writeFileSync} from "node:fs";
import * as path from "node:path";

// Update package.json
function updatePkg(dir: string, fn: (packageJson: unknown) => void): void {
    // Pkg path
    const file = path.join(dir, "package.json");

    // Read pkg
    let data = readFileSync(file, "utf-8");
    const pkg = JSON.parse(data) as unknown;

    // Update pkg object
    fn(pkg);

    // Stringify pkg
    const regex = /^[ ]+|\t+/m;
    const res = regex.exec(data);
    const indent = res ? res[0] : null;
    data = JSON.stringify(pkg, null, indent);

    // Write pkg
    writeFileSync(file, `${data}\n`);
}

// Update pkg.scripts names
function updateScripts(pkg: unknown, fn: (name: string) => string): void {
    pkg.scripts = Object.fromEntries(
        Object.entries(pkg.scripts).map(([key, value]) => [fn(key), value] as const)
    );
}

function enable(name: string): string {
    if (["_install", "_postinstall"].includes(name)) {
        return name.substring(1);
    }

    return name;
}

function disable(name: string): string {
    if (["install", "postinstall"].includes(name)) {
        return `_${name}`;
    }

    return name;
}

function enableAndSave(dir = process.cwd()): void {
    updatePkg(dir, pkg => updateScripts(pkg, enable));
}

function disableAndSave(dir = process.cwd()): void {
    updatePkg(dir, pkg => updateScripts(pkg, disable));
}

module.exports = {
    enableAndSave,
    disableAndSave
};
