import { User } from "../interfaces/User.ts";
import JWTGenerator from "./JWTGenerator.ts";
import { hash, compare, genSalt } from "bcrypt";
import { Payload } from "djwt";
import WebError from "../web_error/WebError.ts";

/**
 * Clase para manejar la autorización de usuarios, incluyendo el inicio de sesión y la generación de tokens JWT.
 */
class Authorizer {
    private jwtGenerator: JWTGenerator;

    constructor(jwtGenerator: JWTGenerator) {
        this.jwtGenerator = jwtGenerator;
    }

    /**
     * Inicia sesión un usuario y genera un token JWT.
     * @param user La información del usuario.
     * @param inputPassword La contraseña ingresada por el usuario.
     * @returns Un token JWT si las credenciales son válidas.
     */
    public async Login(user: User): Promise<string> {
        const payload: Payload = {
            id: user.identification,
            email: user.email,
            role: user.idusertype == 2 ? "administrator" : "user"
        };
        return await this.jwtGenerator.Generate(payload);
    }

    /**
     * Verifica si el usuario tiene el rol de administrador.
     * @param jwt El token JWT del usuario.
     * @returns true si el usuario es administrador, false en caso contrario.
     */
    public async IsAdministrador(jwt: string): Promise<boolean> {
        const payload = await this.jwtGenerator.Verify(jwt);
        if(!payload) {
            throw new WebError("Token inválido", 401);
        }
        return payload.role === "administrator";
    }

    /**
     * Verifica si el usuario es el propietario del recurso.
     * @param jwt El token JWT del usuario.
     * @param userId El ID del usuario propietario del recurso.
     * @returns true si el usuario es el propietario, false en caso contrario.
     */
    public async IsOwner(jwt: string, userId: string): Promise<boolean> {
        const payload = await this.jwtGenerator.Verify(jwt);
        if(!payload) {
            throw new WebError("Token inválido", 401);
        }
        return payload.id === userId;
    }

    /**
     * Genera un hash a partir de una contraseña.
     * @param password La contraseña a hashear.
     * @returns El hash de la contraseña.
     */
    public async HashPassword(password: string): Promise<string> {
        const salt = await genSalt(10);
        const hashedPassword = await hash(password, salt);
        return hashedPassword;
    }

    /**
     * Obtiene los datos del token JWT.
     * @param jwt El token JWT.
     * @returns Los datos del payload del token.
     */
    private async GetDataFromToken(jwt: string): Promise<Payload> {
        const payload = await this.jwtGenerator.Verify(jwt);
        if(!payload) {
            throw new WebError("Token inválido", 401);
        }
        return payload;
    }

    public async GetUserIdFromToken(jwt: string): Promise<string> {
        const payload = await this.GetDataFromToken(jwt);
        return payload.id as string;
    }
}

export default Authorizer;