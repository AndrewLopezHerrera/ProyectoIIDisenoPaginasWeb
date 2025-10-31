import { Router, Context } from 'oak';
import WebError from "../../web_error/WebError.ts";
import AccountManager from "../../logic/AccountManeger.ts";

class ValidateAccount {
    private Manager: AccountManager;

    public constructor(router: Router, manager: AccountManager){
        this.Manager = manager;
        router.post('/api/v1/accounts/validate', async (ctx: Context) => {
            try {
                const authHeader = ctx.request.headers.get("Authorization");
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    throw new WebError("Unauthorized", 401, "Falta el token de autorización");
                }
                const token = authHeader.split(" ")[1];
                const body = await ctx.request.body().value;
                const { accountNumber, bankCode } = body;
                if (!accountNumber || !bankCode)
                    throw new WebError("Missing parameters", 400, "Faltan parámetros obligatorios en la solicitud");
                const isValid = await this.Manager.ValidateAccountExists(accountNumber, token);
                ctx.response.body = { message: "Account validated successfully", data: { isValid } };

            } catch (error: WebError | unknown) {
                if (error instanceof WebError) {
                    ctx.response.body = { error: error.ToJSON() };
                } else {
                    ctx.response.status = 500;
                    ctx.response.body = { error: "Internal server error" };
                }
            }
        });
    }
}

export default ValidateAccount;