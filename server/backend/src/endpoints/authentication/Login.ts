import { Router, Context  } from "oak";
import WebError from "../../WebError/WebError.ts";

/**
 * Clase para manejar las rutas de autenticación como login, recuperación de contraseña, verificación OTP y restablecimiento de contraseña.
 */
class Login {

    /**
     * El método constructor recibe un enrutador de Oak para definir las rutas de autenticación.
     * @param router El enrutador del API
     */
    constructor(router: Router) {
        router.post("/api/v1/auth/login", async (context: Context) => {
            try {
                const body = await context.request.body();
                if (body.type !== "json")
                    throw new WebError("Invalid request", 400, "Cuerpo de solicitud no es JSON");
                    const { email, password } = body.value;
                    if (!email || !password)
                        throw new WebError("Missing fields", 400, "Faltan campos obligatorios");
                    // Handle login logic here
                    context.response.body = { message: "Login successful" };
                
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