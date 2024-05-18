import {resolve} from "node:path";
import * as pinst from "pinst";

export async function prepare(
    {pkgRoot}: {readonly pkgRoot?: string},
    {
        cwd,
        logger
    }: {readonly cwd: string; readonly logger: {readonly log: (...args: string[]) => void}}
): Promise<void> {
    logger.log("Disabling postinstall script");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    pinst.disableAndSave(pkgRoot == null ? cwd : resolve(cwd, String(pkgRoot)));
}
