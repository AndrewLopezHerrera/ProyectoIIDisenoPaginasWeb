import CardsCRUD from "../databaseconnection/CardsCRUD.ts";
import { Card } from "../interfaces/Card.ts";
import { Movement } from "../interfaces/Movement.ts";
import Authorizer from "../security/Authorizer.ts";
import WebError from "../web_error/WebError.ts";

/**
 * Clase encargada de la lógica de las tarjetas.
 */
class CardsManager {
    private AuthorizerUsers: Authorizer;
    private CardsConnection: CardsCRUD;

    /**
     * Constructor de la clase CardsManager.
     * @param authorizer Instancia que maneja la autorización de usuarios.
     * @param cardsCRUD Instancia que maneja las operaciones CRUD de las tarjetas.
     */
    constructor(authorizer: Authorizer, cardsCRUD: CardsCRUD) {
        this.AuthorizerUsers = authorizer;
        this.CardsConnection = cardsCRUD;
    }

    /**
     * Crea una nueva tarjeta.
     * @param data Datos de la tarjeta a crear.
     * @param jwtToken Token JWT del usuario que realiza la operación.
     */
    public async CreateCard(data: Card, jwtToken: string): Promise<void> {
        if(!await this.AuthorizerUsers.IsAdministrador(jwtToken)) {
            throw new WebError("No tienes permisos para crear una tarjeta.", 403);
        }
        data.numbercard = this.GenerateNumberCard();
        data.pin = this.CreatePIN();
        data.cvv = this.CreateCVV();
        data.expdate = new Date(Date.now() + 365 * 3 * 24 * 60 * 60 * 1000);
        await this.CardsConnection.CreateCard(data);
    }

    /**
     * Genera un número de tarjeta aleatorio de 16 dígitos.
     * @returns Número de tarjeta generado.
     */
    private GenerateNumberCard(): string {
        let numberCard = "";
        for (let i = 0; i < 16; i++) {
            numberCard += Math.floor(Math.random() * 10).toString();
        }
        return numberCard;
    }

    /**
     * Genera un PIN aleatorio de 4 dígitos.
     * @returns PIN generado.
     */
    private CreatePIN(): string {
        let pin = "";
        for (let i = 0; i < 4; i++) {
            pin += Math.floor(Math.random() * 10).toString();
        }
        return pin;
    }

    /**
     * Genera un CVV aleatorio de 3 dígitos.
     * @returns CVV generado.
     */
    private CreateCVV(): string {
        let cvv = "";
        for (let i = 0; i < 3; i++) {
            cvv += Math.floor(Math.random() * 10).toString();
        }
        return cvv;
    }

    /**
     * Obtiene una tarjeta por su número.
     * @param numberCard Número de la tarjeta.
     * @param jwtToken Token JWT del usuario que realiza la operación.
     * @returns La tarjeta solicitada.
     */
    public async GetCard(numberCard: string, jwtToken: string): Promise<Card> {
        const card = await this.CardsConnection.GetCard(numberCard);
        if(!await this.AuthorizerUsers.IsAdministrador(jwtToken) && !await this.AuthorizerUsers.IsOwner(jwtToken, card.iduser)) {
            throw new WebError("No tienes permisos para ver esta tarjeta.", 403);
        }
        card.pin = "";
        card.cvv = "";
        return card;
    }

    /**
     * Obtiene todas las tarjetas de un usuario.
     * @param identification Identificación del usuario.
     * @param jwtToken Token JWT del usuario que realiza la operación.
     * @returns Las tarjetas del usuario.
     */
    public async GetCards(jwtToken: string){
        const identification = await this.AuthorizerUsers.GetUserIdFromToken(jwtToken);
        if(!await this.AuthorizerUsers.IsAdministrador(jwtToken) && !await this.AuthorizerUsers.IsOwner(jwtToken, identification)) {
            throw new WebError("No tienes permisos para ver estas tarjetas.", 403);
        }
        const cards = await this.CardsConnection.GetCards(identification);
        cards.forEach((card: Card) => {
            card.pin = "";
            card.cvv = "";
        });
        return cards;
    }

    /**
     * Obtiene los movimientos de una tarjeta en un rango de fechas.
     * @param numberCard El número de la tarjeta.
     * @param startDate El inicio del rango de fechas.
     * @param endDate El fin del rango de fechas.
     * @param jwtToken Token JWT del usuario que realiza la operación.
     * @returns Los movimientos de la tarjeta.
     */
    public async GetCardMovements(numberCard: string, startDate: Date | null, endDate: Date | null, jwtToken: string) : Promise<Movement[]>{
        const card = await this.CardsConnection.GetCard(numberCard);
        if(!await this.AuthorizerUsers.IsAdministrador(jwtToken) && !await this.AuthorizerUsers.IsOwner(jwtToken, card.iduser)) {
            throw new WebError("No tienes permisos para ver los movimientos de esta tarjeta.", 403);
        }
        const movements = await this.CardsConnection.GetCardMovements(numberCard, startDate, endDate);
        return movements;
    }
}

export default CardsManager;