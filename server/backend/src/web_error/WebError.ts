/**
 * WebError.ts
 * Clase para manejar errores web con códigos de estado HTTP y mensajes personalizados.
 */
class WebError extends Error {
    private StatusCode: number;
    private Detail?: string;

    /**
     * Crea una instancia de WebError
     * @param message Mensaje del error
     * @param statusCode Código de estado HTTP (por defecto 500)
     * @param detail Detalle adicional del error (opcional)
     */
    constructor(message: string, statusCode: number = 500, detail?: string) {
        super(message);
        this.StatusCode = statusCode;
        this.Detail = detail;
    }

    /**
     * Obtiene el código de estado HTTP del error
     * @returns El código de estado HTTP.
     */
    public GetStatusCode(): number {
        return this.StatusCode;
    }

    /**
     * Obtiene el nombre del código de estado HTTP.
     * @param statusCode El código de estado HTTP.
     * @returns El nombre del código de estado HTTP.
     */
    private GetNameStatusCode(statusCode: number): string {
        const statusNames: { [key: number]: string } = {
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not Found",
            405: "Method Not Allowed",
            500: "Internal Server Error",
            502: "Bad Gateway",
            503: "Service Unavailable",
            504: "Gateway Timeout",
        };
        return statusNames[statusCode] || "Error";
    }

    /**
     * Convierte el error a un objeto JSON con detalles del error.
     * @returns Un objeto JSON con detalles del error.
     */
    public ToJSON() {
        return {
            error: this.GetNameStatusCode(this.StatusCode),
            message: this.message,
            status: this.StatusCode,
            timestamp: new Date().toISOString(),
            path: "<request_path>",
            detail: this.Detail
        };
    }
}

export default WebError;
