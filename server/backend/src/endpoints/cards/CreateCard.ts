import { Router, Context } from 'oak';
import WebError from "../../web_error/WebError.ts";
import CardsManager from "../../logic/CardsManager.ts";

class CreateCard {
    private Manager: CardsManager;

    public constructor(router: Router, manager: CardsManager) {
        this.Manager = manager;
        router.post('/api/v1/cards', async (ctx: Context) => {
            try {
                const authHeader = ctx.request.headers.get("Authorization");
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    throw new WebError("Unauthorized", 401, "Falta el token de autorización");
                }
                const token = authHeader.split(" ")[1];
                const body = ctx.request.body({ type: "json" });
                const card = await body.value;
                await this.Manager.CreateCard(token, card);
                ctx.response.body = { message: "Se ha creado la tarjeta correctamente" };

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