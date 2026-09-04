/**
 * A credential is either a string or a function that produces one — the
 * function form lets apps mint short-lived tokens from their backend instead
 * of shipping a long-lived key to the browser.
 */
export type AuthSource = string | (() => string | Promise<string>);

export async function resolveAuth(auth: AuthSource | undefined, label: string): Promise<string> {
    const value = typeof auth === "function" ? await auth() : auth;
    if (value === undefined || value === "") throw new Error(`${label}: no API key or token was provided`);
    return value;
}

export async function resolveOptionalAuth(auth: AuthSource | undefined): Promise<string | undefined> {
    const value = typeof auth === "function" ? await auth() : auth;
    return value === "" ? undefined : value;
}
