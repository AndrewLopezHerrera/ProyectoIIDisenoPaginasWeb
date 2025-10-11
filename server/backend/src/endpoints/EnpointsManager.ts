import { Application, Router } from "oak";

class EndpointsManager {
    private App: Application;
    private Router: Router;
    private Port : number = 8000;

    public constructor(app: Application) {
        this.App = app;
        this.Router = new Router();
    }

    public Init() {
        this.App.use(this.Router.routes());
        this.App.use(this.Router.allowedMethods());
        this.App.listen({ port: this.Port });
        console.log(`Server running on port ${this.Port}`);
    }

    public GetRouter(): Router {
        return this.Router;
    }
}

export default EndpointsManager;