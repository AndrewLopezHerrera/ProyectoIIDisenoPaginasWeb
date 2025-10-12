import { Router, Context } from 'oak';
import WebError from "../../web_error/WebError.ts";

class CreateCard {

    public constructor(router: Router){
        router.post('/api/v1/cards', async (ctx: Context) => {
            try {
                const authHeader = ctx.request.headers.get("Authorization");
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    throw new WebError("Unauthorized", 401, "Falta el token de autorización");
                }
                const token = authHeader.split(" ")[1];
                const body = await ctx.request.body();
                if (body.type !== "json")
                    throw new WebError("Invalid request", 400, "Cuerpo de solicitud no es JSON");
                const { cardNumber, cardHolder, expirationDate, cvv } = body.value;
                if (!cardNumber || !cardHolder || !expirationDate || !cvv)
                    throw new WebError("Missing parameters", 400, "Faltan parámetros en la solicitud");
                // Handle card creation logic here
                ctx.response.body = { message: "Card created successfully" };

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

export default CreateCard;