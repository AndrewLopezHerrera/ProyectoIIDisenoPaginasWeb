import { Router, Context } from 'oak';
import WebError from "../../WebError/WebError.ts";

class InternalTransfers {
    
    public constructor(router: Router){
        router.post("/api/v1/transfers/internal", async (context: Context) => {
            try {
                const authHeader = context.request.headers.get("Authorization");
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    throw new WebError("Unauthorized", 401, "Falta el token de autorización");
                }
                const token = authHeader.split(" ")[1];
                const body = await context.request.body();
                if (body.type !== "json")
                    throw new WebError("Invalid request", 400, "Cuerpo de solicitud no es JSON");
                const { fromAccountId, toAccountId, amount } = body.value;
                if (!fromAccountId || !toAccountId || !amount)
                    throw new WebError("Missing parameters", 400, "Faltan parámetros en la solicitud");
                // Handle internal transfer logic here
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