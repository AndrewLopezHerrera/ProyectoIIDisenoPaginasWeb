import { Router, Context } from 'oak';
import WebError from "../../web_error/WebError.ts";
import type { Account } from "../../interfaces/Account.ts";
import AccountManager from "../../logic/AccountManager.ts";

class CreateAccount {
    private Manager: AccountManager;

    public constructor(router: Router, manager: AccountManager) {
        this.Manager = manager;
        router.post("/api/v1/accounts", async (context: Context) => {
            try {
                const body = await context.request.body;
                const datos: Account = await body.json();
                if (!datos.iduser || !datos.funds || !datos.idtypeaccount || !datos.idtypemoney)
                    throw new WebError("Missing fields", 400, "Faltan campos obligatorios");
                 await this.Manager.CreateAccount(datos);
                context.response.body = { message: "Se ha creado exitosamente la cuenta" };
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

export default CreateAccount;