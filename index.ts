import * as path from "node:path";
import {fork} from "node:child_process";

export async function prepare(
    {pkgRoot}: {readonly pkgRoot?: string},
    {
        cwd,
        logger
    }: {readonly cwd: string; readonly logger: {readonly log: (...args: string[]) => void}}
): Promise<void> {
    return new Promise((resolve, reject) => {
        logger.log("Disabling postinstall script");
        fork("pinst", ["--disable"], {
            cwd: pkgRoot == null ? cwd : path.resolve(cwd, String(pkgRoot))
        })
            .once("error", reject)
            .once("close", () => void resolve());
    });
}
