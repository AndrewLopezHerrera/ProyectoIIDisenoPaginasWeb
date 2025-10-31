import { Client } from "postgresql";
import { Card } from "../interfaces/Card.ts";
import { Movement } from "../interfaces/Movement.ts";

/**
 * Esta clase maneja las operaciones CRUD para las tarjetas en la base de datos.
 */
class CardsCRUD {
    private Connection: Client;

    /**
     * Constructor de la clase CardsCRUD.
     * @param connection La conexión a la base de datos PostgreSQL.
     */
    public constructor(connection: Client) {
        this.Connection = connection;
    }

    /**
     * Crea una nueva tarjeta en la base de datos.
     * @param card La tarjeta a crear.
     */
    public async CreateCard(card: Card): Promise<void> {
        await this.Connection.queryObject<Card>(
            "CALL orbita.sp_cards_create($1, $2, $3, $4, $5, $6)",
            [card.numbercard, card.iban, card.iduser, card.pin, card.cvv, card.expdate]
        );
    }

    /**
     * Obtiene una tarjeta de la base de datos por su número.
     * @param numberCard El número de la tarjeta.
     * @returns La tarjeta obtenida.
     */
    public async GetCard(numberCard: string) : Promise<Card> {
        const result = await this.Connection.queryObject<Card>(
            "SELECT * FROM orbita.sp_cards_get($1)",
            [numberCard]
        );
        return result.rows[0];
    }

    /**
     * Obtiene todas las tarjetas asociadas a un usuario por su identificación.
     * @param identification La identificación del usuario.
     * @returns Las tarjetas asociadas al usuario.
     */
    public async GetCards(identification: string){
        const result = await this.Connection.queryObject<Card>(
            "CALL orbita.sp_cards_get_by_user($1)",
            [identification]
        );
        return result;
    }

    /**
     * Obtiene los movimientos de una tarjeta en un rango de fechas.
     * @param numberCard El número de la tarjeta.
     * @param startDate La fecha de inicio.
     * @param endDate La fecha de fin.
     * @returns Los movimientos de la tarjeta en el rango de fechas.
     */
    public async GetCardMovements(numberCard: string, startDate: Date, endDate: Date){
        const result = await this.Connection.queryObject<Movement>(
            "SELECT orbita.sp_card_movements_list($1, $2, $3)",
            [numberCard, startDate, endDate]
        );
        return result.rows;
    }
}

export default CardsCRUD;