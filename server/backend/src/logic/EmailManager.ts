import WebError from "../web_error/WebError.ts";
import { SMTPClient } from "smtp";

class EmailManager {
    private Client: SMTPClient | null = null;

    /**
     * El método constructor de la clase EmailManager.
     */
    public constructor() {}

    public async Connect() {
        // denomailer establece la conexión durante send(); aquí solo configuramos el cliente
        this.Client = new SMTPClient({
            connection: {
                hostname: "smtp.zoho.com",
                port: 465,
                tls: true,
                auth: {
                    username: "bancoorbita@zohomail.com",
                    password: "gyoHAMST4858.",
                },
            },
        });
        // No hay conexión previa; send() gestiona el handshake. Mantenemos async para compatibilidad con tests.
        await Promise.resolve();
    }

    /**
     * Envía un correo electrónico.
     * @param to El destinatario del correo electrónico.
     * @param subject El asunto del correo electrónico.
     * @param body El contenido del correo electrónico.
     */
    public SendEmail(to: string, subject: string, body: string) : void {
        const message = this.createMessage(to, subject, body);
        if (!this.Client) {
            throw new WebError("El cliente SMTP no está conectado.", 500);
        }
        try {
            this.Client.send(message);
        }
        catch (error) {
            if (error instanceof Error) {
                console.error("Error al enviar el correo electrónico:", error.message);
                throw new WebError(`Error al enviar el correo electrónico: ${error.message}`, 500);
            }
            else {
                console.error("Error desconocido al enviar el correo electrónico.");
                throw new WebError("Error desconocido al enviar el correo electrónico.", 500);
            }
        }
    }

    /**
     * El método para crear el mensaje de correo electrónico.
     * @param to El destinatario del correo electrónico.
     * @param subject El asunto del correo electrónico.
     * @param body El contenido del correo electrónico.
     * @returns El mensaje de correo electrónico creado.
     */
    private createMessage(to: string, subject: string, body: string) {
        const message = {
            from: "bancoorbita@zohomail.com",
            to: to,
            subject: subject,
            html: `<html>
                    <body>
                        <h1>Banco Órbita</h1>
                        <p>${body}</p>
                    </body>
                </html>`,
        };
        return message;
    }
}

export default EmailManager;