/* ==========================================================
   6. FUNCIÓN: fn_obtener_movimientos
   ----------------------------------------------------------
   Descripción:
       Devuelve todos los movimientos asociados a una cuenta
       ordenados de forma descendente por fecha.

   Parámetros:
       p_iban  IBAN de la cuenta a consultar.

   Retorna:
       id, amount, datemovement, detail, card
   ========================================================== */
CREATE OR REPLACE FUNCTION fn_obtener_movimientos(p_iban TEXT)
RETURNS TABLE(
    id INT,
    amount MONEY,
    datemovement DATE,
    detail TEXT,
    card CHAR(16)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT m.ID, m.Amount, m.DateMovement, m.Detail, m.Card
    FROM orbita.Movement m
    WHERE m.IBAN = p_iban
    ORDER BY m.DateMovement DESC;
END;
$$;