import EmailManager from "../../src/logic/EmailManager.ts";
import { assertEquals } from "@std/assert";

Deno.test("EmailManager - Envía un correo electrónico exitosamente", async () => {
    const emailManager = new EmailManager();
    const to = "andrewdenilsonlopez@gmail.com";
    const subject = "Prueba de correo electrónico";
    const body = "Este es un correo electrónico de prueba enviado desde EmailManager.";

    try {
        await emailManager.SendEmail(to, subject, body);
        assertEquals(true, true); // Si no hay error, la prueba es exitosa
    } catch (error) {
        console.error("Error al enviar el correo electrónico:", error);
        assertEquals(true, false); // La prueba falla si hay un error
    }
});