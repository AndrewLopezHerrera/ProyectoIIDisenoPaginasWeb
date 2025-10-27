import { assertEquals, assertExists, assertNotEquals, assertRejects } from "@std/assert";
import Authorizer from "../src/security/Authorizer.ts";
import JWTGenerator from "../src/security/JWTGenerator.ts";
import { User } from "../src/interfaces/User.ts";
import { genSalt, hash } from "bcrypt";
import WebError from "../src/web_error/WebError.ts";

Deno.test("Authorizer - Login exitoso genera un token JWT", async () => {
  const secret = await crypto.subtle.generateKey(
    { name: "HMAC", hash: "SHA-512" },
    true,
    ["sign", "verify"],
  );
  const jwtGen = new JWTGenerator(secret);
  const authorizer = new Authorizer(jwtGen);

  const password = "securePassword";
  const salt = await genSalt(10);
  const hashedPassword = await hash(password, salt);
  const user: User = {
    identification: "user123",
    email: "user123@example.com",
    password: hashedPassword,
    idusertype: 2,
    username: "",
    name: "",
    lastnameone: "",
    lastnametwo: "",
    borndate: new Date(),
    phone: "",
    idtypeident: 0
  };
  const token = await authorizer.Login(user, password);
  assertExists(token);
  assertEquals(typeof token, "string");
});

Deno.test("Authorizer - Login con contraseña incorrecta lanza WebError", async () => {
  const secret = await crypto.subtle.generateKey(
    { name: "HMAC", hash: "SHA-512" },
    true,
    ["sign", "verify"],
  );
  const jwtGen = new JWTGenerator(secret);
  const authorizer = new Authorizer(jwtGen);

  const password = "securePassword";
  const salt = await genSalt(10);
  const hashedPassword = await hash(password, salt);
  const user: User = {
    identification: "user123",
    email: "user123@example.com",
    password: hashedPassword,
    idusertype: 2,
    username: "user123",
    name: "User",
    lastnameone: "One",
    lastnametwo: "Two",
    borndate: new Date(),
    phone: "1234567890",
    idtypeident: 0
  };
  const token = await authorizer.Login(user, password);
  assertExists(token);
  assertEquals(typeof token, "string");
});

Deno.test("Authorizer - Login con contraseña incorrecta lanza WebError", async () => {
  const secret = await crypto.subtle.generateKey(
    { name: "HMAC", hash: "SHA-512" },
    true,
    ["sign", "verify"],
  );
  const jwtGen = new JWTGenerator(secret);
  const authorizer = new Authorizer(jwtGen);

  const password = "securePassword";
  const salt = await genSalt(10);
  const hashedPassword = await hash(password, salt);
  const user: User = {
    identification: "user123",
    email: "user123@example.com",
    password: hashedPassword,
    idusertype: 2,
    username: "user123",
    name: "User",
    lastnameone: "One",
    lastnametwo: "Two",
    borndate: new Date(),
    phone: "1234567890",
    idtypeident: 0
  };
  await assertRejects(async () => {
    await authorizer.Login(user, "wrongPassword");
  }, WebError);
});

Deno.test("Authorizer - HashPassword genera un hash diferente para la misma contraseña", async () => {
  const authorizer = new Authorizer(new JWTGenerator(await crypto.subtle.generateKey(
    { name: "HMAC", hash: "SHA-512" },
    true,
    ["sign", "verify"],
  )));
  const password = "securePassword";
  const hash1 = await authorizer.HashPassword(password);
  const hash2 = await authorizer.HashPassword(password);
  assertExists(hash1);
  assertExists(hash2);
  assertEquals(typeof hash1, "string");
  assertEquals(typeof hash2, "string");
  assertNotEquals(hash1, hash2);
});

Deno.test("Authorizer - IsAdministrador identifica correctamente a un administrador", async () => {
  const secret = await crypto.subtle.generateKey(
    { name: "HMAC", hash: "SHA-512" },
    true,
    ["sign", "verify"],
  );
  const jwtGen = new JWTGenerator(secret);
  const authorizer = new Authorizer(jwtGen);

  const adminPayload = {
    id: "admin123",
    email: "admin123@example.com",
    role: "administrator"
  };
  const token = await jwtGen.Generate(adminPayload);
  const isAdmin = await authorizer.IsAdministrador(token);
  assertExists(isAdmin);
  assertEquals(isAdmin, true);
});

Deno.test("Authorizer - IsOwner identifica correctamente al propietario", async () => {
  const secret = await crypto.subtle.generateKey(
    { name: "HMAC", hash: "SHA-512" },
    true,
    ["sign", "verify"],
  );
  const jwtGen = new JWTGenerator(secret);
  const authorizer = new Authorizer(jwtGen);

  const ownerPayload = {
    id: "owner123",
    email: "owner123@example.com",
    role: "owner"
  };
  const token = await jwtGen.Generate(ownerPayload);
  const isOwner = await authorizer.IsOwner(token, "owner123");
  assertExists(isOwner);
  assertEquals(isOwner, true);
});
