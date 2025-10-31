import { Router, Context } from 'oak';
import WebError from "../../web_error/WebError.ts";
import AccountManager from "../../logic/AccountManager.ts";

class SeeAccounts {
    private Manager: AccountManager;

    public constructor(router: Router, manager: AccountManager){
        this.Manager = manager;
        router.get("/api/v1/accounts/:id", async (context: Context) => {
            try {
                const authHeader = context.request.headers.get("Authorization");
                const id = context.params.id;
                if (!id)
                    throw new WebError("Missing account ID", 400, "Falta el ID de la cuenta");
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    throw new WebError("Unauthorized", 401, "Falta el token de autorización");
                }
                const token = authHeader.split(" ")[1];
                const accounts = await this.Manager.SeeAccounts(token);
                context.response.body = { message: "Lista de cuentas", data: accounts };

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

export default SeeAccounts;