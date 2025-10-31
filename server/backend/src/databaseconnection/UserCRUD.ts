import { Client } from "postgresql";
import { User } from "../interfaces/User.ts";

/**
 * Clase para gestionar operaciones CRUD de usuarios en la base de datos.
 */
class UserCRUD {
    private Connection: Client;
    
    /**
     * El método constructor de la clase UserCRUD.
     * @param connection El cliente SQL que está conectado en la base de datos.
     */
    public constructor(connection: Client) {
        this.Connection = connection;
    }

    /**
     * Obtiene un usuario por su nombre de usuario o correo electrónico.
     * @param username El nombre de usuario o correo electrónico del usuario.
     * @returns El usuario correspondiente.
     */
    public async GetUser(username: string) : Promise<User>{
        const result = await this.Connection.queryObject<User>(
            "CALL orbita.sp_auth_user_get_by_username_or_email($1);",
            [username]
        );
        return result.rows[0];
    }

    /**
     * Crea un nuevo usuario en la base de datos.
     * @param data Los datos del usuario a crear.
     */
    public async CreateUser(data: User): Promise<void> {
        await this.Connection.queryObject("CALL public.sp_registrar_usuario($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
            [
                data.identification,
                data.username,
                data.name,
                data.lastnameone,
                data.lastnametwo,
                data.borndate,
                data.email,
                data.phone,
                data.password,
                data.idusertype,
                data.idtypeident
            ]
        );
    }

    /**
     * Actualiza un usuario en la base de datos.
     * @param data Los nuevos datos del usuario.
     */
    public async UpdateUser(data: User): Promise<void> {
        await this.Connection.queryObject("CALL public.sp_actualizar_usuario($1, $2, $3, $4)",
            [
                data.identification,
                data.email,
                data.phone,
                data.password
            ]
        );
    }

    /**
     * Elimina un usuario de la base de datos.
     * @param identification El número de identificación del usuario a eliminar.
     */
    public async DeleteUser(identification: string): Promise<void> {
        await this.Connection.queryObject("CALL public.sp_eliminar_usuario($1)",
            [identification]
        );
    }
}

export default UserCRUD;