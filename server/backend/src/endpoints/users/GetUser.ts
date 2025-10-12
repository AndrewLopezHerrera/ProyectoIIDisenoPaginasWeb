import { Router, Context } from 'oak';
import WebError from "../../WebError/WebError.ts";

class GetUser {

    public constructor(router: Router){
        router.get("/api/v1/users/:identification", async (context: Context) => {
            try {
                const identification = context.params.identification;
                const authHeader = context.request.headers.get("Authorization");
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    throw new WebError("Unauthorized", 401, "Falta el token de autorización");
                }
                const token = authHeader.split(" ")[1];
                if (context.request.body.type !== "json")
                    throw new WebError("Invalid request", 400, "Cuerpo de solicitud no es JSON");
                if (!identification)
                    throw new WebError("Missing user ID", 400, "Falta el ID de usuario");
                // Handle get user logic here
                context.response.body = { message: `User data for ID: ${identification}` };

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

export default GetUser;