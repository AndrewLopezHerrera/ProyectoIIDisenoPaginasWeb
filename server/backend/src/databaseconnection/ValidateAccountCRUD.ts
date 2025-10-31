import { Client } from "postgresql";

class ValidateAccountCRUD {
    private Connection: Client;

    public constructor(connection: Client) {
        this.Connection = connection;
    }

    public async ValidateAccountExistence(accountNumber: string): Promise<boolean> {
        const result = await this.Connection.queryObject<{ exists: boolean }>(
            "SELECT orbita.fn_validate_iban($1);",
            [accountNumber]
        );
        return result.rows[0].exists;
    }
}

export default ValidateAccountCRUD;