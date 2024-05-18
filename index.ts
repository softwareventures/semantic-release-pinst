import {resolve} from "node:path";
import * as pinst from "pinst";

export async function prepare(
    {pkgRoot}: {readonly pkgRoot?: string},
    {cwd}: {readonly cwd: string}
): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    pinst.disableAndSave(pkgRoot == null ? cwd : resolve(cwd, pkgRoot));
}
