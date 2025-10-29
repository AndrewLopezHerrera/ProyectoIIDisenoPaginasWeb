-- =====================================================
-- Script: 00_run_all_script.sql
-- Descripción: Creación completa de Stored Procedures del sistema ORBITA
-- Autor: Sistema ORBITA
-- =====================================================

-- =====================================================
-- BLOQUE: AUTENTICACIÓN Y OTP
-- =====================================================
SET search_path TO orbita;

-- ==============================================
-- sp_auth_user_get_by_identification
-- Descripción: Devuelve la información completa del usuario
-- (incluyendo contraseña y cuentas) según su identificación.
-- ==============================================
CREATE OR REPLACE FUNCTION sp_auth_user_get_by_identification(
    p_identification TEXT
)
RETURNS TABLE (
    identification TEXT,
    username TEXT,
    name TEXT,
    lastname_one TEXT,
    lastname_two TEXT,
    borndate DATE,
    email TEXT,
    phone TEXT,
    password TEXT,
    idusertype INT,
    idtypeidentification INT,
    account_number VARCHAR,
    balance NUMERIC,
    currency VARCHAR,
    status VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.Identification,
        u.UserName,
        u.Name,
        u.LastNameOne,
        u.LastNameTwo,
        u.BornDate,
        u.Email,
        u.Phone,
        u.Password,
        u.IDUser,
        u.IDTypeIdentification,
        a.account_number,
        a.balance,
        a.currency,
        a.status
    FROM orbita.Users u
    LEFT JOIN orbita.accounts a ON a.user_id::TEXT = u.Identification
    WHERE u.Identification = p_identification;

    IF NOT FOUND THEN
        RAISE NOTICE 'No se encontró ningún usuario con la identificación %', p_identification;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error en sp_auth_user_get_by_identification: %', SQLERRM;
END;
$$;

DROP FUNCTION IF EXISTS sp_auth_user_get_by_identification(TEXT);

-- ==============================================
-- sp_auth_user_get_by_identification
-- Descripción:
--   Devuelve toda la información del usuario (incluyendo la contraseña)
--   según la identificación ingresada.
-- ==============================================
-- ==============================================
-- sp_auth_user_get_by_identification (como FUNCIÓN)
-- ==============================================
CREATE OR REPLACE FUNCTION sp_auth_user_get_by_identification(
    p_identification TEXT
)
RETURNS TABLE (
    identification TEXT,
    username TEXT,
    name TEXT,
    lastname_one TEXT,
    lastname_two TEXT,
    borndate DATE,
    email TEXT,
    phone TEXT,
    password TEXT,
    iduser INT,
    idtypeidentification INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.Identification,
        u.UserName,
        u.Name,
        u.LastNameOne,
        u.LastNameTwo,
        u.BornDate,
        u.Email,
        u.Phone,
        u.Password,
        u.IDUser,
        u.IDTypeIdentification
    FROM orbita.Users u
    WHERE u.Identification = p_identification;
END;
$$;



-- ==============================================
-- TABLA auxiliar para API Keys
-- ==============================================
CREATE TABLE IF NOT EXISTS ApiKeys (
    ID SERIAL PRIMARY KEY,
    KeyValue TEXT UNIQUE NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- sp_api_key_is_active
-- Descripción: Valida si una API key está activa.
-- ==============================================
CREATE OR REPLACE FUNCTION sp_api_key_is_active(
    p_key TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_active BOOLEAN;
BEGIN
    SELECT IsActive
    INTO v_active
    FROM ApiKeys
    WHERE KeyValue = p_key;

    RETURN COALESCE(v_active, FALSE);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error en sp_api_key_is_active: %', SQLERRM;
    RETURN FALSE;
END;
$$;


-- ==============================================
-- TABLA auxiliar para códigos OTP
-- ==============================================
CREATE TABLE IF NOT EXISTS OTP (
    ID SERIAL PRIMARY KEY,
    UserIdentification TEXT NOT NULL,
    Code TEXT NOT NULL,
    Expiration TIMESTAMP NOT NULL,
    Consumed BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserIdentification) REFERENCES Users(Identification)
);

-- ==============================================
-- sp_otp_create
-- Descripción: Genera un código OTP para un usuario.
-- ==============================================
CREATE OR REPLACE PROCEDURE sp_otp_create(
    p_identification TEXT,
    p_code TEXT,
    p_minutes_valid INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO OTP (UserIdentification, Code, Expiration)
    VALUES (p_identification, p_code, CURRENT_TIMESTAMP + (p_minutes_valid || ' minutes')::INTERVAL);

    RAISE NOTICE 'OTP generado correctamente para el usuario %', p_identification;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error en sp_otp_create: %', SQLERRM;
END;
$$;


-- ==============================================
-- sp_otp_consume
-- Descripción: Valida y consume un código OTP.
-- ==============================================
CREATE OR REPLACE PROCEDURE sp_otp_consume(
    p_identification TEXT,
    p_code TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_otp RECORD;
BEGIN
    SELECT * INTO v_otp
    FROM OTP
    WHERE UserIdentification = p_identification
      AND Code = p_code
      AND Consumed = FALSE
      AND Expiration > CURRENT_TIMESTAMP
    ORDER BY CreatedAt DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE NOTICE 'Código OTP inválido o expirado.';
        RETURN;
    END IF;

    UPDATE OTP SET Consumed = TRUE WHERE ID = v_otp.ID;

    RAISE NOTICE 'OTP consumido correctamente para el usuario %', p_identification;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error en sp_otp_consume: %', SQLERRM;
END;
$$;

-- =====================================================
-- BLOQUE: USUARIOS
-- =====================================================

-- ==============================================
-- sp_users_create
-- Descripción: Crea un nuevo usuario en el sistema.
-- ==============================================
CREATE OR REPLACE PROCEDURE sp_users_create(
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
    p_idtypeidentification INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO Users (
        Identification, UserName, Name, LastNameOne, LastNameTwo,
        BornDate, Email, Phone, Password, IDUser, IDTypeIdentification
    )
    VALUES (
        p_identification, p_username, p_name, p_lastnameone, p_lastnametwo,
        p_borndate, p_email, p_phone, p_password, p_idusertype, p_idtypeidentification
    );

    RAISE NOTICE 'Usuario % creado correctamente.', p_username;
EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'Error: El usuario o identificación ya existen.';
WHEN foreign_key_violation THEN
    RAISE NOTICE 'Error: Tipo de usuario o identificación no válidos.';
WHEN OTHERS THEN
    RAISE NOTICE 'Error en sp_users_create: %', SQLERRM;
END;
$$;


-- ==============================================
-- sp_users_get_by_identification
-- Descripción: Retorna la información de un usuario por su identificación.
-- ==============================================
CREATE OR REPLACE PROCEDURE sp_users_get_by_identification(
    p_identification TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_user RECORD;
BEGIN
    SELECT * INTO v_user
    FROM Users
    WHERE Identification = p_identification;

    IF FOUND THEN
        RAISE NOTICE 'Usuario encontrado: % % (%).', v_user.Name, v_user.LastNameOne, v_user.UserName;
    ELSE
        RAISE NOTICE 'No se encontró ningún usuario con esa identificación.';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error en sp_users_get_by_identification: %', SQLERRM;
END;
$$;


-- ==============================================
-- sp_users_update
-- Descripción: Actualiza los datos de un usuario existente.
-- ==============================================
CREATE OR REPLACE PROCEDURE sp_users_update(
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
    p_idtypeidentification INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE Users
    SET UserName = p_username,
        Name = p_name,
        LastNameOne = p_lastnameone,
        LastNameTwo = p_lastnametwo,
        BornDate = p_borndate,
        Email = p_email,
        Phone = p_phone,
        Password = p_password,
        IDUser = p_idusertype,
        IDTypeIdentification = p_idtypeidentification
    WHERE Identification = p_identification;

    IF FOUND THEN
        RAISE NOTICE 'Usuario % actualizado correctamente.', p_username;
    ELSE
        RAISE NOTICE 'No se encontró ningún usuario con esa identificación.';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error en sp_users_update: %', SQLERRM;
END;
$$;


-- ==============================================
-- sp_users_delete
-- Descripción: Elimina un usuario por su identificación.
-- ==============================================
CREATE OR REPLACE PROCEDURE sp_users_delete(
    p_identification TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM Users
    WHERE Identification = p_identification;

    IF FOUND THEN
        RAISE NOTICE 'Usuario con identificación % eliminado correctamente.', p_identification;
    ELSE
        RAISE NOTICE 'No se encontró ningún usuario con esa identificación.';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error en sp_users_delete: %', SQLERRM;
END;
$$;

-- =====================================================
-- BLOQUE: Cuentas
-- =====================================================

-- ==============================================
-- sp_accounts_create
-- Descripción: Crea una cuenta asociada a un usuario existente.
-- ==============================================
CREATE OR REPLACE PROCEDURE sp_accounts_create(
    p_user_id INT,
    p_account_number VARCHAR,
    p_initial_balance NUMERIC,
    p_currency VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO orbita.accounts (IBAN, IDUser, Funds, IDTypeMoney, IDTypeAccount)
    VALUES (p_account_number, p_user_id, p_initial_balance, 1, 1);

    RAISE NOTICE 'Cuenta creada correctamente para el usuario %', p_user_id;
EXCEPTION WHEN foreign_key_violation THEN
    RAISE NOTICE 'Error: El usuario % no existe en la tabla users.', p_user_id;
WHEN OTHERS THEN
    RAISE NOTICE 'Error en sp_accounts_create: %', SQLERRM;
END;
$$;


-- ==============================================
-- sp_accounts_get
-- Descripción: Devuelve la información de una cuenta por número IBAN.
-- ==============================================
CREATE OR REPLACE FUNCTION sp_accounts_get(p_account_number VARCHAR)
RETURNS TABLE (
    account_id INT,
    user_id INT,
    account_number VARCHAR,
    balance NUMERIC,
    currency VARCHAR,
    status VARCHAR,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.account_id, 
        a.IDUser AS user_id, 
        a.IBAN AS account_number, 
        a.Funds AS balance, 
        a.currency, 
        a.status, 
        a.created_at
    FROM orbita.accounts a
    WHERE a.IBAN = p_account_number;
END;
$$;


-- ==============================================
-- sp_accounts_update_funds
-- Descripción: Actualiza los fondos de una cuenta (depósito o retiro).
-- ==============================================
CREATE OR REPLACE PROCEDURE sp_accounts_update_funds(
    p_account_number VARCHAR,
    p_amount NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_new_balance NUMERIC;
BEGIN
    SELECT Funds + p_amount INTO v_new_balance
    FROM orbita.accounts
    WHERE IBAN = p_account_number;

    IF v_new_balance IS NULL THEN
        RAISE NOTICE 'La cuenta % no existe.', p_account_number;
        RETURN;
    END IF;

    IF v_new_balance < 0 THEN
        RAISE EXCEPTION 'Fondos insuficientes en la cuenta %', p_account_number;
    END IF;

    UPDATE orbita.accounts
    SET Funds = v_new_balance
    WHERE IBAN = p_account_number;

    INSERT INTO orbita.account_movements(account_number, movement_type, amount, movement_date)
    VALUES (p_account_number, CASE WHEN p_amount > 0 THEN 'DEPÓSITO' ELSE 'RETIRO' END, ABS(p_amount), NOW());
END;
$$;


-- ==============================================
-- sp_accounts_set_status
-- Descripción: Cambia el estado de una cuenta (por ejemplo: ACTIVA, BLOQUEADA, CERRADA).
-- ==============================================
CREATE OR REPLACE PROCEDURE sp_accounts_set_status(
    p_account_number VARCHAR,
    p_new_status VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE orbita.accounts
    SET status = UPPER(p_new_status)
    WHERE IBAN = p_account_number;

    IF NOT FOUND THEN
        RAISE NOTICE 'No se encontró la cuenta %', p_account_number;
    END IF;
END;
$$;


-- ==============================================
-- sp_account_movements_list.sql
-- Lista todos los movimientos asociados a una cuenta específica.
-- ==============================================

CREATE OR REPLACE FUNCTION sp_account_movements_list(p_account_number VARCHAR)
RETURNS TABLE (
    movement_id INT,
    account_number VARCHAR,
    movement_type VARCHAR,
    amount NUMERIC,
    movement_date TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT m.movement_id, m.account_number, m.movement_type, m.amount, m.movement_date
    FROM account_movements m
    WHERE m.account_number = p_account_number
    ORDER BY m.movement_date DESC;
END;
$$;

-- ========================================
-- BLOQUE: TARJETAS
-- ========================================

-- ========================================
-- sp_cards_create
-- Descripción: Crea una nueva tarjeta asociada a una cuenta existente
-- Parámetros:
--   p_number_card CHAR(16) - Número único de tarjeta
--   p_iban TEXT - IBAN de la cuenta a la que pertenece
--   p_id_user TEXT - Identificación del titular
--   p_pin TEXT - PIN encriptado
--   p_cvv TEXT - CVV encriptado
--   p_exp_date DATE - Fecha de expiración
-- Retorna:
--   Texto indicando éxito o error
-- ========================================
CREATE OR REPLACE FUNCTION sp_cards_create(
    p_number_card CHAR(16),
    p_iban TEXT,
    p_id_user TEXT,
    p_pin TEXT,
    p_cvv TEXT,
    p_exp_date DATE
)
RETURNS TEXT AS $$
BEGIN
    INSERT INTO orbita.Card (NumberCard, IBAN, IDUser, PIN, CVV, ExpDate)
    VALUES (p_number_card, p_iban, p_id_user, p_pin, p_cvv, p_exp_date);

    RETURN ' Tarjeta creada correctamente.';
EXCEPTION
    WHEN unique_violation THEN
        RETURN ' Error: el número de tarjeta ya existe.';
    WHEN foreign_key_violation THEN
        RETURN ' Error: el IBAN o el usuario no existen.';
END;
$$ LANGUAGE plpgsql;


-- ========================================
-- sp_cards_get
-- Descripción: Devuelve información de tarjetas
-- Parámetros:
--   p_number_card CHAR(16) (opcional)
--   p_id_user TEXT (opcional)
-- Retorna:
--   Lista de tarjetas asociadas a usuario o número de tarjeta
-- ========================================
CREATE OR REPLACE FUNCTION sp_cards_get(
    p_number_card CHAR(16) DEFAULT NULL,
    p_id_user TEXT DEFAULT NULL
)
RETURNS TABLE (
    numbercard CHAR(16),
    iban TEXT,
    iduser TEXT,
    expdate DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.NumberCard,
        c.IBAN,
        c.IDUser,
        c.ExpDate
    FROM orbita.Card c
    WHERE
        (p_number_card IS NULL OR c.NumberCard = p_number_card)
        AND (p_id_user IS NULL OR c.IDUser = p_id_user);
END;
$$ LANGUAGE plpgsql;


-- ========================================
-- sp_card_movements_list
-- Descripción: Lista los movimientos asociados a una tarjeta
-- Parámetros:
--   p_number_card CHAR(16)
--   p_fecha_inicio DATE (opcional)
--   p_fecha_fin DATE (opcional)
-- Retorna:
--   Todos los movimientos filtrados por tarjeta y rango de fechas
-- ========================================
CREATE OR REPLACE FUNCTION sp_card_movements_list(
    p_number_card CHAR(16),
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE (
    id INT,
    amount MONEY,
    datemovement DATE,
    detail TEXT,
    iban TEXT,
    card CHAR(16)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.ID,
        m.Amount,
        m.DateMovement,
        m.Detail,
        m.IBAN,
        m.Card
    FROM orbita.Movement m
    WHERE
        m.Card = p_number_card
        AND (p_fecha_inicio IS NULL OR m.DateMovement >= p_fecha_inicio)
        AND (p_fecha_fin IS NULL OR m.DateMovement <= p_fecha_fin)
    ORDER BY m.DateMovement DESC;
END;
$$ LANGUAGE plpgsql;


-- ========================================
-- sp_card_movement_add
-- Descripción: Registra un nuevo movimiento asociado a una tarjeta
-- Parámetros:
--   p_number_card CHAR(16)
--   p_amount MONEY
--   p_detail TEXT
-- Retorna:
--   Texto confirmando la operación
-- ========================================
CREATE OR REPLACE FUNCTION sp_card_movement_add(
    p_number_card CHAR(16),
    p_amount MONEY,
    p_detail TEXT
)
RETURNS TEXT AS $$
DECLARE
    v_iban TEXT;
BEGIN
    -- Obtener IBAN asociado a la tarjeta
    SELECT IBAN INTO v_iban
    FROM orbita.Card
    WHERE NumberCard = p_number_card;

    IF v_iban IS NULL THEN
        RETURN ' Error: la tarjeta no existe.';
    END IF;

    INSERT INTO orbita.Movement (Amount, DateMovement, Detail, IBAN, Card)
    VALUES (p_amount, NOW(), p_detail, v_iban, p_number_card);

    RETURN ' Movimiento registrado correctamente.';
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- BLOQUE: MOVIMIENTOS Y TRANSFERENCIAS
-- ========================================

-- ========================================
-- sp_movements_create
-- Descripción: Crea un nuevo movimiento en una cuenta y actualiza los fondos.
-- ========================================
CREATE OR REPLACE FUNCTION sp_movements_create(
    p_iban TEXT,
    p_amount MONEY,
    p_detail TEXT
)
RETURNS TEXT AS $$
DECLARE
    v_funds MONEY;
BEGIN
    -- Verificar si la cuenta existe
    SELECT Funds INTO v_funds
    FROM orbita.accounts
    WHERE IBAN = p_iban;

    IF v_funds IS NULL THEN
        RETURN ' Error: la cuenta no existe.';
    END IF;

    -- Insertar el movimiento
    INSERT INTO orbita.Movement (Amount, DateMovement, Detail, IBAN, Card)
    VALUES (p_amount, NOW(), p_detail, p_iban, '0000000000000000'); -- Sin tarjeta asociada

    -- Actualizar fondos de la cuenta
    UPDATE orbita.accounts
    SET Funds = Funds + p_amount
    WHERE IBAN = p_iban;

    RETURN ' Movimiento creado correctamente.';
END;
$$ LANGUAGE plpgsql;


-- ========================================
-- sp_movements_get
-- Descripción: Obtiene los movimientos de una cuenta específica.
-- ========================================
CREATE OR REPLACE FUNCTION sp_movements_get(
    p_iban TEXT,
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE (
    id INT,
    amount MONEY,
    datemovement DATE,
    detail TEXT,
    iban TEXT,
    card CHAR(16)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.ID,
        m.Amount,
        m.DateMovement,
        m.Detail,
        m.IBAN,
        m.Card
    FROM orbita.Movement m
    WHERE 
        m.IBAN = p_iban
        AND (p_fecha_inicio IS NULL OR m.DateMovement >= p_fecha_inicio)
        AND (p_fecha_fin IS NULL OR m.DateMovement <= p_fecha_fin)
    ORDER BY m.DateMovement DESC;
END;
$$ LANGUAGE plpgsql;


-- ========================================
-- sp_transfer_create_internal
-- Descripción: Realiza una transferencia interna entre cuentas.
-- ========================================
CREATE OR REPLACE FUNCTION sp_transfer_create_internal(
    p_iban_origen TEXT,
    p_iban_destino TEXT,
    p_monto MONEY,
    p_detalle TEXT
)
RETURNS TEXT AS $$
DECLARE
    v_saldo_origen MONEY;
BEGIN
    -- Validar existencia de cuentas
    SELECT Funds INTO v_saldo_origen FROM orbita.accounts WHERE IBAN = p_iban_origen;

    IF v_saldo_origen IS NULL THEN
        RETURN ' Error: la cuenta origen no existe.';
    ELSIF (SELECT COUNT(*) FROM orbita.accounts WHERE IBAN = p_iban_destino) = 0 THEN
        RETURN ' Error: la cuenta destino no existe.';
    ELSIF v_saldo_origen < p_monto THEN
        RETURN ' Error: saldo insuficiente.';
    END IF;

    -- Registrar movimiento de salida
    INSERT INTO orbita.Movement (Amount, DateMovement, Detail, IBAN, Card)
    VALUES (-p_monto, NOW(), CONCAT('Transferencia a ', p_iban_destino, ' - ', p_detalle), p_iban_origen, '0000000000000000');

    -- Registrar movimiento de entrada
    INSERT INTO orbita.Movement (Amount, DateMovement, Detail, IBAN, Card)
    VALUES (p_monto, NOW(), CONCAT('Transferencia desde ', p_iban_origen, ' - ', p_detalle), p_iban_destino, '0000000000000000');

    -- Actualizar saldos
    UPDATE orbita.accounts SET Funds = Funds - p_monto WHERE IBAN = p_iban_origen;
    UPDATE orbita.accounts SET Funds = Funds + p_monto WHERE IBAN = p_iban_destino;

    RETURN ' Transferencia interna completada correctamente.';
END;
$$ LANGUAGE plpgsql;


-- ========================================
-- BLOQUE: VALIDACIÓN BANCARIA
-- ========================================

-- ========================================
-- sp_bank_validate_account
-- Descripción: Valida que una cuenta pertenezca a un titular.
-- Parámetros:
--   p_iban TEXT - IBAN de la cuenta
--   p_identificacion TEXT - Identificación del titular
-- Retorna:
--   Resultado textual y bandera booleana
-- ========================================
-- ========================================
-- sp_bank_validate_account
-- Descripción: Valida que una cuenta pertenezca a un titular.
-- ========================================
CREATE OR REPLACE FUNCTION sp_bank_validate_account(
    p_iban TEXT,
    p_identificacion TEXT
)
RETURNS TABLE (
    resultado TEXT,
    valido BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN COUNT(*) > 0 THEN ' Cuenta válida y perteneciente al titular.'
            ELSE ' Cuenta no encontrada o no pertenece al titular.'
        END AS resultado,
        COUNT(*) > 0 AS valido
    FROM orbita.accounts
    WHERE IBAN = p_iban
      AND IDUser::TEXT = p_identificacion;
END;
$$ LANGUAGE plpgsql;


-- =====================================================
-- BLOQUE: Ejecucion
-- =====================================================

CALL sp_auth_user_get_by_username_or_email('juanperez');  -- Por username
CALL sp_auth_user_get_by_username_or_email('juanperez@email.com');  -- Por correo

SELECT sp_api_key_is_active('12345-ABCDE-XYZ');

CALL sp_otp_create('123456789', '875943', 10);

CALL sp_otp_consume('123456789', '875943');

CALL sp_users_create(
    '123456789', 'jperez', 'Juan', 'Pérez', 'González',
    '1990-05-10', 'jperez@email.com', '87889899', 
    '1234segura', 1, 2
);

CALL sp_users_get_by_identification('123456789');

CALL sp_users_update(
    '123456789', 'juanperez', 'Juan Carlos', 'Pérez', 'González',
    '1990-05-10', 'jc.perez@email.com', '77778888',
    '1234segura', 1, 2
);

--- CALL sp_users_delete('123456789');

CALL sp_accounts_create(1, 'CR05015202001012345678', 100000, 'CRC');

CALL sp_users_create(
    '123456789',       -- p_identification
    'jperez',          -- p_username
    'Juan',            -- p_name
    'Pérez',           -- p_lastnameone
    'González',        -- p_lastnametwo
    '1990-05-10',      -- p_borndate
    'jperez@email.com',-- p_email
    '87889899',        -- p_phone
    '1234segura',      -- p_password
    1,                 -- p_idusertype
    1                  -- p_idtypeidentification
);

