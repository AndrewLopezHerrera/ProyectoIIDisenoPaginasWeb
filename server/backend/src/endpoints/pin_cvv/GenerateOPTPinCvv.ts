import { Router, Context } from 'oak';
import WebError from "../../web_error/WebError.ts";
import PINCVVManager from "../../logic/PINCVVManager.ts";

class GenerateOPTPinCvv {
    private Manager: PINCVVManager

    public constructor(router: Router, manager: PINCVVManager) {
        this.Manager = manager;
        router.post('/api/v1/cards/:cardId/otp', async (ctx: Context) => {
            try {
                const authHeader = ctx.request.headers.get("Authorization");
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    throw new WebError("Unauthorized", 401, "Falta el token de autorización");
                }
                const token = authHeader.split(" ")[1];
                const cardId = ctx.request.url.searchParams.get("cardId");
                if (!cardId)
                    throw new WebError("Missing parameters", 400, "Falta el ID de la tarjeta en la solicitud");
                await this.Manager.GenerateOTP(token, cardId);
                ctx.response.body = { message: `OTP PIN/CVV for card ${cardId} generated successfully` };

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

export default GenerateOPTPinCvv;