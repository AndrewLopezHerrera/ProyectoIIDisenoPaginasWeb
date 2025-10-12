import { Router, Context } from 'oak';
import WebError from "../../web_error/WebError.ts";

class AccountMovements {

    public constructor(router: Router){
        router.get("/api/v1/accounts/:accountId/movements", async (context: Context) => {
            try {
                const authHeader = context.request.headers.get("Authorization");
                const accountId = context.params.accountId;
                if (!accountId)
                    throw new WebError("Missing account ID", 400, "Falta el ID de la cuenta");
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    throw new WebError("Unauthorized", 401, "Falta el token de autorización");
                }
                const token = authHeader.split(" ")[1];
                // Handle account movements logic here
                context.response.body = { message: "Account movements" };

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

export default AccountMovements;