import {  Router, Context } from 'oak';
import WebError from "../../WebError/WebError.ts";

class CreateUser {

    public constructor(router: Router){
        router.post("/api/v1/users", async (context: Context) => {
            try {
                const body = await context.request.body();
                if (body.type !== "json")
                    throw new WebError("Invalid request", 400, "Cuerpo de solicitud no es JSON");
                const { username, email, password } = body.value;
                if (!username || !email || !password)
                    throw new WebError("Missing fields", 400, "Faltan campos obligatorios");
                // Handle user creation logic here
                context.response.body = { message: "User created successfully" };

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

export default CreateUser;