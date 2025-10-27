/* ==========================================================
   4. PROCEDIMIENTO: sp_registrar_movimiento
   ----------------------------------------------------------
   Descripción:
       Registra un movimiento (transacción) asociado a una cuenta.

   Parámetros:
       p_amount        Monto del movimiento.
       p_datemovement  Fecha del movimiento.
       p_detail        Descripción o detalle.
       p_iban          IBAN de la cuenta.
       p_card          Tarjeta utilizada (si aplica).
   ========================================================== */
CREATE OR REPLACE PROCEDURE sp_registrar_movimiento(
    p_amount MONEY,
    p_datemovement DATE,
    p_detail TEXT,
    p_iban TEXT,
    p_card CHAR(16)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO orbita.Movement (
        Amount, DateMovement, Detail, IBAN, Card
    ) VALUES (
        p_amount, p_datemovement, p_detail, p_iban, p_card
    );
END;
$$;