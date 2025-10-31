import AccountCRUD from "../databaseconnection/AccountCRUD.ts";
import TransferCRUD from "../databaseconnection/TransferCRUD.ts";
import { Transfer } from "../interfaces/Transfer.ts";
import Authorizer from "../security/Authorizer.ts";
import WebError from "../web_error/WebError.ts";

/**
 * Clase que gestiona las transferencias entre cuentas.
 */
class TransferManager {
    private ConnectionTransfers: TransferCRUD;
    private AuthorizerUsers: Authorizer;
    private ConnectionAccounts: AccountCRUD;

    /**
     * Constructor de la clase TransferManager.
     * @param connectionTransfers La conexión a la base de datos para las transferencias.
     * @param connectionAccounts La conexión a la base de datos para las cuentas.
     * @param authorizer El objeto que gestiona la autorización de usuarios.
     */
    public constructor(connectionTransfers: TransferCRUD, connectionAccounts: AccountCRUD, authorizer: Authorizer) {
        this.ConnectionTransfers = connectionTransfers;
        this.AuthorizerUsers = authorizer;
        this.ConnectionAccounts = connectionAccounts;
    }

    /**
     * Realiza una transferencia interna entre cuentas.
     * @param transfer Los detalles de la transferencia.
     * @param token El token de autorización del usuario que realiza la transferencia.
     * @throws WebError Si el usuario no está autorizado para realizar la transferencia.
     */
    public async DoInternalTransfer(transfer: Transfer, token: string): Promise<void> {
        const account = await this.ConnectionAccounts.SeeAccount(transfer.from);
        if(!await this.AuthorizerUsers.IsOwner(token, account.iduser)) {
            throw new WebError("Unauthorized transfer attempt", 401, "El usuario no está autorizado para realizar esta transferencia");
        }
        await this.ConnectionTransfers.DoInternalTransfer(transfer);
    }
}

export default TransferManager;