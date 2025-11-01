import { assert, assertEquals } from "@std/assert";
import CardsCRUD from "../../src/databaseconnection/CardsCRUD.ts";
import { Client } from "postgresql";
import { Card } from "../../src/interfaces/Card.ts";
import { Movement } from "../../src/interfaces/Movement.ts";

const baseCard: Card = {
  numbercard: "4111111111111111",
  iban: "ES123",
  iduser: "user123",
  pin: "1111",
  cvv: "222",
  expdate: new Date("2030-01-01"),
};

const createMockClient = (): Client => {
  return {
    queryObject: (query: string, _params?: unknown[]) => {
      if (query.includes("sp_cards_create")) {
        return { rows: [] } as unknown as ReturnType<Client["queryObject"]>;
      }
      if (query.includes("sp_cards_get($1)")) {
        return { rows: [baseCard] } as unknown as ReturnType<Client["queryObject"]>;
      }
      if (query.includes("sp_cards_get_by_user")) {
        return { rows: [baseCard, { ...baseCard, numbercard: "5555444433331111" }] } as unknown as ReturnType<Client["queryObject"]>;
      }
      if (query.includes("sp_card_movements_list")) {
        const rows: Movement[] = [{
          id: 1,
          amount: 100,
          datemovement: new Date(),
          detail: "Pago",
          iban: baseCard.iban,
          cardnumber: baseCard.numbercard,
        }];
        return { rows } as unknown as ReturnType<Client["queryObject"]>;
      }
      return { rows: [] } as unknown as ReturnType<Client["queryObject"]>;
    },
  } as unknown as Client;
};

Deno.test("CardsCRUD - CreateCard ejecuta sin error", async () => {
  const crud = new CardsCRUD(createMockClient());
  await crud.CreateCard(baseCard);
  assertEquals(true, true);
});

Deno.test("CardsCRUD - GetCard retorna una tarjeta", async () => {
  const crud = new CardsCRUD(createMockClient());
  const card = await crud.GetCard(baseCard.numbercard);
  assertEquals(card.numbercard, baseCard.numbercard);
});

Deno.test("CardsCRUD - GetCards retorna lista en rows", async () => {
  const crud = new CardsCRUD(createMockClient());
  const res = await crud.GetCards("user123");
  assert(Array.isArray(res.rows));
  assertEquals(res.rows.length, 2);
});

Deno.test("CardsCRUD - GetCardMovements retorna movimientos", async () => {
  const crud = new CardsCRUD(createMockClient());
  const rows = await crud.GetCardMovements(baseCard.numbercard, new Date("2024-01-01"), new Date("2024-12-31"));
  assert(Array.isArray(rows));
  assertEquals(rows.length, 1);
});
