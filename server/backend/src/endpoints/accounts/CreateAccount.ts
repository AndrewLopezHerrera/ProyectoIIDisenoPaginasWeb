import { Router, Context } from 'oak';
import WebError from "../../web_error/WebError.ts";

class CreateAccount {

    public constructor(router: Router) {
        router.post("/api/v1/accounts", async (context: Context) => {
            try {
                const body = await context.request.body();
                if (body.type !== "json")
                    throw new WebError("Invalid request", 400, "Cuerpo de solicitud no es JSON");
                const {
                    typeIdentification,
                    identification,
                    userName,
                    name,
                    lastName1,
                    lastName2,
                    bornDate,
                    email,
                    phone,
                    password
                } = body.value;
                if (!typeIdentification || !identification || !userName || !name || !lastName1 
                    || !lastName2 || !bornDate || !email || !phone || !password)
                    throw new WebError("Missing fields", 400, "Faltan campos obligatorios");
                // Handle account creation logic here
                context.response.body = { message: "Account created successfully" };

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