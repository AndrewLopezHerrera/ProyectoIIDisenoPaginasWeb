import AccountCRUD from "../databaseconnection/AccountCRUD.ts";
import ValidateAccountCRUD from "../databaseconnection/ValidateAccountCRUD.ts";
import { Account } from "../interfaces/Account.ts";
import { Movement } from "../interfaces/Movement.ts";
import Authorizer from "../security/Authorizer.ts";
import WebError from "../web_error/WebError.ts";

/**
 * Clase encargada de la lógica de las cuentas.
 */
class AccountManager {
    private Connection: AccountCRUD;
    private AuthorizerAccounts: Authorizer;
    private ValidatorAccounts: ValidateAccountCRUD;

    /**
     * Constructor de la clase AccountManager.
     * @param connection Instancia que maneja las operaciones CRUD de las cuentas.
     * @param authorizer Instancia que maneja la autorización de usuarios.
     * @param validator Instancia que maneja la validación de cuentas.
     */
    public constructor(connection: AccountCRUD, authorizer: Authorizer, validator: ValidateAccountCRUD) {
        this.Connection = connection;
        this.AuthorizerAccounts = authorizer;
        this.ValidatorAccounts = validator;
    }

    /**
     * Crea una nueva cuenta.
     * @param data Datos de la cuenta a crear.
     */
    public async CreateAccount(data: Account){
        let seguir = true;
        let iban = "";
        while(seguir){
            iban = this.GenerateRandomIBAN();
            if(!(await this.ValidatorAccounts.ValidateAccountExistence(iban))){
                seguir = false;
            }
        }
        data.funds = 500000;
        data.iban = iban;
        await this.Connection.CreateAccount(data);
    }

    /**
     * Genera un IBAN aleatorio.
     * @param countryCode Código del país (por defecto "CR").
     * @returns IBAN generado.
     */
    private GenerateRandomIBAN(countryCode = "CR"): string {
        countryCode = countryCode.toUpperCase();
        const bankCode = this.RandomDigits(4);
        const branchCode = this.RandomDigits(4);
        const accountNumber = this.RandomDigits(10);
        return `${countryCode}${bankCode}${branchCode}${accountNumber}`;
    }

    /**
     * Genera una cadena de dígitos aleatorios de una longitud dada.
     * @param length Longitud de la cadena a generar.
     * @returns Cadena de dígitos aleatorios.
     */
    private RandomDigits(length: number): string {
        let result = "";
        for (let i = 0; i < length; i++) {
            result += Math.floor(Math.random() * 10).toString();
        }
        return result;
    }

    /**
     * Ve una cuenta específica.
     * @param accountNumber Número de la cuenta a ver.
     * @param jwt Token JWT del usuario que realiza la operación.
     * @returns La cuenta solicitada.
     */
    public async SeeAccount(accountNumber: string, jwt: string): Promise<Account>{
        const account = await this.Connection.SeeAccount(accountNumber);
        if(!await this.AuthorizerAccounts.IsAdministrador(jwt) && !await this.AuthorizerAccounts.IsOwner(jwt, account.iduser)){
            throw new WebError("No autorizado a realizar esta acción", 403);
        }
        return account;
    }

    /**
     * Ve todas las cuentas del usuario asociado al token JWT.
     * @param jwt Token JWT del usuario que realiza la operación.
     * @returns La lista de cuentas del usuario.
     */
    public async SeeAccounts(jwt: string): Promise<Account[]>{
        const idUser = await this.AuthorizerAccounts.GetUserIdFromToken(jwt);
        const accounts = await this.Connection.SeeAccounts(idUser);
        return accounts;
    }

    /**
     * Cambia el estado de una cuenta.
     * @param accountNumber Número de la cuenta a modificar.
     * @param status Nuevo estado de la cuenta.
     * @param jwt Token JWT del usuario que realiza la operación.
     */
    public async SetAccountStatus(accountNumber: string, status: string, jwt: string) : Promise<void>{
        const account = await this.Connection.SeeAccount(accountNumber);
        if(!await this.AuthorizerAccounts.IsAdministrador(jwt) && !await this.AuthorizerAccounts.IsOwner(jwt, account.iduser)){
            throw new WebError("No autorizado a realizar esta acción", 403);
        }
        await this.Connection.SetAccountStatus(accountNumber, status);
    }

    /**
     * Obtiene los movimientos de una cuenta.
     * @param accountNumber Número de la cuenta cuyos movimientos se desean obtener.
     * @param jwt Token JWT del usuario que realiza la operación.
     * @returns Lista de movimientos de la cuenta.
     */
    public async GetAccountMovements(accountNumber: string, jwt: string): Promise<Movement[]> {
        if(!await this.AuthorizerAccounts.IsAdministrador(jwt) && !await this.AuthorizerAccounts.IsOwner(jwt, (await this.Connection.SeeAccount(accountNumber)).iduser)){
            throw new WebError("No autorizado a realizar esta acción", 403);
        }
        return await this.Connection.GetAccountMovements(accountNumber);
    }

    /**
     * Valida si una cuenta existe.
     * @param accountNumber Número de la cuenta a validar.
     * @returns True si la cuenta existe, false en caso contrario.
     */
    public async ValidateAccountExists(accountNumber: string, jwt: string): Promise<boolean> {
        const account = await this.Connection.SeeAccount(accountNumber);
        if(!await this.AuthorizerAccounts.IsAdministrador(jwt) && !await this.AuthorizerAccounts.IsOwner(jwt, account.iduser)){
            throw new WebError("No autorizado a realizar esta acción", 403);
        }
        return await this.ValidatorAccounts.ValidateAccountExistence(accountNumber);
    }
}
export default AccountManager;