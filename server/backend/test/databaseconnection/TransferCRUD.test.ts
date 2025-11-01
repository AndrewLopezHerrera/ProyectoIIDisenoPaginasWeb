import { assertEquals } from "@std/assert";
import TransferCRUD from "../../src/databaseconnection/TransferCRUD.ts";
import { Client } from "postgresql";
import { Transfer } from "../../src/interfaces/Transfer.ts";

const createMockClient = (): Client => ({
  queryObject: (_query: string, _params?: unknown[]) => {
    return { rows: [] } as unknown as ReturnType<Client["queryObject"]>;
  },
} as unknown as Client);

Deno.test("TransferCRUD - DoInternalTransfer ejecuta sin error", async () => {
  const crud = new TransferCRUD(createMockClient());
  const t: Transfer = { from: "ES111", to: "ES222", amount: 25, details: "Pago" };
  await crud.DoInternalTransfer(t);
  assertEquals(true, true);
});
