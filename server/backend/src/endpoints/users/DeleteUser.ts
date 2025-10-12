import { Router, Context } from 'oak';
import WebError from "../../web_error/WebError.ts";

class DeleteUser {

    public constructor(router: Router){
        router.delete("/api/v1/users/:id", async (context: Context) => {
            try {
                const id = context.params.id;
                const authHeader = context.request.headers.get("Authorization");
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    throw new WebError("Unauthorized", 401, "Falta el token de autorización");
                }
                const token = authHeader.split(" ")[1];

                if (!id)
                    throw new WebError("Missing user ID", 400, "Falta el ID de usuario");
                
                context.response.body = { message: `User with ID: ${id} deleted successfully` };

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

export default DeleteUser;