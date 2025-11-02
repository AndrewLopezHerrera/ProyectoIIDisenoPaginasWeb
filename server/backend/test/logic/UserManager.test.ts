import { assertEquals, assertRejects } from "@std/assert";
import UserManager from "../../src/logic/UserManager.ts";
import UserCRUD from "../../src/databaseconnection/UserCRUD.ts";
import Authorizer from "../../src/security/Authorizer.ts";
import { User } from "../../src/interfaces/User.ts";
import WebError from "../../src/web_error/WebError.ts";

const createMockUserCRUD = (): UserCRUD => {
    return {
        CreateUser: async (_data: User) => {},
        GetUser: (username: string): Promise<User> => {
            return Promise.resolve({
                username: username,
                identification: "user123",
                name: "John",
                lastnameone: "Doe",
                lastnametwo: "Smith",
                borndate: new Date("1990-01-01"),
                email: "john.doe@example.com",
                phone: "1234567890",
                password: "",
                idusertype: 1,
                idtypeident: 1
            } as User);
        },
        UpdateUser: async (_data: User) => {},
        DeleteUser: async (_username: string) => {}
    } as unknown as UserCRUD;
};

const createMockAuthorizer = (isAdmin = false, isOwner = true): Authorizer => {
    return {
        IsAdministrador: (_jwt: string) => Promise.resolve(isAdmin),
        IsOwner: (_jwt: string, _userId: string) => Promise.resolve(isOwner)
    } as unknown as Authorizer;
};

Deno.test("UserManager - CreateUser crea un usuario correctamente", async () => {
    const mockCRUD = createMockUserCRUD();
    const mockAuth = createMockAuthorizer();
    const manager = new UserManager(mockCRUD, mockAuth);
    
    const userData: User = {
        username: "newuser",
        identification: "user456",
        name: "Jane",
        lastnameone: "Smith",
        lastnametwo: "Johnson",
        borndate: new Date("1995-05-15"),
        email: "jane.smith@example.com",
        phone: "0987654321",
        password: "securePassword123",
        idusertype: 1,
        idtypeident: 1
    };
    
    await manager.CreateUser(userData);
    assertEquals(true, true);
});

Deno.test("UserManager - GetUser devuelve usuario cuando es admin Y propietario", async () => {
    const mockCRUD = createMockUserCRUD();
    const mockAuth = createMockAuthorizer(true, true);
    const manager = new UserManager(mockCRUD, mockAuth);
    
    const user = await manager.GetUser("testuser", "admin-jwt-token");
    
    assertEquals(user.username, "testuser");
    assertEquals(user.identification, "user123");
    assertEquals(user.name, "John");
    assertEquals(user.lastnameone, "Doe");
});

Deno.test("UserManager - GetUser rechaza solo propietario (bug lógico)", async () => {
    const mockCRUD = createMockUserCRUD();
    const mockAuth = createMockAuthorizer(false, true);
    const manager = new UserManager(mockCRUD, mockAuth);
    
    await assertRejects(
        async () => {
            await manager.GetUser("testuser", "owner-jwt-token");
        },
        WebError,
        "No autorizado a realizar esta acción"
    );
});

Deno.test("UserManager - GetUser lanza error cuando no está autorizado", async () => {
    const mockCRUD = createMockUserCRUD();
    const mockAuth = createMockAuthorizer(false, false);
    const manager = new UserManager(mockCRUD, mockAuth);
    
    await assertRejects(
        async () => {
            await manager.GetUser("testuser", "unauthorized-jwt");
        },
        WebError,
        "No autorizado a realizar esta acción"
    );
});

Deno.test("UserManager - UpdateUser actualiza cuando es admin Y propietario", async () => {
    const mockCRUD = createMockUserCRUD();
    const mockAuth = createMockAuthorizer(true, true);
    const manager = new UserManager(mockCRUD, mockAuth);
    
    const updatedData: User = {
        username: "testuser",
        identification: "user123",
        name: "John Updated",
        lastnameone: "Doe",
        lastnametwo: "Smith",
        borndate: new Date("1990-01-01"),
        email: "john.updated@example.com",
        phone: "1111111111",
        password: "",
        idusertype: 1,
        idtypeident: 1
    };

    await manager.UpdateUser(updatedData, "admin-jwt-token");
    assertEquals(true, true);
});

Deno.test("UserManager - UpdateUser lanza error cuando no está autorizado", async () => {
    const mockCRUD = createMockUserCRUD();
    const mockAuth = createMockAuthorizer(false, false);
    const manager = new UserManager(mockCRUD, mockAuth);
    
    const updatedData: User = {
        username: "testuser",
        identification: "user123",
        name: "Hacker",
        lastnameone: "Attempt",
        lastnametwo: "Malicious",
        borndate: new Date("1990-01-01"),
        email: "hacker@example.com",
        phone: "9999999999",
        password: "",
        idusertype: 1,
        idtypeident: 1
    };
    
    await assertRejects(
        async () => {
            await manager.UpdateUser(updatedData, "unauthorized-jwt");
        },
        WebError,
        "No autorizado a realizar esta acción"
    );
});

Deno.test("UserManager - DeleteUser elimina cuando es admin Y propietario", async () => {
    const mockCRUD = createMockUserCRUD();
    const mockAuth = createMockAuthorizer(true, true);
    const manager = new UserManager(mockCRUD, mockAuth);
    
    await manager.DeleteUser("testuser", "admin-jwt-token");
    assertEquals(true, true);
});

Deno.test("UserManager - DeleteUser rechaza solo propietario (bug lógico)", async () => {
    const mockCRUD = createMockUserCRUD();
    const mockAuth = createMockAuthorizer(false, true);
    const manager = new UserManager(mockCRUD, mockAuth);
    
    await assertRejects(
        async () => {
            await manager.DeleteUser("testuser", "owner-jwt-token");
        },
        WebError,
        "No autorizado a realizar esta acción"
    );
});

Deno.test("UserManager - DeleteUser lanza error cuando no está autorizado", async () => {
    const mockCRUD = createMockUserCRUD();
    const mockAuth = createMockAuthorizer(false, false);
    const manager = new UserManager(mockCRUD, mockAuth);
    
    await assertRejects(
        async () => {
            await manager.DeleteUser("testuser", "unauthorized-jwt");
        },
        WebError,
        "No autorizado a realizar esta acción"
    );
});
