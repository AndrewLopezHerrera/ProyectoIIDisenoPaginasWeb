import { Router, Context } from 'oak';
import WebError from "../../web_error/WebError.ts";
import UserManager from "../../logic/UserManager.ts";

class GetUser {
    private Manager: UserManager;

    public constructor(router: Router, manager: UserManager){
        this.Manager = manager;
        router.get("/api/v1/users/:identification", async (context: Context) => {
            try {
                const identification = context.request.url.searchParams.get("identification");
                const authHeader = context.request.headers.get("Authorization");
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    throw new WebError("Unauthorized", 401, "Falta el token de autorización");
                }
                const token = authHeader.split(" ")[1];
                if (!identification)
                    throw new WebError("Missing user ID", 400, "Falta el ID de usuario");
                const user = await this.Manager.GetUser(identification, token);
                context.response.body = { user };

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