import { Router, Context } from "oak";
import WebError from "../../web_error/WebError.ts";
import AuthenticationManager from "../../logic/AuthenticationManager.ts";

/**
 * Clase para manejar la ruta de restablecimiento de contraseña.
 */
class ResetPassword {
    private Manager: AuthenticationManager;

    /**
     * El método constructor recibe un enrutador de Oak para definir la ruta de restablecimiento de contraseña.
     * @param router El enrutador del API.
     */
    public constructor(router: Router, manager: AuthenticationManager) {
        this.Manager = manager;
        router.post("/api/v1/auth/reset-password", async (context: Context) => {
            try {
                const body = await context.request.body();
                if (body.type !== "json")
                    throw new WebError("Invalid request", 400, "Cuerpo de solicitud no es JSON");
                const { email, newPassword, otp } = body.value;
                if (!email || !newPassword || !otp)
                    throw new WebError("Missing fields", 400, "Faltan campos obligatorios");
                await this.Manager.ResetPassword(email, newPassword, otp);
                context.response.body = { message: "Password reset successfully" };

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

export default ResetPassword;