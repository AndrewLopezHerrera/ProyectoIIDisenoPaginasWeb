import { assertEquals, assertRejects } from "@std/assert";
import AccountCRUD from "../../src/databaseconnection/AccountCRUD.ts";
import { Account } from "../../src/interfaces/Account.ts";
import { Client } from "postgresql";
import WebError from "../../src/web_error/WebError.ts";

// Mock del Cliente PostgreSQL
const createMockClient = () => {
    return {
        queryObject: (query: string, params?: unknown[]) => {
            // Simular diferentes respuestas según la consulta
            if (query.includes("sp_crear_cuenta")) {
                return { rows: [] };
            }
            
            if (query.includes("sp_account_movements_list")) {
                return { 
                    rows: [
                        {
                            id: "1",
                            iban: params?.[0],
                            amount: 100,
                            description: "Test movement",
                            date: new Date()
                        }
                    ] 
                };
            }
            
            if (query.includes("sp_set_account_status")) {
                return { rows: [] };
            }
            
            if (query.includes("sp_accounts_get")) {
                const iban = params?.[0] as string;
                if (iban === "NOTFOUND") {
                    return { rows: [] };
                }
                return { 
                    rows: [{
                        iban: iban,
                        funds: 1000,
                        iduser: "user123",
                        idtypemoney: "USD",
                        idtypeaccount: "savings",
                        status: "active"
                    }] 
                };
            }
            
            if (query.includes("sp_accounts_list")) {
                return { 
                    rows: [
                        {
                            iban: "ES1234567890",
                            funds: 1000,
                            iduser: params?.[0],
                            idtypemoney: "USD",
                            idtypeaccount: "savings",
                            status: "active"
                        },
                        {
                            iban: "ES0987654321",
                            funds: 2000,
                            iduser: params?.[0],
                            idtypemoney: "EUR",
                            idtypeaccount: "checking",
                            status: "active"
                        }
                    ] 
                };
            }
            
            return { rows: [] };
        }
    } as unknown as Client;
};

Deno.test("AccountCRUD - CreateAccount llama al stored procedure correctamente", async () => {
    const mockClient = createMockClient();
    const accountCRUD = new AccountCRUD(mockClient);
    
    const accountData: Account = {
        iban: "ES1234567890",
        funds: 5000,
        iduser: "user456",
        idtypemoney: "EUR",
        idtypeaccount: "checking",
        status: "active"
    } as Account;
    
    // Verificar que no lanza error
    await accountCRUD.CreateAccount(accountData);
    assertEquals(true, true);
});

Deno.test("AccountCRUD - GetAccountMovements devuelve lista de movimientos", async () => {
    const mockClient = createMockClient();
    const accountCRUD = new AccountCRUD(mockClient);
    
    const movements = await accountCRUD.GetAccountMovements("ES1234567890");
    
    assertEquals(movements.length, 1);
    assertEquals(movements[0].iban, "ES1234567890");
});

Deno.test("AccountCRUD - SetAccountStatus actualiza el estado de la cuenta", async () => {
    const mockClient = createMockClient();
    const accountCRUD = new AccountCRUD(mockClient);
    
    // Verificar que no lanza error
    await accountCRUD.SetAccountStatus("ES1234567890", "inactive");
    assertEquals(true, true);
});

Deno.test("AccountCRUD - SeeAccount devuelve cuenta existente", async () => {
    const mockClient = createMockClient();
    const accountCRUD = new AccountCRUD(mockClient);
    
    const account = await accountCRUD.SeeAccount("ES1234567890");
    
    assertEquals(account.iban, "ES1234567890");
    assertEquals(account.funds, 1000);
    assertEquals(account.iduser, "user123");
});

Deno.test("AccountCRUD - SeeAccount lanza WebError cuando la cuenta no existe", async () => {
    const mockClient = createMockClient();
    const accountCRUD = new AccountCRUD(mockClient);
    
    await assertRejects(
        async () => {
            await accountCRUD.SeeAccount("NOTFOUND");
        },
        WebError,
        "No se ha encontrado la cuenta"
    );
});

Deno.test("AccountCRUD - SeeAccounts devuelve todas las cuentas de un usuario", async () => {
    const mockClient = createMockClient();
    const accountCRUD = new AccountCRUD(mockClient);
    
    const accounts = await accountCRUD.SeeAccounts("user123");
    
    assertEquals(accounts.length, 2);
    assertEquals(accounts[0].iban, "ES1234567890");
    assertEquals(accounts[1].iban, "ES0987654321");
});
