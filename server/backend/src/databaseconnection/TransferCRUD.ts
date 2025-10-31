import { Client } from "postgresql";
import { Transfer } from "../interfaces/Transfer.ts";

class TransferCRUD {
    private Connection: Client;

    public constructor(connection: Client) {
        this.Connection = connection;
    }

    public async DoInternalTransfer(transfer: Transfer): Promise<void> {
        await this.Connection.queryObject<void>(
            "CALL orbita.sp_transfer_between_accounts($1, $2, $3, $4);",
            [transfer.from, transfer.to, transfer.amount, transfer.details || null]
        );
    }
}

export default TransferCRUD;