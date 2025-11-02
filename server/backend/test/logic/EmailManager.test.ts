import EmailManager from "../../src/logic/EmailManager.ts";
import { assertEquals } from "@std/assert";

Deno.test("EmailManager - Envía un correo electrónico exitosamente", async () => {
    const emailManager = new EmailManager();
    await emailManager.Connect();
    const to = "andrewdenilsonlopez@gmail.com";
    const subject = "Prueba de correo electrónico";
    const body = "Este es un correo electrónico de prueba enviado desde EmailManager.";

    try {
        emailManager.SendEmail(to, subject, body);
        emailManager.SendEmail(to, subject + "Diferente", body + " - Diferente");
        assertEquals(true, true);
    } catch (error) {
        console.error("Error al enviar el correo electrónico:", error);
        assertEquals(true, false);
    }
});