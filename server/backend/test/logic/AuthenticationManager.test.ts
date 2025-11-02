import { assertEquals, assertRejects } from "@std/assert";
import AuthenticationManager from "../../src/logic/AuthenticationManager.ts";
import AuthenticationCRUD from "../../src/databaseconnection/AuthenticationCRUD.ts";
import EmailManager from "../../src/logic/EmailManager.ts";
import UserCRUD from "../../src/databaseconnection/UserCRUD.ts";
import Authorizer from "../../src/security/Authorizer.ts";
import { User } from "../../src/interfaces/User.ts";
import WebError from "../../src/web_error/WebError.ts";

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

const createMockAuthCRUD = (opts?: {
  loginUser?: User;
  verifyOtp?: boolean;
}): AuthenticationCRUD => {
  const loginUser = opts?.loginUser ?? sampleUser;
  const verifyOtp = opts?.verifyOtp ?? true;
  return {
    Login: (_ident: string, _pw: string) => Promise.resolve(loginUser),
    ForgotPassword: (_ident: string, _code: string, _minutes: number) => Promise.resolve(),
    VerifyOTP: (_ident: string, _code: string) => Promise.resolve(verifyOtp),
    ResetPassword: (_ident: string, _newPw: string) => Promise.resolve(),
  } as unknown as AuthenticationCRUD;
};

const createMockEmailManager = (): EmailManager => {
  return {
    SendEmail: (_to: string, _subject: string, _body: string) => Promise.resolve(),
  } as unknown as EmailManager;
};

const createMockUserCRUD = (user: User = sampleUser): UserCRUD => {
  return {
    GetUser: (_username: string) => Promise.resolve(user),
    CreateUser: (_data: User) => Promise.resolve(),
    UpdateUser: (_data: User) => Promise.resolve(),
    DeleteUser: (_id: string) => Promise.resolve(),
  } as unknown as UserCRUD;
};

const createMockAuthorizer = (token: string = "token123"): Authorizer => {
  return {
    Login: (_user: User) => Promise.resolve(token),
    IsAdministrador: (_jwt: string) => Promise.resolve(false),
    IsOwner: (_jwt: string, _id: string) => Promise.resolve(true),
    GetUserIdFromToken: (_jwt: string) => Promise.resolve(sampleUser.identification),
  } as unknown as Authorizer;
};

Deno.test("AuthenticationManager - Login retorna token válido", async () => {
  const manager = new AuthenticationManager(
    createMockAuthorizer("jwt-abc"),
    createMockAuthCRUD({ loginUser: sampleUser }),
    createMockEmailManager(),
    createMockUserCRUD(sampleUser),
  );

  const token = await manager.Login(sampleUser.identification, "pw");
  assertEquals(token, "jwt-abc");
});

Deno.test("AuthenticationManager - Login lanza error si identificación no coincide", async () => {
  const wrongUser = { ...sampleUser, identification: "other" } as User;
  const manager = new AuthenticationManager(
    createMockAuthorizer("jwt-abc"),
    createMockAuthCRUD({ loginUser: wrongUser }),
    createMockEmailManager(),
    createMockUserCRUD(sampleUser),
  );

  await assertRejects(
    async () => {
      await manager.Login(sampleUser.identification, "pw");
    },
    WebError,
    "Credenciales inválidas",
  );
});

Deno.test("AuthenticationManager - RecoverPassword envía OTP y correo sin fallar", async () => {
  const manager = new AuthenticationManager(
    createMockAuthorizer(),
    createMockAuthCRUD(),
    createMockEmailManager(),
    createMockUserCRUD(sampleUser),
  );

  await manager.RecoverPassword(sampleUser.username);
  assertEquals(true, true);
});

Deno.test("AuthenticationManager - ResetPassword con OTP válido no lanza error", async () => {
  const manager = new AuthenticationManager(
    createMockAuthorizer(),
    createMockAuthCRUD({ verifyOtp: true }),
    createMockEmailManager(),
    createMockUserCRUD(sampleUser),
  );

  await manager.ResetPassword(sampleUser.username, "newPw", "123456");
  assertEquals(true, true);
});

Deno.test("AuthenticationManager - ResetPassword con OTP inválido lanza WebError", async () => {
  const manager = new AuthenticationManager(
    createMockAuthorizer(),
    createMockAuthCRUD({ verifyOtp: false }),
    createMockEmailManager(),
    createMockUserCRUD(sampleUser),
  );

  await assertRejects(
    async () => {
      await manager.ResetPassword(sampleUser.username, "newPw", "000000");
    },
    WebError,
    "OTP inválido",
  );
});
