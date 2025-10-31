import CardsCRUD from "../databaseconnection/CardsCRUD.ts";
import PINCVVCRUD from "../databaseconnection/PINCVVCRUD.ts";
import { Card } from "../interfaces/Card.ts";
import Authorizer from "../security/Authorizer.ts";
import WebError from "../web_error/WebError.ts";
import EmailManager from "./EmailManager.ts";
import UserManager from "./UserManager.ts";

/**
 * Clase encargada de la lógica relacionada con la generación y validación de OTPs para PIN y CVV.
 */
class PINCVVManager {
    private EmailManagerUsers: EmailManager;
    private AuthorizerUser: Authorizer;
    private CardsConnection: CardsCRUD;
    private UserManager: UserManager;
    private PINCVVConnection: PINCVVCRUD;

    /**
     * Constructor de la clase PINCVVManager.
     * @param authorizer Autorizaciones de usuario.
     * @param emailManager Gestión de envíos de correos electrónicos.
     * @param cardsCRUD Gestión de operaciones CRUD relacionadas con tarjetas.
     * @param userManager Gestión de operaciones relacionadas con usuarios.
     * @param pinCvvCRUD Gestión de operaciones CRUD relacionadas con PIN y CVV.
     */
    public constructor(authorizer: Authorizer, emailManager: EmailManager, cardsCRUD: CardsCRUD, userManager: UserManager, pinCvvCRUD: PINCVVCRUD) {
        this.EmailManagerUsers = emailManager;
        this.AuthorizerUser = authorizer;
        this.CardsConnection = cardsCRUD;
        this.UserManager = userManager;
        this.PINCVVConnection = pinCvvCRUD;
    }

    /**
     * Genera un OTP para el PIN/CVV de una tarjeta y lo envía al correo del usuario.
     * @param jwt Token JWT del usuario.
     * @param numberCard Número de la tarjeta.
     */
    public async GenerateOTP(jwt: string, numberCard: string): Promise<void> {
        const idUser = await this.AuthorizerUser.GetUserIdFromToken(jwt);
        const card = await this.CardsConnection.GetCard(numberCard);
        if (card.iduser !== idUser) {
            throw new WebError("No está autorizado para realizar esta acción.", 403);
        }
        const otp = this.GenerateRandomOTP();
        await this.PINCVVConnection.GenerateOTPPINCVV(card.iduser, parseInt(otp), 10);
        const user = await this.UserManager.GetUser(idUser, jwt);
        await this.EmailManagerUsers.SendEmail(user.email, otp, "El OTP para ver su PIN/CVV es: " + otp);
    }

    /**
     * Genera un OTP aleatorio de 6 dígitos.
     * @returns OTP generado.
     */
    private GenerateRandomOTP(): string {
        const otp = Math.floor(100000 + Math.random() * 900000);
        return otp.toString();
    }

    /**
     * Valida el OTP proporcionado para acceder al PIN/CVV de una tarjeta.
     * @param numberCard Número de la tarjeta.
     * @param otp OTP proporcionado por el usuario.
     * @param jwt Token JWT del usuario.
     * @returns Información de la tarjeta si el OTP es válido.
     */
    public async ValidateOTP(numberCard: string, otp: string, jwt: string): Promise<Card> {
        const idUser = await this.AuthorizerUser.GetUserIdFromToken(jwt);
        const card = await this.CardsConnection.GetCard(numberCard);
        if(card.iduser !== idUser) {
            throw new WebError("No está autorizado para realizar esta acción.", 403);
        }
        const isValid = await this.PINCVVConnection.VerifyOTPPINCVV(card.iduser, parseInt(otp));
        if (!isValid) {
            throw new WebError("OTP inválido.", 403);
        }
        return card;
    }
}

export default PINCVVManager;