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

export async function enableAndSave(dir = process.cwd()): Promise<void> {
    return rewritePackageJson(dir, pkg =>
        renameScripts(pkg, name =>
            ["_install", "_postinstall"].includes(name) ? name.substring(1) : name
        )
    );
}

export async function disableAndSave(dir = process.cwd()): Promise<void> {
    return rewritePackageJson(dir, pkg =>
        renameScripts(pkg, name => (["install", "postinstall"].includes(name) ? `_${name}` : name))
    );
}
