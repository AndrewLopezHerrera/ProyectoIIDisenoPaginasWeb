import { Router, Context } from 'oak';
import WebError from "../../WebError/WebError.ts";

class InsertMovement {

    public constructor(router: Router){
        router.post('/api/v1/cards/:cardId/movements', async (ctx: Context) => {
            try {
                const authHeader = ctx.request.headers.get("Authorization");
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    throw new WebError("Unauthorized", 401, "Falta el token de autorización");
                }
                const token = authHeader.split(" ")[1];
                const cardId = ctx.params.cardId;
                if (!cardId)
                    throw new WebError("Missing parameters", 400, "Falta el ID de la tarjeta en la solicitud");
                const body = await ctx.request.body();
                if (body.type !== "json")
                    throw new WebError("Invalid request", 400, "Cuerpo de solicitud no es JSON");
                const { amount, description } = body.value;
                if (!amount || !description)
                    throw new WebError("Missing parameters", 400, "Faltan parámetros en la solicitud");
                // Handle movement insertion logic here
                ctx.response.body = { message: `Movement for card ${cardId} inserted successfully` };

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

export default InsertMovement;