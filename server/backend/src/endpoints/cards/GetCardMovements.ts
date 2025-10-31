import { Router, Context } from 'oak';
import WebError from "../../web_error/WebError.ts";
import CardsManager from "../../logic/CardsManager.ts";

class GetCardMovements {
    private Manager: CardsManager;

    public constructor(router: Router, manager: CardsManager) {
        this.Manager = manager;
        router.get('/api/v1/cards/:cardId/movements', async (ctx: Context) => {
            try {
                const authHeader = ctx.request.headers.get("Authorization");
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    throw new WebError("Unauthorized", 401, "Falta el token de autorización");
                }
                const token = authHeader.split(" ")[1];
                const cardId = ctx.params.cardId;
                if (!cardId)
                    throw new WebError("Missing parameters", 400, "Falta el ID de la tarjeta en la solicitud");
                
                ctx.response.body = { message: `Movements for card ${cardId} retrieved successfully` };

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

export default GetCardMovements;