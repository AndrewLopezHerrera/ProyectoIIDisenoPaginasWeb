/* ==========================================================
   9. FUNCIÓN: fn_consultar_saldo
   ----------------------------------------------------------
   Descripción:
       Retorna el saldo actual (fondos) de una cuenta bancaria.

   Parámetros:
       p_iban  IBAN de la cuenta.

   Retorna:
       Monto de fondos actuales.
   ========================================================== */
CREATE OR REPLACE FUNCTION fn_consultar_saldo(p_iban TEXT)
RETURNS MONEY
LANGUAGE plpgsql
AS $$
DECLARE
    v_saldo MONEY;
BEGIN
    SELECT Funds INTO v_saldo
    FROM orbita.Account
    WHERE IBAN = p_iban;

    RETURN v_saldo;
END;
$$;