import { Router, Context } from "oak";
import WebError from "../../web_error/WebError.ts";

/**
 * Clase para manejar la ruta de verificación OTP.
 */
class VerifyOTP {

    /**
     * El método constructor recibe un enrutador de Oak para definir la ruta de verificación OTP.
     * @param router El enrutador del API.
     */
    public constructor(router: Router) {
        router.post("/api/v1/auth/verify-otp", async (context: Context) => {
            try {
                const body = await context.request.body();
                if (body.type !== "json")
                    throw new WebError("Invalid request", 400, "Cuerpo de solicitud no es JSON");
                const { email, otp } = body.value;
                if (!email || !otp)
                    throw new WebError("Missing fields", 400, "Faltan campos obligatorios");
                // Handle OTP verification logic here
                context.response.body = { message: "OTP verified successfully" };

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

export default VerifyOTP;