import { assertEquals, assertExists } from "@std/assert";
import JWTGenerator from "../src/security/JWTGenerator.ts";
import ErrorWeb from "../src/web_error/WebError.ts";
import type { Payload } from "djwt";

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

  const exp : Payload = await jwtGen.Verify(token);
  assertExists(exp);
  assertEquals(exp.userId, 123);
  assertEquals(exp.role, "admin");
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

Deno.test("Verifica si un usuario es un administrador", async () => {
  const secret = await crypto.subtle.generateKey(
    { name: "HMAC", hash: "SHA-512" },
    true,
    ["sign", "verify"],
  );
  const jwtGen = new JWTGenerator(secret);
  const adminPayload = { userId: 1, role: "admin" };
  const userPayload = { userId: 2, role: "user" };

  const adminToken = await jwtGen.Generate(adminPayload);
  const userToken = await jwtGen.Generate(userPayload);

  const isAdmin = async (token: string) => {
    const payload = await jwtGen.Verify(token);
    return payload?.role === "admin";
  };

  assertEquals(await isAdmin(adminToken), true);
  assertEquals(await isAdmin(userToken), false);
});

Deno.test("JWTGenerator - Verifica un token JWT expirado lanza WebError", async () => {
  const secret = await crypto.subtle.generateKey(
    { name: "HMAC", hash: "SHA-512" },
    true,
    ["sign", "verify"],
  );
  const jwtGen = new JWTGenerator(secret);
  
  // Crear un token con expiración en el pasado
  const pastPayload = { userId: 123, exp: Math.floor(Date.now() / 1000) - 10 };
  const expiredToken = await jwtGen.Generate(pastPayload);

  try {
    await jwtGen.Verify(expiredToken);
  } catch (error) {
    assertEquals(error instanceof ErrorWeb, true);
    if (error instanceof ErrorWeb) {
      assertEquals(error.message, "Invalid token");
      assertEquals(error.GetStatusCode(), 401);
    }
  }
});