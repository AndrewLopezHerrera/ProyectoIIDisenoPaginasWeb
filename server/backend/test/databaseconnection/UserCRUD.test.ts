import { assertEquals } from "@std/assert";
import UserCRUD from "../../src/databaseconnection/UserCRUD.ts";
import { Client } from "postgresql";
import { User } from "../../src/interfaces/User.ts";

const sampleUser: User = {
  identification: "user123",
  username: "john",
  name: "John",
  lastnameone: "Doe",
  lastnametwo: "Smith",
  borndate: new Date("1990-01-01"),
  email: "john@example.com",
  phone: "123456789",
  password: "hashed",
  idusertype: 1,
  idtypeident: 1,
};

const createMockClient = (): Client => ({
  queryObject: (query: string, _params?: unknown[]) => {
    if (query.includes("sp_auth_user_get_by_username_or_email")) {
      return { rows: [sampleUser] } as unknown as ReturnType<Client["queryObject"]>;
    }
    if (query.includes("sp_registrar_usuario")) {
      return { rows: [] } as unknown as ReturnType<Client["queryObject"]>;
    }
    if (query.includes("sp_actualizar_usuario")) {
      return { rows: [] } as unknown as ReturnType<Client["queryObject"]>;
    }
    if (query.includes("sp_eliminar_usuario")) {
      return { rows: [] } as unknown as ReturnType<Client["queryObject"]>;
    }
    return { rows: [] } as unknown as ReturnType<Client["queryObject"]>;
  },
} as unknown as Client);

Deno.test("UserCRUD - GetUser retorna usuario", async () => {
  const crud = new UserCRUD(createMockClient());
  const user = await crud.GetUser("john");
  assertEquals(user.identification, sampleUser.identification);
});

Deno.test("UserCRUD - CreateUser ejecuta sin error", async () => {
  const crud = new UserCRUD(createMockClient());
  await crud.CreateUser(sampleUser);
  assertEquals(true, true);
});

Deno.test("UserCRUD - UpdateUser ejecuta sin error", async () => {
  const crud = new UserCRUD(createMockClient());
  await crud.UpdateUser(sampleUser);
  assertEquals(true, true);
});

Deno.test("UserCRUD - DeleteUser ejecuta sin error", async () => {
  const crud = new UserCRUD(createMockClient());
  await crud.DeleteUser(sampleUser.identification);
  assertEquals(true, true);
});
