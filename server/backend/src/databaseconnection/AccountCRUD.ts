import { Sql } from "postgres";

class AccountCRUD {
    private Connection: Sql<{}>;

    public constructor(connection: Sql<{}>) {
        this.Connection = connection;
    }

    public async CreateAccount(username: string, passwordHash: string, isAdmin: boolean): Promise<void> {
        await this.Connection`
            INSERT INTO accounts (username, password_hash, is_admin)
            VALUES (${username}, ${passwordHash}, ${isAdmin})
        `;
    }
}

export default AccountCRUD;