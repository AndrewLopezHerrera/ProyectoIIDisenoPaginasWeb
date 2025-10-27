import postgres, { Sql } from "postgres";


/**
 * Esta clase conecta el API con la base de datos PostgreSQL.
 */
class DataBaseIni {
    private static readonly HOST: string = 'localhost';
    private static readonly PORT: number = 5432;
    private static readonly USER: string = 'root';
    private static readonly PASSWORD: string = 'password';
    private static readonly DATABASE: string = 'my_database';
    private static connection : Sql<{}> | null = null;

    public static initConection() {
        const data = {
            host: this.HOST,
            port: this.PORT,
            user: this.USER,
            password: this.PASSWORD,
            database: this.DATABASE,
        };
        this.connection = postgres(data);
    }

    public static getConnection() : Sql<{}> {
        if (this.connection === null) {
            throw new Error("Database connection is not initialized.");
        }
        return this.connection;
    }

}

export default DataBaseIni;