import { User } from "../interfaces/User.ts";
import UserCRUD from "../databaseconnection/UserCRUD.ts";
import Authorizer from "../security/Authorizer.ts";
import WebError from "../web_error/WebError.ts";

/**
 * Clase para gestionar la lógica de usuarios.
 */
class UserManager {
    private Connection: UserCRUD;
    private AuthorizerUsers: Authorizer;

    /**
     * El método constructor de la clase UserManager.
     * @param connection El CRUD de usuarios conectado a la base de datos.
     * @param authorizer El objeto encargado de la autorización de usuarios.
     */
    public constructor(connection: UserCRUD, authorizer: Authorizer) {
        this.Connection = connection;
        this.AuthorizerUsers = authorizer;
    }

    /**
     * El método para crear un usuario.
     * @param data Los datos del usuario a crear.
     */
    public async CreateUser(data: User){
        await this.Connection.CreateUser(data);
    }

    /**
     * El método para eliminar un usuario.
     * @param username El nombre del usuario a eliminar.
     * @param jwt El token del usuario que realiza la acción.
     */
    public async DeleteUser(username: string, jwt: string){
        const user: User = await this.Connection.GetUser(username);
        if(!await this.AuthorizerUsers.IsAdministrador(jwt) || !await this.AuthorizerUsers.IsOwner(jwt, user.identification)){
            throw new WebError("No autorizado a realizar esta acción", 403);
        }
        await this.Connection.DeleteUser(user.identification);
    }

    /**
     * El método para actualizar un usuario.
     * @param data Los nuevos datos del usuario.
     * @param jwt El token del usuario que realiza la acción.
     */
    public async UpdateUser(data: User, jwt: string){
        const user: User = await this.Connection.GetUser(data.username);
        if(!await this.AuthorizerUsers.IsAdministrador(jwt) || !await this.AuthorizerUsers.IsOwner(jwt, user.identification)){
            throw new WebError("No autorizado a realizar esta acción", 403);
        }
        user.email = data.email ? data.email : user.email;
        user.phone = data.phone ? data.phone : user.phone;
        user.password = data.password ? data.password : user.password;
        await this.Connection.UpdateUser(user);
    }

    /**
     * El método para obtener un usuario.
     * @param username El nombre del usuario a obtener.
     * @param jwt El token del usuario que realiza la acción.
     * @returns El usuario solicitado.
     */
    public async GetUser(username: string, jwt: string): Promise<User>{
        const user: User = await this.Connection.GetUser(username);
        if(!await this.AuthorizerUsers.IsAdministrador(jwt) || !await this.AuthorizerUsers.IsOwner(jwt, user.identification)){
            throw new WebError("No autorizado a realizar esta acción", 403);
        }
        user.password = "";
        return user;
    }
}

export default UserManager;