/* ==========================================================
   2. PROCEDIMIENTO: sp_crear_cuenta
   ----------------------------------------------------------
   Descripción:
       Crea una nueva cuenta asociada a un usuario existente.

   Parámetros:
       p_iban           Número IBAN de la cuenta.
       p_funds          Monto inicial.
       p_iduser         ID del usuario dueño de la cuenta.
       p_idtypemoney    Tipo de moneda (colones, dólares, etc.).
       p_idtypeaccount  Tipo de cuenta (ahorros, corriente, etc.).
   ========================================================== */
CREATE OR REPLACE PROCEDURE sp_crear_cuenta(
    p_iban TEXT,
    p_funds MONEY,
    p_iduser TEXT,
    p_idtypemoney INT,
    p_idtypeaccount INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO orbita.Account (
        IBAN, Funds, IDUser, IDTypeMoney, IDTypeAccount
    ) VALUES (
        p_iban, p_funds, p_iduser, p_idtypemoney, p_idtypeaccount
    );
END;
$$;