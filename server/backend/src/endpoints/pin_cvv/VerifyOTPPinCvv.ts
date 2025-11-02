import { Router, Context } from 'oak';
import WebError from "../../web_error/WebError.ts";
import PINCVVManager from "../../logic/PINCVVManager.ts";

class VerifyOTPPinCvv {
    private Manager: PINCVVManager

    public constructor(router: Router, manager: PINCVVManager){
        this.Manager = manager;
        router.post('/api/v1/cards/:cardId/view-details', async (ctx: Context) => {
            try {
                const authHeader = ctx.request.headers.get("Authorization");
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    throw new WebError("Unauthorized", 401, "Falta el token de autorización");
                }
                const token = authHeader.split(" ")[1];
                const body = ctx.request.body;
                const { otp, cardID } = await body.json();
                if (!cardID)
                    throw new WebError("Missing parameters", 400, "Falta el ID de la tarjeta en la solicitud");
                const card = await this.Manager.ValidateOTP(cardID, otp, token);
                ctx.response.body = { card };

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

export default VerifyOTPPinCvv;