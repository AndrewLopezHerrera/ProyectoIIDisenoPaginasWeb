import { assertEquals } from "@std/assert";
import PINCVVCRUD from "../../src/databaseconnection/PINCVVCRUD.ts";
import { Client } from "postgresql";

const createMockClient = (notice: string): Client => ({
  queryObject: (_query: string, _params?: unknown[]) => {
    if (_query.includes("sp_otp_create")) {
      return { rows: [] } as unknown as ReturnType<Client["queryObject"]>;
    }
    if (_query.includes("sp_otp_consume")) {
      return { rows: [], warnings: { toString: () => notice } } as unknown as ReturnType<Client["queryObject"]>;
    }
    return { rows: [] } as unknown as ReturnType<Client["queryObject"]>;
  },
} as unknown as Client);

Deno.test("PINCVVCRUD - GenerateOTPPINCVV ejecuta sin error", async () => {
  const crud = new PINCVVCRUD(createMockClient(""));
  await crud.GenerateOTPPINCVV("user123", 123456, 10);
  assertEquals(true, true);
});

Deno.test("PINCVVCRUD - VerifyOTPPINCVV retorna true cuando NOTICE coincide", async () => {
  const notice = "OTP consumido correctamente para el usuario user123";
  const crud = new PINCVVCRUD(createMockClient(notice));
  const ok = await crud.VerifyOTPPINCVV("user123", 123456);
  assertEquals(ok, true);
});

Deno.test("PINCVVCRUD - VerifyOTPPINCVV retorna false cuando NOTICE no coincide", async () => {
  const crud = new PINCVVCRUD(createMockClient("otra cosa"));
  const ok = await crud.VerifyOTPPINCVV("user123", 123456);
  assertEquals(ok, false);
});
