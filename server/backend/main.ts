import { Application } from "oak";
import Authorizer from "./src/security/Authorizer.ts";
import EndpointsManager from "./src/endpoints/EnpointsManager.ts";
import JWTGenerator from "./src/security/JWTGenerator.ts";
import DataBaseIni from "./src/databaseconnection/DataBaseIni.ts";

const app = new Application();
const secret = await crypto.subtle.generateKey(
    { name: "HMAC", hash: "SHA-512" },
    true,
    ["sign", "verify"],
);
const jwtGenerator = new JWTGenerator(secret);
const authorizer = new Authorizer(jwtGenerator);
await DataBaseIni.initConection();
const endpointsManager = new EndpointsManager(app, authorizer);
endpointsManager.Start();