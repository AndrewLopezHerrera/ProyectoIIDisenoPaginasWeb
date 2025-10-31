import AuthenticationCRUD from "../databaseconnection/AuthenticationCRUD.ts";
import WebError from "../web_error/WebError.ts";
import EmailManager from "./EmailManager.ts";
import UserCRUD from "../databaseconnection/UserCRUD.ts";
import Authorizer from "../security/Authorizer.ts";

/**
 * Clase para gestionar la lógica de autenticación de usuarios.
 */
class AuthenticationManager {
    private Authentication: AuthenticationCRUD;
    private EmailManagerUsers: EmailManager;
    private UserConnection: UserCRUD;
    private AuthorizerUser: Authorizer;

    /**
     * El método constructor de la clase AuthenticationManager.
     * @param authCRUD El CRUD de autenticación.
     * @param emailManager El gestor de correos electrónicos.
     * @param userCRUD El CRUD de usuarios.
     */
    public constructor(authorizer: Authorizer, authCRUD: AuthenticationCRUD, emailManager: EmailManager, userCRUD: UserCRUD) {
        this.Authentication = authCRUD;
        this.EmailManagerUsers = emailManager;
        this.UserConnection = userCRUD;
        this.AuthorizerUser = authorizer;
    }

    /**
     * Inicia sesión en la aplicación.
     * @param identification La identificación del usuario.
     * @param password La contraseña del usuario.
     */
    public Login = async (identification: string, password: string) : Promise<string>=> {
        const user = await this.Authentication.Login(identification, password);
        if(user.identification !== identification){
            throw new WebError("Credenciales inválidas", 401);
        }
        const token = await this.AuthorizerUser.Login(user);
        return token;
    }

    /**
     * Inicia el proceso de recuperación de contraseña.
     * @param username El nombre de usuario o correo electrónico del usuario.
     */
    public RecoverPassword = async (username: string) => {
        const otp = this.GenerateOTP(6);
        const minutesValid = 10;
        const user = await this.UserConnection.GetUser(username);
        await this.Authentication.ForgotPassword(user.identification, otp, minutesValid);
        this.EmailManagerUsers.SendEmail(user.email, "Recuperación de contraseña", `Tu código OTP es: ${otp}`);
    }

    /**
     * Resetea la contraseña del usuario.
     * @param username El nombre de usuario o correo electrónico del usuario.
     * @param otp El código OTP enviado al correo electrónico del usuario.
     */
    public ResetPassword = async (username: string, newPassword: string, otp: string) => {
        const user = await this.UserConnection.GetUser(username);
        const isValid = await this.Authentication.VerifyOTP(user.identification, otp);
        if (!isValid) {
            throw new WebError("OTP inválido", 401);
        }
        await this.Authentication.ResetPassword(user.identification, newPassword);
    }

    /**
     * Genera un código OTP numérico.
     * @param length La longitud del código OTP.
     * @returns El código OTP generado.
     */
    private GenerateOTP = (length: number) : string => {
        const digits = '0123456789';
        let otp = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * digits.length);
            otp += digits[randomIndex];
        }
        return otp;
    }
}
export default AuthenticationManager;