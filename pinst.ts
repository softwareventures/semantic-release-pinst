import {readFile, writeFile} from "node:fs/promises";
import * as path from "node:path";
import {hasProperty} from "unknown";

async function rewritePackageJson(
    dir: string,
    fn: (packageJson: unknown) => unknown
): Promise<void> {
    const file = path.join(dir, "package.json");
    const text = await readFile(file, "utf-8");
    const indent = /^ +|\t+/mu.exec(text)?.[0];

    const updated = fn(JSON.parse(text) as unknown);
    const updatedText = JSON.stringify(updated, null, indent);
    return writeFile(file, `${updatedText}\n`);
}

function renameScripts(packageJson: unknown, rename: (name: string) => string): unknown {
    if (
        typeof packageJson === "object" &&
        hasProperty(packageJson, "scripts") &&
        typeof packageJson.scripts === "object" &&
        packageJson.scripts != null
    ) {
        return {
            ...packageJson,
            scripts: Object.fromEntries(
                Object.entries(packageJson.scripts).map(
                    ([key, value]) => [rename(key), value] as const
                )
            )
        };
    } else {
        return packageJson;
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
    return rewritePackageJson(dir, pkg => renameScripts(pkg, enable));
}

export async function disableAndSave(dir = process.cwd()): Promise<void> {
    return rewritePackageJson(dir, pkg => renameScripts(pkg, disable));
}
