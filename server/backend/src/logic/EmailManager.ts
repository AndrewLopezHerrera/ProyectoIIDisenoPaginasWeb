import WebError from "../web_error/WebError.ts";

class EmailManager {

    /**
     * El método constructor de la clase EmailManager.
     */
    public constructor() {
        
    }

    /**
     * Envía un correo electrónico.
     * @param to El destinatario del correo electrónico.
     * @param subject El asunto del correo electrónico.
     * @param body El contenido del correo electrónico.
     */
    public async SendEmail(to: string, subject: string, body: string) : Promise<void> {
        const message = this.createMessage(to, subject, body);
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": "Bearer re_dZP7PmCP_LE4rzwbCFZ9mntAHtHYCxopk",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(message)
        });
        if(!response.ok) {
            throw new WebError("Error al enviar el OTP al correo electrónico", 500);
        }
        const data = await response.json().catch(() => null);
        if(!data || !data.id) {
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
        const message = {
            from: "Acme <onboarding@srlgestock.space>",
            to: [to],
            subject: subject,
            html: "<p>" + body + "</p>",
        };
        return message;
    }
}

export default EmailManager;

/**
 * Ejemplo
 * 
 * curl -X POST 'https://api.resend.com/emails' \
 -H 'Authorization: Bearer re_xxxxxxxxx' \
 -H 'Content-Type: application/json' \
 -d $'{
  "from": "Acme <onboarding@resend.dev>",
  "to": ["delivered@resend.dev"],
  "subject": "hello world",
  "html": "<p>it works!</p>"
}'
 */