import { Client } from "postgresql";


/**
 * Esta clase conecta el API con la base de datos PostgreSQL.
 */
class DataBaseIni {
    private static readonly HOST: string = '134.199.141.222';
    private static readonly PORT: number = 15435;
    private static readonly USER: string = 'user_orbita';
    private static readonly PASSWORD: string = 'pR6#hV71zX';
    private static readonly DATABASE: string = 'fecr_orbita';
    private static connection : Client | null = null;

    public static async initConection() {
        const data = {
            hostname: this.HOST,
            port: this.PORT,
            user: this.USER,
            password: this.PASSWORD,
            database: this.DATABASE,
        };
        this.connection = new Client(data);
        await this.connection.connect();
    }

    public static getConnection() : Client {
        if (this.connection === null) {
            throw new Error("Database connection is not initialized.");
        }
        return this.connection;
    }

}

export default DataBaseIni;