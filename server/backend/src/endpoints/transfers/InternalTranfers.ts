import { Router, Context } from 'oak';
import WebError from "../../web_error/WebError.ts";
import TransferManager from "../../logic/TransferManager.ts";
import { Transfer } from "../../interfaces/Transfer.ts";

class InternalTransfers {
    private Manager: TransferManager;

    public constructor(router: Router, manager: TransferManager) {
        this.Manager = manager;
        router.post("/api/v1/transfers/internal", async (context: Context) => {
            try {
                const authHeader = context.request.headers.get("Authorization");
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    throw new WebError("Unauthorized", 401, "Falta el token de autorización");
                }
                const token = authHeader.split(" ")[1];
                const body = context.request.body;
                const transfer: Transfer = await body.json();
                if (!transfer.from || !transfer.to || !transfer.amount)
                    throw new WebError("Missing parameters", 400, "Faltan parámetros en la solicitud");
                await this.Manager.DoInternalTransfer(transfer, token);
                context.response.body = { message: "Internal transfer successful" };

            } catch (error: WebError | unknown) {
                if (error instanceof WebError) {
                    context.response.body = { error: error.ToJSON() };
                } else {
                    context.response.status = 500;
                    context.response.body = { error: "Internal server error" };
                }
            }
        });
    }
}

export default InternalTransfers;