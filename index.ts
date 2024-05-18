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
        fork(require.resolve("pinst/bin"), ["--disable"], {
            cwd: pkgRoot == null ? cwd : path.resolve(cwd, String(pkgRoot))
        })
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
