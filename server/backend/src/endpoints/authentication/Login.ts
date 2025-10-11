import { Router, Context  } from "oak";
import WebError from "../../WebError/WebError.ts";

/**
 * Clase para manejar las rutas de autenticación como login, recuperación de contraseña, verificación OTP y restablecimiento de contraseña.
 */
class Login {
    private Router: Router;

    /**
     * El método constructor recibe un enrutador de Oak para definir las rutas de autenticación.
     * @param router El enrutador del API
     */
    constructor(router: Router) {
        this.Router = router;
        this.Login();
        this.ForgotPassword();
        this.VerifyOTP();
        this.ResetPassword();
    }

    /**
     * Manejo de la ruta /api/v1/auth/login
     * Método: POST
     * Descripción: Permite a un usuario iniciar sesión proporcionando su correo electrónico y contraseña.
     * Cuerpo de la solicitud (JSON):
     * {
     *   "email": "<correo electrónico>",
     *   "password": "<contraseña>"
     * }
     */
    private Login() : void{
        this.Router.post("/api/v1/auth/login", async (context: Context) => {
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

    /**
     * Manejo de la ruta /api/v1/auth/forgot-password
     * Método: POST
     * Descripción: Permite a un usuario solicitar un restablecimiento de contraseña proporcionando su correo electrónico.
     * Cuerpo de la solicitud (JSON):
     * {
     *   "email": "<correo electrónico>"
     * }
     */
    private ForgotPassword() : void{
        this.Router.post("/api/v1/auth/forgot-password", async (context: Context) => {
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

    /**
     * Manejo de la ruta /api/v1/auth/verify-otp
     * Método: POST
     * Descripción: Permite a un usuario verificar un código OTP enviado a su correo electrónico.
     * Cuerpo de la solicitud (JSON):
     * {
     *   "email": "<correo electrónico>",
     *   "otp": "<código OTP>"
     * }
     */
    private VerifyOTP() : void{
        this.Router.post("/api/v1/auth/verify-otp", async (context: Context) => {
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

    /**
     * Manejo de la ruta /api/v1/auth/reset-password
     * Método: POST
     * Descripción: Permite a un usuario restablecer su contraseña proporcionando su correo electrónico y la nueva contraseña.
     * Cuerpo de la solicitud (JSON):
     * {
     *   "email": "<correo electrónico>",
     *   "newPassword": "<nueva contraseña>"
     * }
     */
    private ResetPassword() : void{
        this.Router.post("/api/v1/auth/reset-password", async (context: Context) => {
            try {
                const body = await context.request.body();
                if (body.type !== "json")
                    throw new WebError("Invalid request", 400, "Cuerpo de solicitud no es JSON");
                    const { email, newPassword } = body.value;
                    if (!email || !newPassword)
                        throw new WebError("Missing fields", 400, "Faltan campos obligatorios");
                    // Handle password reset logic here
                    context.response.body = { message: "Password reset successful" };
                
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