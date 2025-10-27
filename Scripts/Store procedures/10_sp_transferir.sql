/* ==========================================================
   10. PROCEDIMIENTO: sp_transferir
   ----------------------------------------------------------
   Descripción:
       Realiza una transferencia entre dos cuentas,
       validando fondos y registrando ambos movimientos.

   Parámetros:
       p_iban_origen   IBAN de la cuenta emisora.
       p_iban_destino  IBAN de la cuenta receptora.
       p_monto         Monto a transferir.
       p_detalle       Descripción del movimiento.
       p_card          Tarjeta utilizada (si aplica).
   ========================================================== */
CREATE OR REPLACE PROCEDURE sp_transferir(
    p_iban_origen TEXT,
    p_iban_destino TEXT,
    p_monto MONEY,
    p_detalle TEXT,
    p_card CHAR(16)
)
LANGUAGE plpgsql
AS $$
DECLARE
    saldo_origen MONEY;
BEGIN
    -- Verificar fondos suficientes
    SELECT Funds INTO saldo_origen FROM orbita.Account WHERE IBAN = p_iban_origen;

    IF saldo_origen < p_monto THEN
        RAISE EXCEPTION 'Fondos insuficientes en la cuenta origen.';
    END IF;

    -- Descontar del origen
    UPDATE orbita.Account SET Funds = Funds - p_monto WHERE IBAN = p_iban_origen;

    -- Acreditar al destino
    UPDATE orbita.Account SET Funds = Funds + p_monto WHERE IBAN = p_iban_destino;

    -- Registrar movimientos
    INSERT INTO orbita.Movement (Amount, DateMovement, Detail, IBAN, Card)
    VALUES (p_monto, CURRENT_DATE, 'Transferencia salida: ' || p_detalle, p_iban_origen, p_card);

    INSERT INTO orbita.Movement (Amount, DateMovement, Detail, IBAN, Card)
    VALUES (p_monto, CURRENT_DATE, 'Transferencia entrada: ' || p_detalle, p_iban_destino, p_card);
END;
$$;