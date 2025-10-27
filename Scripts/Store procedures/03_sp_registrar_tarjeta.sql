/* ==========================================================
   3. PROCEDIMIENTO: sp_registrar_tarjeta
   ----------------------------------------------------------
   Descripción:
       Asocia una nueva tarjeta a una cuenta y usuario.

   Parámetros:
       p_numbercard  Número de la tarjeta (16 dígitos).
       p_iban        IBAN de la cuenta vinculada.
       p_iduser      Identificación del usuario.
       p_pin         PIN de la tarjeta.
       p_cvv         Código de seguridad CVV.
       p_expdate     Fecha de expiración.
   ========================================================== */
CREATE OR REPLACE PROCEDURE sp_registrar_tarjeta(
    p_numbercard CHAR(16),
    p_iban TEXT,
    p_iduser TEXT,
    p_pin TEXT,
    p_cvv TEXT,
    p_expdate DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO orbita.Card (
        NumberCard, IBAN, IDUser, PIN, CVV, ExpDate
    ) VALUES (
        p_numbercard, p_iban, p_iduser, p_pin, p_cvv, p_expdate
    );
END;
$$;
