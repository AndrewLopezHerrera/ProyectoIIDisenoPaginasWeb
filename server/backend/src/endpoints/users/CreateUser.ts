import {  Router, Context } from 'oak';
import WebError from "../../web_error/WebError.ts";
import UserManager from "../../logic/UserManager.ts";
import { User } from "../../interfaces/User.ts";

class CreateUser {
    private Manager: UserManager;

    public constructor(router: Router, manager: UserManager) {
        this.Manager = manager;
        router.post("/api/v1/users", async (context: Context) => {
            try {
                const body = await context.request.body;
                const user: User = await body.json();
                if (!user.username || !user.email || !user.password)
                    throw new WebError("Missing fields", 400, "Faltan campos obligatorios");
                await this.Manager.CreateUser(user);
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