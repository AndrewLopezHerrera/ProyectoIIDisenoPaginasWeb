interface Movement{
    id: number;
    amount: number;
    datemovement: Date;
    detail: string;
    iban: string;
    cardnumber: string;
}

export type { Movement };