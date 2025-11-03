import { Context, Router } from "oak";
import WebError from "../../web_error/WebError.ts";
import AccountManager from "../../logic/AccountManager.ts";

class SeeAccount {
    private Manager: AccountManager;

    public constructor(router: Router, manager: AccountManager) {
        this.Manager = manager;
        router.get("/api/v1/account/:accountId", async (context: Context) => {
            try {
                const authHeader = context.request.headers.get("Authorization");
                const accountId = context.request.url.searchParams.get("accountId");
                if (!accountId)
                    throw new WebError("Missing account ID", 400, "Falta el ID de la cuenta");
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    throw new WebError("Unauthorized", 401, "Falta el token de autorización");
                }
                const token = authHeader.split(" ")[1];
                const account = await this.Manager.SeeAccount(accountId, token);
                context.response.body = { message: "Cuenta extraída", data: account };

            } catch (error: WebError | unknown) {
                if (error instanceof WebError) {
                    context.response.body = { error: error.ToJSON() };
                } else {
                    context.response.status = 500;
                    context.response.body = { error: "Internal server error" };
                }
            }
        });
    }
}

export default SeeAccount;