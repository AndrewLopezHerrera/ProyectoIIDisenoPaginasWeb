import { Client } from "postgresql";
import type { Account } from "../interfaces/Account.ts";

class AccountCRUD {
    private Connection: Client;

    public constructor(connection: Client) {
        this.Connection = connection;
    }

    public async CreateAccount(data: Account): Promise<void> {
        await this.Connection.queryObject("CALL public.sp_crear_cuenta($1, $2, $3, $4, $5)",
            [
                data.iban,
                data.funds,
                data.iduser,
                data.idtypemoney,
                data.idtypeaccount
            ]
        );
    }

    
}

export default AccountCRUD;