import { Client } from "postgresql";
import { User } from "../interfaces/User.ts";

class AuthenticationCRUD {
    private Connection: Client;

    public constructor(connection: Client) {
        this.Connection = connection;
    }

    public async Login(username: string, password: string): Promise<User> {
        const result = await this.Connection.queryObject<User>("CALL orbita.sp_auth_login($1, $2)", [username, password]);
        return result.rows[0];
    }

    public async ForgotPassword(identification: string, code: string, minutesValid: number): Promise<void> {
        await this.Connection.queryObject("CALL orbita.sp_otp_create($1, $2, $3)", [identification, code, minutesValid]);
    }

    public async VerifyOTP(identification: string, code: string): Promise<boolean> {
        const result = await this.Connection.queryObject<{ is_valid: boolean }>(
            "CALL orbita.sp_otp_consume($1, $2)",
            [identification, code]
        );
        //Obtener el mensaje de RAISE NOTICE
        if (result.warnings.toString() == "OTP consumido correctamente para el usuario %".replace("%", identification)) {
            return true;
        }
        return false;
    }

    public async ResetPassword(identification: string, newPassword: string): Promise<void> {
        await this.Connection.queryObject("CALL orbita.sp_auth_change_password($1, $2)", [identification, newPassword]);
    }
}

export default AuthenticationCRUD;