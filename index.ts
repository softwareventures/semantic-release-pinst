import * as pinst from "pinst";

export async function prepare(
    pluginConfig: unknown,
    context: {readonly cwd: string}
): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    pinst.disableAndSave(context.cwd);
}
