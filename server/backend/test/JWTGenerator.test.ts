import { assertEquals, assertExists } from "@std/assert";
import JWTGenerator from "../src/security/JWTGenerator.ts";
import ErrorWeb from "../src/WebError/WebError.ts";

Deno.test("JWTGenerator - Genera y verifica un token JWT válido", async () => {
  const secret = await crypto.subtle.generateKey(
    { name: "HMAC", hash: "SHA-512" },
    true,
    ["sign", "verify"],
  );
  const jwtGen = new JWTGenerator(secret);
  const payload = { userId: 123, role: "admin" };
  const token = await jwtGen.Generate(payload);
  
  assertExists(token);
  assertEquals(typeof token, "string");

  const exp = await jwtGen.Verify(token);
  assertExists(exp);
  assertEquals(typeof exp, "number");
});

Deno.test("JWTGenerator - Verifica un token JWT inválido lanza WebError", async () => {
  const secret = await crypto.subtle.generateKey(
    { name: "HMAC", hash: "SHA-512" },
    true,
    ["sign", "verify"],
  );
  const jwtGen = new JWTGenerator(secret);
  const invalidToken = "invalid.token.here";

  try {
    await jwtGen.Verify(invalidToken);
  } catch (error) {
    assertEquals(error instanceof ErrorWeb, true);
    if (error instanceof ErrorWeb) {
      assertEquals(error.message, "Invalid token");
      assertEquals(error.GetStatusCode(), 401);
    }
  }
});

