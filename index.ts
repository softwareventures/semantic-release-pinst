import {resolve} from "node:path";
import {disableAndSave, enableAndSave} from "./pinst";

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
