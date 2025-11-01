import { assertEquals } from "@std/assert";
import AuthenticationCRUD from "../../src/databaseconnection/AuthenticationCRUD.ts";
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

const createMockClient = (opts?: { otpNotice?: string }): Client => {
  const otpNotice = opts?.otpNotice ?? `OTP consumido correctamente para el usuario ${sampleUser.identification}`;
  return {
    queryObject: (query: string, _params?: unknown[]) => {
      if (query.includes("sp_auth_login")) {
        return { rows: [sampleUser] } as unknown as ReturnType<Client["queryObject"]>;
      }
      if (query.includes("sp_otp_create")) {
        return { rows: [] } as unknown as ReturnType<Client["queryObject"]>;
      }
      if (query.includes("sp_otp_consume")) {
        return { rows: [], warnings: { toString: () => otpNotice } } as unknown as ReturnType<Client["queryObject"]>;
      }
      if (query.includes("sp_auth_change_password")) {
        return { rows: [] } as unknown as ReturnType<Client["queryObject"]>;
      }
      return { rows: [] } as unknown as ReturnType<Client["queryObject"]>;
    },
  } as unknown as Client;
};

Deno.test("AuthenticationCRUD - Login retorna usuario", async () => {
  const crud = new AuthenticationCRUD(createMockClient());
  const user = await crud.Login("john", "pw");
  assertEquals(user.identification, sampleUser.identification);
});

Deno.test("AuthenticationCRUD - VerifyOTP retorna true cuando NOTICE coincide", async () => {
  const crud = new AuthenticationCRUD(createMockClient());
  const isValid = await crud.VerifyOTP(sampleUser.identification, "123456");
  assertEquals(isValid, true);
});

Deno.test("AuthenticationCRUD - VerifyOTP retorna false cuando NOTICE no coincide", async () => {
  const crud = new AuthenticationCRUD(createMockClient({ otpNotice: "Otra cosa" }));
  const isValid = await crud.VerifyOTP(sampleUser.identification, "123456");
  assertEquals(isValid, false);
});

Deno.test("AuthenticationCRUD - ResetPassword ejecuta sin error", async () => {
  const crud = new AuthenticationCRUD(createMockClient());
  await crud.ResetPassword(sampleUser.identification, "newPw");
  assertEquals(true, true);
});
