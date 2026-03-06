import path, {resolve} from "node:path";
import {readFile, writeFile} from "node:fs/promises";
import {hasProperty} from "unknown";

export async function prepare(
    {pkgRoot}: {readonly pkgRoot?: string | undefined | null},
    {
        cwd,
        logger
    }: {readonly cwd: string; readonly logger: {readonly log: (...args: string[]) => void}}
): Promise<void> {
    logger.log("Disabling postinstall script");
    return disableAndSave(resolvePackageDir(pkgRoot, cwd));
}

export async function success(
    {pkgRoot}: {readonly pkgRoot?: string | undefined | null},
    {
        cwd,
        logger
    }: {readonly cwd: string; readonly logger: {readonly log: (...args: string[]) => void}}
): Promise<void> {
    logger.log("Re-enabling postinstall script");
    return enableAndSave(resolvePackageDir(pkgRoot, cwd));
}

function resolvePackageDir(pkgRoot: string | undefined | null, cwd: string): string {
    return pkgRoot == null ? cwd : resolve(cwd, String(pkgRoot));
}

export const fail = success;

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

async function enableAndSave(dir = process.cwd()): Promise<void> {
    return rewritePackageJson(dir, pkg =>
        renameScripts(pkg, name =>
            ["_install", "_postinstall"].includes(name) ? name.substring(1) : name
        )
    );
}

async function disableAndSave(dir = process.cwd()): Promise<void> {
    return rewritePackageJson(dir, pkg =>
        renameScripts(pkg, name => (["install", "postinstall"].includes(name) ? `_${name}` : name))
    );
}
