import { Router, Context } from 'oak';
import WebError from "../../WebError/WebError.ts";

class UpdateUser {

    public constructor(router: Router){
        router.put("/api/v1/users/:id", async (context: Context) => {
            try {
                const id = context.params.id;
                const authHeader = context.request.headers.get("Authorization");
                if (!id)
                    throw new WebError("Missing user ID", 400, "Falta el ID de usuario");
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    throw new WebError("Unauthorized", 401, "Falta el token de autorización");
                }
                const token = authHeader.split(" ")[1];
                // Handle update user logic here
                context.response.body = { message: `User with ID: ${id} updated successfully` };

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