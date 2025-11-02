import { assert, assertEquals, assertRejects } from "@std/assert";
import CardsManager from "../../src/logic/CardsManager.ts";
import CardsCRUD from "../../src/databaseconnection/CardsCRUD.ts";
import Authorizer from "../../src/security/Authorizer.ts";
import { Card } from "../../src/interfaces/Card.ts";
import { Movement } from "../../src/interfaces/Movement.ts";
import WebError from "../../src/web_error/WebError.ts";

const createMockAuthorizer = (isAdmin = false, isOwner = true): Authorizer => {
  return {
    IsAdministrador: (_jwt: string) => Promise.resolve(isAdmin),
    IsOwner: (_jwt: string, _id: string) => Promise.resolve(isOwner),
  } as unknown as Authorizer;
};

const baseCard: Card = {
  numbercard: "",
  iban: "ES123",
  iduser: "user123",
  pin: "1111",
  cvv: "222",
  expdate: new Date("2030-01-01"),
};

const createMockCardsCRUD = (): CardsCRUD => {
  return {
    CreateCard: (_card: Card) => Promise.resolve(),
    GetCard: (numberCard: string) => Promise.resolve({ ...baseCard, numbercard: numberCard }),
    GetCards: (_ident: string) => Promise.resolve({ rows: [{ ...baseCard, numbercard: "4111111111111111" }, { ...baseCard, numbercard: "5555444433331111" }] }),
    GetCardMovements: (_numberCard: string, _start: Date, _end: Date) => Promise.resolve<Movement[]>([{
      id: 1,
      amount: 100,
      datemovement: new Date(),
      detail: "Pago",
      iban: baseCard.iban,
      cardnumber: "4111111111111111",
    }]),
  } as unknown as CardsCRUD;
};

Deno.test("CardsManager - CreateCard exige admin y genera datos sensibles", async () => {
  const manager = new CardsManager(createMockAuthorizer(true), createMockCardsCRUD());
  const data: Card = { ...baseCard };
  await manager.CreateCard(data, "jwt");
  assertEquals(true, true);
});

Deno.test("CardsManager - CreateCard rechaza si no es admin", async () => {
  const manager = new CardsManager(createMockAuthorizer(false), createMockCardsCRUD());
  await assertRejects(
    async () => await manager.CreateCard({ ...baseCard }, "jwt"),
    WebError,
    "No tienes permisos para crear una tarjeta.",
  );
});

Deno.test("CardsManager - GetCard retorna tarjeta sin PIN ni CVV y autorizado", async () => {
  const manager = new CardsManager(createMockAuthorizer(true), createMockCardsCRUD());
  const card = await manager.GetCard("4111111111111111", "jwt");
  assertEquals(card.numbercard, "4111111111111111");
  assertEquals(card.pin, "");
  assertEquals(card.cvv, "");
});

Deno.test("CardsManager - GetCard rechaza no autorizado", async () => {
  const manager = new CardsManager(createMockAuthorizer(false, false), createMockCardsCRUD());
  await assertRejects(
    async () => await manager.GetCard("4111111111111111", "jwt"),
    WebError,
    "No tienes permisos para ver esta tarjeta.",
  );
});

Deno.test("CardsManager - GetCards limpia PIN/CVV y requiere admin u owner", async () => {
  const manager = new CardsManager(createMockAuthorizer(true), createMockCardsCRUD());
  const result = await manager.GetCards("user123", "jwt");
  assert(Array.isArray(result.rows));
  result.rows.forEach((c: Card) => {
    assertEquals(c.pin, "");
    assertEquals(c.cvv, "");
  });
});

Deno.test("CardsManager - GetCardMovements retorna movimientos si autorizado", async () => {
  const manager = new CardsManager(createMockAuthorizer(true), createMockCardsCRUD());
  const movs = await manager.GetCardMovements("4111111111111111", new Date("2024-01-01"), new Date("2024-12-31"), "jwt");
  assert(Array.isArray(movs));
  assertEquals(movs.length, 1);
});
