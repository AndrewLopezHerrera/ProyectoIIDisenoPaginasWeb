import { Router, Context } from 'oak';
import WebError from "../../web_error/WebError.ts";

class GetCards {

    public constructor(router: Router){
        router.get('/api/v1/cards', async (ctx: Context) => {
            try {
                const authHeader = ctx.request.headers.get("Authorization");
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    throw new WebError("Unauthorized", 401, "Falta el token de autorización");
                }
                const token = authHeader.split(" ")[1];
                // Handle card retrieval logic here
                ctx.response.body = { message: "Cards retrieved successfully" };

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

export default GetCards;