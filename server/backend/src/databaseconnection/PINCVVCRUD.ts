import { Client } from "postgresql";

class PINCVVCRUD {
    private Connection: Client;

    public constructor(connection: Client) {
        this.Connection = connection;
    }

    public async GenerateOTPPINCVV(identification: string, code: number, minutes: number): Promise<void> {
        await this.Connection.queryObject<void>(
            "CALL orbita.sp_otp_create($1, $2, $3);",
            [identification, code, minutes]
        );
    }

    public async VerifyOTPPINCVV(identification: string, code: number): Promise<boolean> {
        const result = await this.Connection.queryObject(
            "CALL orbita.sp_otp_consume($1, $2);",
            [
                identification,
                code
            ]
        );
        if(result.warnings.toString() == "OTP consumido correctamente para el usuario %".replace("%", identification)){
            return true;
        }
        return false;
    }

}

export default PINCVVCRUD;