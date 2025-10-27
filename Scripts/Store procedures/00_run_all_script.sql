/* ==========================================================
   Base de Datos: PostgreSQL
   Descripción:
       Creación de Stored Procedures y Funciones
       para la gestión de usuarios, cuentas, tarjetas
       y movimientos bancarios.
   ========================================================== */

SET search_path TO orbita;


/* ==========================================================
   1. PROCEDIMIENTO: sp_registrar_usuario
   ========================================================== */
CREATE OR REPLACE PROCEDURE orbita.sp_registrar_usuario(
    p_identification TEXT,
    p_username TEXT,
    p_name TEXT,
    p_lastnameone TEXT,
    p_lastnametwo TEXT,
    p_borndate DATE,
    p_email TEXT,
    p_phone TEXT,
    p_password TEXT,
    p_idusertype INT,
    p_idtypeident INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO orbita.Users (
        Identification, UserName, Name, LastNameOne, LastNameTwo, BornDate,
        Email, Phone, Password, IDUser, IDTypeIdentification
    ) VALUES (
        p_identification, p_username, p_name, p_lastnameone, p_lastnametwo, p_borndate,
        p_email, p_phone, p_password, p_idusertype, p_idtypeident
    );
END;
$$;


/* ==========================================================
   2. PROCEDIMIENTO: sp_crear_cuenta
   ========================================================== */
CREATE OR REPLACE PROCEDURE orbita.sp_crear_cuenta(
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


/* ==========================================================
   3. PROCEDIMIENTO: sp_registrar_tarjeta
   ========================================================== */
CREATE OR REPLACE PROCEDURE orbita.sp_registrar_tarjeta(
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


/* ==========================================================
   4. PROCEDIMIENTO: sp_registrar_movimiento
   ========================================================== */
CREATE OR REPLACE PROCEDURE orbita.sp_registrar_movimiento(
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


/* ==========================================================
   5. PROCEDIMIENTO: sp_actualizar_fondos
   ========================================================== */
CREATE OR REPLACE PROCEDURE orbita.sp_actualizar_fondos(
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


/* ==========================================================
   6. FUNCIÓN: fn_obtener_movimientos
   ========================================================== */
CREATE OR REPLACE FUNCTION orbita.fn_obtener_movimientos(p_iban TEXT)
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


/* ==========================================================
   7. PROCEDIMIENTO: sp_eliminar_usuario
   ========================================================== */
CREATE OR REPLACE PROCEDURE orbita.sp_eliminar_usuario(p_ident TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM orbita.Users
    WHERE Identification = p_ident;
END;
$$;


/* ==========================================================
   8. PROCEDIMIENTO: sp_actualizar_usuario
   ========================================================== */
CREATE OR REPLACE PROCEDURE orbita.sp_actualizar_usuario(
    p_identification TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_password TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE orbita.Users
    SET Email = p_email,
        Phone = p_phone,
        Password = p_password
    WHERE Identification = p_identification;
END;
$$;


/* ==========================================================
   9. FUNCIÓN: fn_consultar_saldo
   ========================================================== */
CREATE OR REPLACE FUNCTION orbita.fn_consultar_saldo(p_iban TEXT)
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


/* ==========================================================
   10. PROCEDIMIENTO: sp_transferir
   ========================================================== */
CREATE OR REPLACE PROCEDURE orbita.sp_transferir(
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
    SELECT Funds INTO saldo_origen FROM orbita.Account WHERE IBAN = p_iban_origen;

    IF saldo_origen < p_monto THEN
        RAISE EXCEPTION 'Fondos insuficientes en la cuenta origen.';
    END IF;

    UPDATE orbita.Account SET Funds = Funds - p_monto WHERE IBAN = p_iban_origen;
    UPDATE orbita.Account SET Funds = Funds + p_monto WHERE IBAN = p_iban_destino;

    INSERT INTO orbita.Movement (Amount, DateMovement, Detail, IBAN, Card)
    VALUES (p_monto, CURRENT_DATE, 'Transferencia salida: ' || p_detalle, p_iban_origen, p_card);

    INSERT INTO orbita.Movement (Amount, DateMovement, Detail, IBAN, Card)
    VALUES (p_monto, CURRENT_DATE, 'Transferencia entrada: ' || p_detalle, p_iban_destino, p_card);
END;
$$;



/* ==========================================================
   BLOQUE DE PRUEBA – EJECUCIÓN DE TODOS LOS SP Y FUNCIONES
   ========================================================== */

--  Registrar usuario
CALL orbita.sp_registrar_usuario(
    '101770456',
    'jdoe',
    'John',
    'Doe',
    'Smith',
    '1990-05-12',
    'john@example.com',
    '88889999',
    'clave123',
    1, 1
);

--  Crear cuenta
CALL orbita.sp_crear_cuenta('CR1234127890', 100000, '101230456', 1, 1);

--  Registrar tarjeta
CALL orbita.sp_registrar_tarjeta('1111222233334444', 'CR1234567890', '101230456', '1234', '999', '2028-12-31');

--  Registrar movimiento
CALL orbita.sp_registrar_movimiento(50000, CURRENT_DATE, 'Depósito inicial', 'CR1234567890', '1111222233334444');

--  Consultar saldo
SELECT orbita.fn_consultar_saldo('CR1234567890') AS saldo_actual;

--  Transferir entre cuentas (requiere segunda cuenta)
-- CALL orbita.sp_transferir('CR1234567890', 'CR0987654321', 10000, 'Pago de servicios', '1111222233334444');

--  Consultar movimientos
SELECT * FROM orbita.fn_obtener_movimientos('CR1234567890');

--  Actualizar usuario
CALL orbita.sp_actualizar_usuario('101230456', 'john.new@example.com', '77778888', 'claveNueva');

-- Eliminar usuario
-- CALL orbita.sp_eliminar_usuario('101230456');
