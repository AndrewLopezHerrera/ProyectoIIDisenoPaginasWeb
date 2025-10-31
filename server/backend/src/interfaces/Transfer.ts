interface Transfer {
    from: string;
    to: string;
    amount: number;
    details?: string;
}

export type { Transfer };