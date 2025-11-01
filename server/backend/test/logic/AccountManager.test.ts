import { assertEquals, assertRejects } from "@std/assert";
import AccountManager from "../../src/logic/AccountManager.ts";
import AccountCRUD from "../../src/databaseconnection/AccountCRUD.ts";
import Authorizer from "../../src/security/Authorizer.ts";
import ValidateAccountCRUD from "../../src/databaseconnection/ValidateAccountCRUD.ts";
import { Account } from "../../src/interfaces/Account.ts";
import { Movement } from "../../src/interfaces/Movement.ts";
import WebError from "../../src/web_error/WebError.ts";

// Mock de AccountCRUD
const createMockAccountCRUD = (): AccountCRUD => {
    return {
        CreateAccount: async (_data: Account) => {},
        SeeAccount: async (iban: string): Promise<Account> => {
            return {
                iban: iban,
                funds: 1000,
                iduser: "user123",
                idtypemoney: "USD",
                idtypeaccount: "savings",
                status: "active"
            } as Account;
        },
        SeeAccounts: async (idUser: string): Promise<Account[]> => {
            return [{
                iban: "ES1234567890",
                funds: 1000,
                iduser: idUser,
                idtypemoney: "USD",
                idtypeaccount: "savings",
                status: "active"
            } as Account];
        },
        SetAccountStatus: async (_iban: string, _status: string) => {},
        GetAccountMovements: async (_iban: string): Promise<Movement[]> => {
            return [] as Movement[];
        }
    } as unknown as AccountCRUD;
};

// Mock de Authorizer
const createMockAuthorizer = (isAdmin = false, isOwner = true): Authorizer => {
    return {
        IsAdministrador: async (_jwt: string) => isAdmin,
        IsOwner: async (_jwt: string, _userId: string) => isOwner,
        GetUserIdFromToken: async (_jwt: string) => "user123"
    } as unknown as Authorizer;
};

// Mock de ValidateAccountCRUD
const createMockValidateAccountCRUD = (): ValidateAccountCRUD => {
    return {
        ValidateAccountExistence: async (_accountNumber: string) => true
    } as unknown as ValidateAccountCRUD;
};

Deno.test("AccountManager - CreateAccount crea una cuenta correctamente", async () => {
    const mockCRUD = createMockAccountCRUD();
    const mockAuthorizer = createMockAuthorizer();
    const mockValidator = createMockValidateAccountCRUD();
    
    const manager = new AccountManager(mockCRUD, mockAuthorizer, mockValidator);
    
    const accountData: Account = {
        iban: "ES9876543210",
        funds: 5000,
        iduser: "user456",
        idtypemoney: "EUR",
        idtypeaccount: "checking",
        status: "active"
    } as Account;
    
    // Verificar que no lanza error
    await manager.CreateAccount(accountData);
    assertEquals(true, true);
});

Deno.test("AccountManager - SeeAccount devuelve cuenta cuando el usuario es propietario", async () => {
    const mockCRUD = createMockAccountCRUD();
    const mockAuthorizer = createMockAuthorizer(false, true);
    const mockValidator = createMockValidateAccountCRUD();
    
    const manager = new AccountManager(mockCRUD, mockAuthorizer, mockValidator);
    
    const account = await manager.SeeAccount("ES1234567890", "valid-jwt-token");
    
    assertEquals(account.iban, "ES1234567890");
    assertEquals(account.iduser, "user123");
});

Deno.test("AccountManager - SeeAccount lanza error cuando el usuario no está autorizado", async () => {
    const mockCRUD = createMockAccountCRUD();
    const mockAuthorizer = createMockAuthorizer(false, false); // No es admin ni propietario
    const mockValidator = createMockValidateAccountCRUD();
    
    const manager = new AccountManager(mockCRUD, mockAuthorizer, mockValidator);
    
    await assertRejects(
        async () => {
            await manager.SeeAccount("ES1234567890", "invalid-jwt-token");
        },
        WebError,
        "No autorizado a realizar esta acción"
    );
});

Deno.test("AccountManager - SeeAccounts devuelve lista de cuentas del usuario", async () => {
    const mockCRUD = createMockAccountCRUD();
    const mockAuthorizer = createMockAuthorizer();
    const mockValidator = createMockValidateAccountCRUD();
    
    const manager = new AccountManager(mockCRUD, mockAuthorizer, mockValidator);
    
    const accounts = await manager.SeeAccounts("valid-jwt-token");
    
    assertEquals(accounts.length, 1);
    assertEquals(accounts[0].iduser, "user123");
});

Deno.test("AccountManager - SetAccountStatus cambia el estado cuando está autorizado", async () => {
    const mockCRUD = createMockAccountCRUD();
    const mockAuthorizer = createMockAuthorizer(false, true);
    const mockValidator = createMockValidateAccountCRUD();
    
    const manager = new AccountManager(mockCRUD, mockAuthorizer, mockValidator);
    
    // Verificar que no lanza error
    await manager.SetAccountStatus("ES1234567890", "inactive", "valid-jwt-token");
    assertEquals(true, true);
});

Deno.test("AccountManager - GetAccountMovements devuelve movimientos cuando está autorizado", async () => {
    const mockCRUD = createMockAccountCRUD();
    const mockAuthorizer = createMockAuthorizer(false, true);
    const mockValidator = createMockValidateAccountCRUD();
    
    const manager = new AccountManager(mockCRUD, mockAuthorizer, mockValidator);
    
    const movements = await manager.GetAccountMovements("ES1234567890", "valid-jwt-token");
    
    assertEquals(Array.isArray(movements), true);
});

Deno.test("AccountManager - ValidateAccountExists valida existencia de cuenta", async () => {
    const mockCRUD = createMockAccountCRUD();
    const mockAuthorizer = createMockAuthorizer(false, true);
    const mockValidator = createMockValidateAccountCRUD();
    
    const manager = new AccountManager(mockCRUD, mockAuthorizer, mockValidator);
    
    const exists = await manager.ValidateAccountExists("ES1234567890", "valid-jwt-token");
    
    assertEquals(exists, true);
});
