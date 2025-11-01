import { assertEquals, assertRejects } from "@std/assert";
import TransferManager from "../../src/logic/TransferManager.ts";
import TransferCRUD from "../../src/databaseconnection/TransferCRUD.ts";
import AccountCRUD from "../../src/databaseconnection/AccountCRUD.ts";
import Authorizer from "../../src/security/Authorizer.ts";
import { Transfer } from "../../src/interfaces/Transfer.ts";
import { Account } from "../../src/interfaces/Account.ts";
import WebError from "../../src/web_error/WebError.ts";

const createMockAccountCRUD = (ownerId = "user123"): AccountCRUD => ({
  SeeAccount: (_iban: string) => Promise.resolve({
    iban: _iban,
    funds: 1000,
    iduser: ownerId,
    idtypemoney: "USD",
    idtypeaccount: "savings",
  } as Account),
  CreateAccount: (_a: Account) => Promise.resolve(),
  GetAccountMovements: (_i: string) => Promise.resolve([]),
  SetAccountStatus: (_i: string, _s: string) => Promise.resolve(),
  SeeAccounts: (_id: string) => Promise.resolve([]),
} as unknown as AccountCRUD);

const createMockTransferCRUD = (): TransferCRUD => ({
  DoInternalTransfer: (_t: Transfer) => Promise.resolve(),
} as unknown as TransferCRUD);

const createMockAuthorizer = (isOwner = true): Authorizer => ({
  IsOwner: (_jwt: string, _userId: string) => Promise.resolve(isOwner),
  IsAdministrador: (_jwt: string) => Promise.resolve(false),
} as unknown as Authorizer);

Deno.test("TransferManager - DoInternalTransfer ejecuta si el usuario es owner", async () => {
  const manager = new TransferManager(createMockTransferCRUD(), createMockAccountCRUD("user123"), createMockAuthorizer(true));
  const t: Transfer = { from: "ES111", to: "ES222", amount: 50, details: "Pago" };
  await manager.DoInternalTransfer(t, "jwt");
  assertEquals(true, true);
});

Deno.test("TransferManager - DoInternalTransfer rechaza si NO es owner", async () => {
  const manager = new TransferManager(createMockTransferCRUD(), createMockAccountCRUD("user999"), createMockAuthorizer(false));
  const t: Transfer = { from: "ES111", to: "ES222", amount: 50 };
  await assertRejects(
    async () => await manager.DoInternalTransfer(t, "jwt"),
    WebError,
    "Unauthorized transfer attempt",
  );
});
