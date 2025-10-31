import { Context, Router } from "oak";
import WebError from "../../web_error/WebError.ts";
import AccountManager from "../../logic/AccountManeger.ts";

class SetStateAccount {
    private Manager: AccountManager;

    public constructor(router: Router, manager: AccountManager) {
        this.Manager = manager;
        router.post("/api/v1/accounts/:accountId/status", async (context: Context) => {
            try {
                const authHeader = context.request.headers.get("Authorization");
                const accountId = context.params.accountId;
                if (!accountId)
                    throw new WebError("Missing account ID", 400, "Falta el ID de la cuenta");
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    throw new WebError("Unauthorized", 401, "Falta el token de autorización");
                }
                const token = authHeader.split(" ")[1];
                const body = await context.request.body();
                if (body.type !== "json")
                    throw new WebError("Invalid request", 400, "Cuerpo de solicitud no es JSON");
                const { status } = body.value;
                if (typeof status !== "string")
                    throw new WebError("Invalid status", 400, "El estado debe ser una cadena");
                await this.Manager.SetAccountStatus(accountId, status, token);
                context.response.body = { message: "Estado de la cuenta actualizado exitosamente" };

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

export default SetStateAccount;
