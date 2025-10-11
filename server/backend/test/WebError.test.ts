import { assertEquals, assertExists } from "@std/assert";
import WebError from "../src/WebError/WebError.ts";

// Helper para evitar repetir
function testWebError(statusCode: number, expectedName: string, message = "Test Message") {
  const error = new WebError(message, statusCode);
  const json = error.ToJSON();

  assertEquals(json.error, expectedName);
  assertEquals(json.message, message);
  assertEquals(json.status, statusCode);
  assertExists(json.timestamp);
  assertEquals(typeof json.timestamp, "string");
  assertEquals(json.path, "<request_path>");
}

Deno.test("WebError - 400 Bad Request", () => {
  testWebError(400, "Bad Request");
});

Deno.test("WebError - 401 Unauthorized", () => {
  testWebError(401, "Unauthorized");
});

Deno.test("WebError - 403 Forbidden", () => {
  testWebError(403, "Forbidden");
});

Deno.test("WebError - 404 Not Found", () => {
  testWebError(404, "Not Found");
});

Deno.test("WebError - 405 Method Not Allowed", () => {
  testWebError(405, "Method Not Allowed");
});

Deno.test("WebError - 500 Internal Server Error", () => {
  testWebError(500, "Internal Server Error");
});

Deno.test("WebError - 502 Bad Gateway", () => {
  testWebError(502, "Bad Gateway");
});

Deno.test("WebError - 503 Service Unavailable", () => {
  testWebError(503, "Service Unavailable");
});

Deno.test("WebError - 504 Gateway Timeout", () => {
  testWebError(504, "Gateway Timeout");
});

Deno.test("WebError - Código desconocido devuelve 'Error'", () => {
  testWebError(999, "Error");
});

Deno.test("WebError - Constructor por defecto usa status 500", () => {
  const error = new WebError("Error interno por defecto");
  assertEquals(error.GetStatusCode(), 500);
  const json = error.ToJSON();
  assertEquals(json.status, 500);
  assertEquals(json.error, "Internal Server Error");
});


export default WebError;