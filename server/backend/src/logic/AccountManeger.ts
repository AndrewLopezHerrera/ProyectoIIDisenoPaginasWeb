import AccountCRUD from "../databaseconnection/AccountCRUD.ts";
import UserCRUD from "../databaseconnection/UserCRUD.ts";
import { Account } from "../interfaces/Account.ts";
import { Movement } from "../interfaces/Movement.ts";
import Authorizer from "../security/Authorizer.ts";
import WebError from "../web_error/WebError.ts";

class AccountManager {
    private Connection: AccountCRUD;
    private AuthorizerAccounts: Authorizer;

    public constructor(connection: AccountCRUD, authorizer: Authorizer) {
        this.Connection = connection;
        this.AuthorizerAccounts = authorizer;
    }

    public async CreateAccount(data: Account){
        await this.Connection.CreateAccount(data);
    }

    public async SeeAccount(accountNumber: string, jwt: string): Promise<Account>{
        const account = await this.Connection.SeeAccount(accountNumber);
        if(!await this.AuthorizerAccounts.IsAdministrador(jwt) || !await this.AuthorizerAccounts.IsOwner(jwt, account.iduser)){
            throw new WebError("No autorizado a realizar esta acción", 403);
        }
        return account;
    }

    public async SeeAccounts(jwt: string): Promise<Account[]>{
        const idUser = await this.AuthorizerAccounts.GetUserIdFromToken(jwt);
        const accounts = await this.Connection.SeeAccounts(idUser);
        return accounts;
    }

    public async SetAccountStatus(accountNumber: string, status: string, jwt: string) : Promise<void>{
        const account = await this.Connection.SeeAccount(accountNumber);
        if(!await this.AuthorizerAccounts.IsAdministrador(jwt) || !await this.AuthorizerAccounts.IsOwner(jwt, account.iduser)){
            throw new WebError("No autorizado a realizar esta acción", 403);
        }
        await this.Connection.SetAccountStatus(accountNumber, status);
    }

    public async GetAccountMovements(accountNumber: string, jwt: string): Promise<Movement[]> {
        if(!await this.AuthorizerAccounts.IsAdministrador(jwt) || !await this.AuthorizerAccounts.IsOwner(jwt, (await this.Connection.SeeAccount(accountNumber)).iduser)){
            throw new WebError("No autorizado a realizar esta acción", 403);
        }
        return await this.Connection.GetAccountMovements(accountNumber);
    }
}
export default AccountManager;