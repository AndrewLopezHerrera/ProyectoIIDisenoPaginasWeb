import { Client } from "postgresql";

class TransferCRUD {
    private Connection: Client;

    public constructor(connection: Client) {
        this.Connection = connection;
    }

    public async DoInternalTransfer(origin: string, destination: string, amount: number, detail: string): Promise<void> {
        await this.Connection.queryObject<void>(
            "CALL orbita.sp_transfer_between_accounts($1, $2, $3, $4);",
            [origin, destination, amount, detail]
        );
    }
}

export default TransferCRUD;