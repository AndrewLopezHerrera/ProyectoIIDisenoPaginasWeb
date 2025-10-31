import { Client } from "postgresql";
import type { Account } from "../interfaces/Account.ts";
import type { Movement } from "../interfaces/Movement.ts";
import WebError from "../web_error/WebError.ts";

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

    public async GetAccountMovements(iban: string): Promise<Movement[]> {
        const result = await this.Connection.queryObject<Movement>("SELECT orbita.sp_account_movements_list($1)", [iban]);
        return result.rows as Movement[];
    }

    public async SetAccountStatus(iban: string, status: string){
        await this.Connection.queryObject("CALL public.sp_set_account_status($1, $2)", [iban, status]);
    }

    public async SeeAccount(iban: string): Promise<Account> {
        const result = await this.Connection.queryObject<Account>("SELECT orbita.sp_accounts_get($1)", [iban]);
        const accounts = result.rows;
        const account = accounts.find(acc => acc.iban === iban);
        if (!account) {
            throw new WebError("No se ha encontrado la cuenta", 404);
        }
        return account;
    }

    public async SeeAccounts(idUsuario: string): Promise<Account[]> {
        const result = await this.Connection.queryObject<Account>("SELECT orbita.sp_accounts_list($1)", [idUsuario]);
        return result.rows;
    }
}
export default AccountCRUD;