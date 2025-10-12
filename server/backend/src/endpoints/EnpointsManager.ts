import { Application, Router } from "oak";
import ResetPassword from "./authentication/ResetPassword.ts";
import Login from "./authentication/Login.ts";
import ForgotPassword from "./authentication/ForgotPassword.ts";
import VerifyOTP from "./authentication/VerifyOTP.ts";
import CreateAccount from "./accounts/CreateAccount.ts";
import DeleteUser from "./users/DeleteUser.ts";
import GetUser from "./users/GetUser.ts";
import UpdateUser from "./users/UpdateUser.ts";
import AccountMovements from "./accounts/AccountMovements.ts";
import SeeAccount from "./accounts/SeeAccount.ts";
import SeeAccounts from "./accounts/SeeAccounts.ts";
import SetStateAccount from "./accounts/SetStateAccount.ts";
import InternalTransfers from "./transfers/InternalTranfers.ts";
import CreateCard from "./cards/CreateCard.ts";
import GetCard from "./cards/GetCard.ts";
import GetCardMovements from "./cards/GetCardMovements.ts";
import GetCards from "./cards/GetCards.ts";
import InsertMovement from "./cards/InsertMovement.ts";
import GenerateOPTPinCvv from "./pin_cvv/GenerateOPTPinCvv.ts";
import ValidateAccount from "./validate_accounts/ValidateAccount.ts";

class EndpointsManager {
    private App: Application;
    private Router: Router;
    private Port : number = 8080;

    public constructor(app: Application) {
        this.App = app;
        this.Router = new Router();
    }

    private Init() {
        this.App.use(this.Router.routes());
        this.App.use(this.Router.allowedMethods());
        this.App.listen({ port: this.Port });
        console.log(`Server running on port ${this.Port}`);
    }

    private InitRoutesAuth() : void {
        new Login(this.Router);
        new ForgotPassword(this.Router);
        new ResetPassword(this.Router);
        new VerifyOTP(this.Router);
    }

    private InitRoutesUser() : void {
        new CreateAccount(this.Router);
        new DeleteUser(this.Router);
        new GetUser(this.Router);
        new UpdateUser(this.Router);
    }

    private InitRoutesAccounts() : void {
        new AccountMovements(this.Router);
        new CreateAccount(this.Router);
        new SeeAccount(this.Router);
        new SeeAccounts(this.Router);
        new SetStateAccount(this.Router);
    }

    private InitRoutesCards() : void {
        new CreateCard(this.Router);
        new GetCard(this.Router);
        new GetCardMovements(this.Router);
        new GetCards(this.Router);
        new InsertMovement(this.Router);
    }
    
    private InitRoutesTransfers() : void {
        new InternalTransfers(this.Router);
    }

    private InitRoutesPINCVV() : void {
        new GenerateOPTPinCvv(this.Router);
        new VerifyOTP(this.Router);
    }

    private InitAllRoutes() : void {
        this.InitRoutesAuth();
        this.InitRoutesUser();
        this.InitRoutesAccounts();
        this.InitRoutesCards();
        this.InitRoutesTransfers();
        this.InitRoutesPINCVV();
        this.InitRoutesValidateAccount();
    }

    private InitRoutesValidateAccount() : void {
        new ValidateAccount(this.Router);
    }

    public Start() : void {
        this.InitAllRoutes();
        this.Init();
    }

    public GetRouter(): Router {
        return this.Router;
    }
}

export default EndpointsManager;