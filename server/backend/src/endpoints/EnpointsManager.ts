import { Application, Router } from "oak";
import ResetPassword from "./authentication/ResetPassword.ts";
import Login from "./authentication/Login.ts";
import ForgotPassword from "./authentication/ForgotPassword.ts";
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
import GenerateOPTPinCvv from "./pin_cvv/GenerateOPTPinCvv.ts";
import ValidateAccount from "./validate_accounts/ValidateAccount.ts";
import DataBaseIni from "../databaseconnection/DataBaseIni.ts";
import AuthenticationCRUD from "../databaseconnection/AuthenticationCRUD.ts";
import AuthenticationManager from "../logic/AuthenticationManager.ts";
import Authorizer from "../security/Authorizer.ts";
import AccountCRUD from "../databaseconnection/AccountCRUD.ts";
import CardsCRUD from "../databaseconnection/CardsCRUD.ts";
import PINCVVCRUD from "../databaseconnection/PINCVVCRUD.ts";
import UserCRUD from "../databaseconnection/UserCRUD.ts";
import ValidateAccountCRUD from "../databaseconnection/ValidateAccountCRUD.ts";
import TransferCRUD from "../databaseconnection/TransferCRUD.ts";
import EmailManager from "../logic/EmailManager.ts";
import UserManager from "../logic/UserManager.ts";
import CreateUser from "./users/CreateUser.ts";
import AccountManager from "../logic/AccountManager.ts";
import CardsManager from "../logic/CardsManager.ts";
import TransferManager from "../logic/TransferManager.ts";
import PINCVVManager from "../logic/PINCVVManager.ts";

class EndpointsManager {
    private App: Application;
    private Router: Router;
    private Port : number = 8080;
    private AuthorizerUsers: Authorizer;
    private AccountConnection: AccountCRUD = new AccountCRUD(DataBaseIni.getConnection());
    private AuthenticationConnection: AuthenticationCRUD = new AuthenticationCRUD(DataBaseIni.getConnection());
    private CardsConnection: CardsCRUD = new CardsCRUD(DataBaseIni.getConnection());
    private PINCVVConnection: PINCVVCRUD = new PINCVVCRUD(DataBaseIni.getConnection());
    private TransferConnection: TransferCRUD = new TransferCRUD(DataBaseIni.getConnection());
    private UserConnection: UserCRUD = new UserCRUD(DataBaseIni.getConnection());
    private ValidateAccountConnection: ValidateAccountCRUD = new ValidateAccountCRUD(DataBaseIni.getConnection());
    private Email : EmailManager = new EmailManager();

    public constructor(app: Application, authorizer: Authorizer) {
        this.App = app;
        this.Router = new Router();
        this.AuthorizerUsers = authorizer;
    }

    private Init() {
        this.App.use(this.Router.routes());
        this.App.use(this.Router.allowedMethods());
        this.App.listen({ port: this.Port });
        console.log(`Server running on port ${this.Port}`);
    }

    private InitRoutesAuth() : void {
        const manager = new AuthenticationManager(
            this.AuthorizerUsers,
            this.AuthenticationConnection,
            this.Email,
            this.UserConnection
        );
        new Login(this.Router, manager);
        new ForgotPassword(this.Router, manager);
        new ResetPassword(this.Router, manager);
    }

    private InitRoutesUser() : void {
        const manager = new UserManager(
            this.UserConnection,
            this.AuthorizerUsers
        );
        new DeleteUser(this.Router, manager);
        new GetUser(this.Router, manager);
        new UpdateUser(this.Router, manager);
        new CreateUser(this.Router, manager);
    }

    private InitRoutesAccounts() : void {
        const manager = new AccountManager(
            this.AccountConnection,
            this.AuthorizerUsers,
            this.ValidateAccountConnection
        );
        new AccountMovements(this.Router, manager);
        new CreateAccount(this.Router, manager);
        new SeeAccount(this.Router, manager);
        new SeeAccounts(this.Router, manager);
        new SetStateAccount(this.Router, manager);
    }

    private InitRoutesCards() : void {
        const manager = new CardsManager(
            this.AuthorizerUsers,
            this.CardsConnection
        );
        new CreateCard(this.Router, manager);
        new GetCard(this.Router, manager);
        new GetCardMovements(this.Router, manager);
        new GetCards(this.Router, manager);
    }
    
    private InitRoutesTransfers() : void {
        const manager = new TransferManager(
            this.TransferConnection,
            this.AccountConnection,
            this.AuthorizerUsers
        );
        new InternalTransfers(this.Router, manager);
    }

    private InitRoutesPINCVV() : void {
        const manager = new PINCVVManager(
            this.AuthorizerUsers,
            this.Email,
            this.CardsConnection,
            new UserManager(this.UserConnection, this.AuthorizerUsers),
            this.PINCVVConnection
        );
        new GenerateOPTPinCvv(this.Router, manager);
    }

    private InitRoutesValidateAccount() : void {
        const manager = new AccountManager(
            this.AccountConnection,
            this.AuthorizerUsers,
            this.ValidateAccountConnection
        );
        new ValidateAccount(this.Router, manager);
    }

    private InitAllRoutes() : void {
        DataBaseIni.initConection();
        this.InitRoutesAuth();
        this.InitRoutesUser();
        this.InitRoutesAccounts();
        this.InitRoutesCards();
        this.InitRoutesTransfers();
        this.InitRoutesPINCVV();
        this.InitRoutesValidateAccount();
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