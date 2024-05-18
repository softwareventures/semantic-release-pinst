import * as path from "node:path";
import {fork} from "node:child_process";

export async function prepare(
    {pkgRoot}: {readonly pkgRoot?: string | undefined | null},
    {
        cwd,
        logger
    }: {readonly cwd: string; readonly logger: {readonly log: (...args: string[]) => void}}
): Promise<void> {
    logger.log("Disabling postinstall script");
    return pinst(pkgRoot == null ? cwd : path.resolve(cwd, String(pkgRoot)), "--disable");
}

export async function success(
    {pkgRoot}: {readonly pkgRoot?: string | undefined | null},
    {
        cwd,
        logger
    }: {readonly cwd: string; readonly logger: {readonly log: (...args: string[]) => void}}
): Promise<void> {
    logger.log("Re-enabling postinstall script");
    return pinst(pkgRoot == null ? cwd : path.resolve(cwd, String(pkgRoot)), "--enable");
}

export async function fail(
    {pkgRoot}: {readonly pkgRoot?: string | undefined | null},
    {
        cwd,
        logger
    }: {readonly cwd: string; readonly logger: {readonly log: (...args: string[]) => void}}
): Promise<void> {
    logger.log("Re-enabling postinstall script");
    return pinst(pkgRoot == null ? cwd : path.resolve(cwd, String(pkgRoot)), "--enable");
}

async function pinst(cwd: string | URL | undefined, ...args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
        fork(require.resolve("pinst/bin"), args, {cwd})
            .once("error", reject)
            .once("exit", (code, signal) => {
                if (signal != null) {
                    throw new Error(`pinst exited due to ${signal}`);
                } else if (code !== 0) {
                    throw new Error(`pinst exited with error code ${String(code)}`);
                } else {
                    resolve();
                }
            });
    });
}
