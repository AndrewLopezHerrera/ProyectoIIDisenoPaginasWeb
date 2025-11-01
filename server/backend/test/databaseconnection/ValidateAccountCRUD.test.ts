import { assertEquals } from "@std/assert";
import ValidateAccountCRUD from "../../src/databaseconnection/ValidateAccountCRUD.ts";
import { Client } from "postgresql";

const createMockClient = (exists: boolean): Client => ({
  queryObject: (_query: string, _params?: unknown[]) => {
    return { rows: [{ exists }] } as unknown as ReturnType<Client["queryObject"]>;
  },
} as unknown as Client);

Deno.test("ValidateAccountCRUD - ValidateAccountExistence retorna true/false según DB", async () => {
  const crudTrue = new ValidateAccountCRUD(createMockClient(true));
  const crudFalse = new ValidateAccountCRUD(createMockClient(false));

  const r1 = await crudTrue.ValidateAccountExistence("ES111");
  const r2 = await crudFalse.ValidateAccountExistence("ES222");

  assertEquals(r1, true);
  assertEquals(r2, false);
});
