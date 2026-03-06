import {readFile, writeFile} from "node:fs/promises";
import * as path from "node:path";
import {hasProperty} from "unknown";

// Update package.json
async function updatePkg(dir: string, fn: (packageJson: unknown) => unknown): Promise<void> {
    const file = path.join(dir, "package.json");
    const text = await readFile(file, "utf-8");
    const indent = /^ +|\t+/mu.exec(text)?.[0];

    const updated = fn(JSON.parse(text) as unknown);
    const updatedText = JSON.stringify(updated, null, indent);
    return writeFile(file, `${updatedText}\n`);
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

export async function enableAndSave(dir = process.cwd()): Promise<void> {
    return updatePkg(dir, pkg => updateScripts(pkg, enable));
}

export async function disableAndSave(dir = process.cwd()): Promise<void> {
    return updatePkg(dir, pkg => updateScripts(pkg, disable));
}
