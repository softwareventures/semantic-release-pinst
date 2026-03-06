import {readFileSync, writeFileSync} from "node:fs";
import * as path from "node:path";
import {hasProperty} from "unknown";

// Update package.json
function updatePkg(dir: string, fn: (packageJson: unknown) => unknown): void {
    // Pkg path
    const file = path.join(dir, "package.json");

    // Read pkg
    let data = readFileSync(file, "utf-8");

    // Update pkg object
    const pkg = fn(JSON.parse(data) as unknown);

    // Stringify pkg
    const regex = /^ +|\t+/mu;
    const res = regex.exec(data);
    const indent = res == null ? undefined : res[0];
    data = JSON.stringify(pkg, null, indent);

    // Write pkg
    writeFileSync(file, `${data}\n`);
}

// Update pkg.scripts names
function updateScripts(pkg: unknown, fn: (name: string) => string): unknown {
    if (
        typeof pkg === "object" &&
        hasProperty(pkg, "scripts") &&
        typeof pkg.scripts === "object" &&
        pkg.scripts != null
    ) {
        return {
            ...pkg,
            scripts: Object.fromEntries(
                Object.entries(pkg.scripts).map(([key, value]) => [fn(key), value] as const)
            )
        };
    } else {
        return pkg;
    }
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

export function enableAndSave(dir = process.cwd()): void {
    updatePkg(dir, pkg => updateScripts(pkg, enable));
}

export function disableAndSave(dir = process.cwd()): void {
    updatePkg(dir, pkg => updateScripts(pkg, disable));
}
