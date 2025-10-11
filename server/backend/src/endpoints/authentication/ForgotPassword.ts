import { Router, Context } from "oak";
import WebError from "../../WebError/WebError.ts";

/**
 * Clase para manejar la ruta de recuperación de contraseña.
 */
class ForgotPassword {

    /**
     * El método constructor recibe un enrutador de Oak para definir la ruta de recuperación de contraseña.
     * @param router El enrutador del API.
     */
    public constructor(router: Router) {
        router.post("/api/v1/auth/forgot-password", async (context: Context) => {
            try {
                const body = await context.request.body();
                if (body.type !== "json")
                    throw new WebError("Invalid request", 400, "Cuerpo de solicitud no es JSON");
                const { email } = body.value;
                if (!email)
                    throw new WebError("Missing fields", 400, "Faltan campos obligatorios");
                // Handle forgot password logic here
                context.response.body = { message: "Password reset link sent" };

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

export default ForgotPassword;