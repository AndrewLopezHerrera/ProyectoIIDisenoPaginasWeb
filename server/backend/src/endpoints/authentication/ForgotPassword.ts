import { Router, Context } from "oak";
import WebError from "../../web_error/WebError.ts";
import AuthenticationManager from "../../logic/AuthenticationManager.ts";

/**
 * Clase para manejar la ruta de recuperación de contraseña.
 */
class ForgotPassword {
    private Manager: AuthenticationManager;

    /**
     * El método constructor recibe un enrutador de Oak para definir la ruta de recuperación de contraseña.
     * @param router El enrutador del API.
     */
    public constructor(router: Router, manager: AuthenticationManager) {
        this.Manager = manager;
        router.post("/api/v1/auth/forgot-password", async (context: Context) => {
            try {
                const body = context.request.body;
                const { email } = await body.json();
                if (!email)
                    throw new WebError("Missing fields", 400, "Faltan campos obligatorios");
                await this.Manager.RecoverPassword(email);
                context.response.body = { message: "Se ha enviado un OTP de restablecimiento de contraseña a su correo" };

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