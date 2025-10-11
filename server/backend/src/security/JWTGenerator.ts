import {
  create,
  verify,
  getNumericDate,
  Header,
  Payload,
} from "djwt";
import WebError from "../WebError/WebError.ts";

/**
 * Clase para generar y verificar tokens JWT
 */
class JWTGenerator {
    private Secret: CryptoKey;

    /**
     * Crea una instancia de JWTGenerator con una clave secreta generada aleatoriamente
     * para firmar y verificar tokens JWT.
     * La clave es un buffer de 64 bytes generado con crypto.randomBytes.
     * Se utiliza el algoritmo HS512 para la firma de los tokens.
     */
    public constructor(secret: CryptoKey) {
        this.Secret = secret;
    }


    /**
     * Genera un token JWT
     * @param payload Datos a incluir en el JWT
     * @returns El token JWT generado
     */
    public async Generate(payload: Payload) : Promise<string> {
        const header: Header = {
            alg: "HS512",
            typ: "JWT"
        };
        payload.exp = getNumericDate(60 * 60); // Expira en 1 hora
        const jwt = await create(header, payload, this.Secret);
        return jwt;
    }

    /**
     * Verifica un token JWT
     * @param token El token JWT a verificar
     * @returns La fecha de expiración del token si es válido, undefined si no tiene expiración
     * @throws WebError si el token no es válido
     */
    public async Verify(token: string): Promise<number | undefined> {
        try {
            const payload = await verify(token, this.Secret);
            return payload.exp;
        } catch (_error) {
            throw new WebError("Invalid token", 401, "El token JWT no es válido");
        }
    }
}

export default JWTGenerator;
