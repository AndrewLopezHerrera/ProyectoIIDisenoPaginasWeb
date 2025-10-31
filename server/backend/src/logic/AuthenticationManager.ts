import { Client } from "postgresql";
import AuthenticationCRUD from "../databaseconnection/AuthenticationCRUD.ts";
import WebError from "../web_error/WebError.ts";
import Authorizer from "../security/Authorizer.ts";

class AuthenticationManager {
    private AuthorizerUsers: Authorizer;
    private Authentication: AuthenticationCRUD;

    public constructor(authorizer: Authorizer, authCRUD: AuthenticationCRUD) {
        this.AuthorizerUsers = authorizer;
        this.Authentication = authCRUD;
    }

    public Login = async (identification: string, password: string) => {
        const user = await this.Authentication.Login(identification, password);
        if(user.identification !== identification){
            throw new WebError("Credenciales inválidas", 401);
        }

    }

    public RecoverPassword = async (identification: string) => {
        await this.Authentication.RecoverPassword(identification);
    }

    private GenerateTempPassword = (length: number) : string => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
        let tempPassword = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            tempPassword += chars[randomIndex];
        }
        return tempPassword;
    }

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