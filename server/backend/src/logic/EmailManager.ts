import { createMessage } from "@upyo/core";
import { ResendTransport } from "@upyo/resend";
import WebError from "../web_error/WebError.ts";

class EmailManager {
    private Transport: ResendTransport;

    /**
     * El método constructor de la clase EmailManager.
     */
    public constructor() {
        this.Transport = new ResendTransport({apiKey: "re_dZP7PmCP_LE4rzwbCFZ9mntAHtHYCxopk"});
    }

    /**
     * Envía un correo electrónico.
     * @param to El destinatario del correo electrónico.
     * @param subject El asunto del correo electrónico.
     * @param body El contenido del correo electrónico.
     */
    public async SendEmail(to: string, subject: string, body: string) : Promise<void> {
        const message = this.createMessage(to, subject, body);
        const response = await this.Transport.send(message);
        if(!response.successful) {
            throw new WebError("Error al enviar el OTP al correo electrónico", 500);
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
        const message = createMessage({
            from: "security@bancoorbita.com",
            to: to,
            subject: subject,
            content: { text: body },
        });
        return message;
    }
}

export default EmailManager;