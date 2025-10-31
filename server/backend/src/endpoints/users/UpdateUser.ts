import { Router, Context } from 'oak';
import WebError from "../../web_error/WebError.ts";
import { User } from "../../interfaces/User.ts";
import UserManager from "../../logic/UserManager.ts";

class UpdateUser {
    private Manager: UserManager;

    public constructor(router: Router, manager: UserManager) {
        this.Manager = manager;
        router.put("/api/v1/users/:id", async (context: Context) => {
            try {
                const body = await context.request.body();
                if (body.type !== "json")
                    throw new WebError("Invalid request", 400, "Cuerpo de solicitud no es JSON");
                const userData: User = body.value;
                const authHeader = context.request.headers.get("Authorization");
                if (!userData.identification)
                    throw new WebError("Missing user ID", 400, "Falta el ID de usuario");
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    throw new WebError("Unauthorized", 401, "Falta el token de autorización");
                }
                const token = authHeader.split(" ")[1];
                await this.Manager.UpdateUser(userData, token);
                context.response.body = { message: "Se ha actualizado el usuario correctamente" };

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

export default UpdateUser;