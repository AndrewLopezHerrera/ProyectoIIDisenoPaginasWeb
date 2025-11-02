import { Router, Context  } from "oak";
import WebError from "../../web_error/WebError.ts";
import AuthenticationManager from "../../logic/AuthenticationManager.ts";

/**
 * Clase para manejar las rutas de autenticación como login, recuperación de contraseña, verificación OTP y restablecimiento de contraseña.
 */
class Login {
    private Manager: AuthenticationManager;

    /**
     * El método constructor recibe un enrutador de Oak para definir las rutas de autenticación.
     * @param router El enrutador del API
     */
    constructor(router: Router, manager: AuthenticationManager) {
        this.Manager = manager;
        router.post("/api/v1/auth/login", async (context: Context) => {
            try {
                const body = context.request.body;
                const { email, password } = await body.json();
                if (!email || !password)
                    throw new WebError("Missing fields", 400, "Faltan campos obligatorios");
                const token = await this.Manager.Login(email, password);
                context.response.body = { message: "Login successful", token };

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

export default Login;