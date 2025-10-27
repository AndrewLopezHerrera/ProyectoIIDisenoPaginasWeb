/* ==========================================================
   5. PROCEDIMIENTO: sp_actualizar_fondos
   ----------------------------------------------------------
   Descripción:
       Actualiza el saldo (fondos) de una cuenta bancaria.

   Parámetros:
       p_iban          Número IBAN de la cuenta.
       p_nuevo_monto   Nuevo monto total de fondos.
   ========================================================== */
CREATE OR REPLACE PROCEDURE sp_actualizar_fondos(
    p_iban TEXT,
    p_nuevo_monto MONEY
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE orbita.Account
    SET Funds = p_nuevo_monto
    WHERE IBAN = p_iban;
END;
$$;