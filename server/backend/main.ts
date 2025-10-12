import { Application } from "oak";
import EndpointsManager from "./src/endpoints/EnpointsManager.ts";

const app = new Application();
const endpointsManager = new EndpointsManager(app);
endpointsManager.Start();