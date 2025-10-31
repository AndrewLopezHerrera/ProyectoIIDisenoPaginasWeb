import { Client } from "postgresql";
import { Card } from "../interfaces/Card.ts";

class CardsCRUD {
    private Connection: Client;

    public constructor(connection: Client) {
        this.Connection = connection;
    }

    public async CreateCard(card: Card): Promise<void> {
        await this.Connection.queryObject<Card>(
            "CALL orbita.sp_cards_create($1, $2, $3, $4, $5, $6)",
            [card.numbercard, card.iban, card.iduser, card.pin, card.cvv, card.expdate]
        );
    }

    public async GetCard(numberCard: string) : Promise<Card> {
        const result = await this.Connection.queryObject<Card>(
            "SELECT * FROM orbita.sp_cards_get($1)",
            [numberCard]
        );
        return result.rows[0];
    }

    public async GetCards(identification: string){
        const result = await this.Connection.queryObject<Card>(
            "CALL orbita.sp_cards_get_by_user($1)",
            [identification]
        );
        return result;
    }
}

export default CardsCRUD;