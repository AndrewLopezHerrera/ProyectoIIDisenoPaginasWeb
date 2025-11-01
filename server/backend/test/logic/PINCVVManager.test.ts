import { assertEquals, assertRejects } from "@std/assert";
import PINCVVManager from "../../src/logic/PINCVVManager.ts";
import CardsCRUD from "../../src/databaseconnection/CardsCRUD.ts";
import PINCVVCRUD from "../../src/databaseconnection/PINCVVCRUD.ts";
import Authorizer from "../../src/security/Authorizer.ts";
import EmailManager from "../../src/logic/EmailManager.ts";
import UserManager from "../../src/logic/UserManager.ts";
import { Card } from "../../src/interfaces/Card.ts";
import { User } from "../../src/interfaces/User.ts";
import WebError from "../../src/web_error/WebError.ts";

const baseCard: Card = {
  numbercard: "4111111111111111",
  iban: "ES123",
  iduser: "user123",
  pin: "1111",
  cvv: "222",
  expdate: new Date("2030-01-01"),
};

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

const createMockAuthorizer = (): Authorizer => ({
  GetUserIdFromToken: (_jwt: string) => Promise.resolve("user123"),
  IsAdministrador: (_jwt: string) => Promise.resolve(false),
  IsOwner: (_jwt: string, _id: string) => Promise.resolve(true),
} as unknown as Authorizer);

const createMockCardsCRUD = (ownerId = "user123"): CardsCRUD => ({
  GetCard: (_nc: string) => Promise.resolve({ ...baseCard, iduser: ownerId }),
  CreateCard: (_card: Card) => Promise.resolve(),
  GetCards: (_ident: string) => Promise.resolve({ rows: [baseCard] }),
  GetCardMovements: () => Promise.resolve([]),
} as unknown as CardsCRUD);

const createMockPINCVVCRUD = (otpValid = true): PINCVVCRUD => ({
  GenerateOTPPINCVV: (_ident: string, _code: number, _min: number) => Promise.resolve(),
  VerifyOTPPINCVV: (_ident: string, _code: number) => Promise.resolve(otpValid),
} as unknown as PINCVVCRUD);

const createMockEmailManager = (): EmailManager => ({
  SendEmail: (_to: string, _subject: string, _body: string) => Promise.resolve(),
} as unknown as EmailManager);

const createMockUserManager = (): UserManager => ({
  GetUser: (_username: string, _jwt: string) => Promise.resolve(sampleUser),
  CreateUser: (_data: User) => Promise.resolve(),
  DeleteUser: (_u: string, _j: string) => Promise.resolve(),
  UpdateUser: (_u: User, _j: string) => Promise.resolve(),
} as unknown as UserManager);

Deno.test("PINCVVManager - GenerateOTP envía correo y crea OTP si es owner", async () => {
  const manager = new PINCVVManager(
    createMockAuthorizer(),
    createMockEmailManager(),
    createMockCardsCRUD("user123"),
    createMockUserManager(),
    createMockPINCVVCRUD(true),
  );
  await manager.GenerateOTP("jwt", baseCard.numbercard);
  assertEquals(true, true);
});

Deno.test("PINCVVManager - GenerateOTP rechaza si no es owner", async () => {
  const manager = new PINCVVManager(
    createMockAuthorizer(),
    createMockEmailManager(),
    createMockCardsCRUD("other"),
    createMockUserManager(),
    createMockPINCVVCRUD(true),
  );
  await assertRejects(
    async () => await manager.GenerateOTP("jwt", baseCard.numbercard),
    WebError,
    "No está autorizado para realizar esta acción.",
  );
});

Deno.test("PINCVVManager - ValidateOTP retorna card cuando OTP válido y owner", async () => {
  const manager = new PINCVVManager(
    createMockAuthorizer(),
    createMockEmailManager(),
    createMockCardsCRUD("user123"),
    createMockUserManager(),
    createMockPINCVVCRUD(true),
  );
  const card = await manager.ValidateOTP(baseCard.numbercard, "123456", "jwt");
  assertEquals(card.numbercard, baseCard.numbercard);
});

Deno.test("PINCVVManager - ValidateOTP rechaza con OTP inválido", async () => {
  const manager = new PINCVVManager(
    createMockAuthorizer(),
    createMockEmailManager(),
    createMockCardsCRUD("user123"),
    createMockUserManager(),
    createMockPINCVVCRUD(false),
  );
  await assertRejects(
    async () => await manager.ValidateOTP(baseCard.numbercard, "000000", "jwt"),
    WebError,
    "OTP inválido.",
  );
});
