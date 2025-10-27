-- ========================================
-- INSERCIONES INICIALES
-- ========================================
SET search_path TO orbita;

-- Tipos de identificación
INSERT INTO TypeIdentificationUser (Type)
VALUES 
('Cédula Nacional'),
('Pasaporte'),
('DIMEX');

-- Tipos de usuario
INSERT INTO UserType (Type)
VALUES 
('Cliente'),
('Administrador'),
('Cajero');

-- Tipos de cuenta
INSERT INTO TypeAccount (Type)
VALUES 
('Cuenta Corriente'),
('Cuenta Ahorros'),
('Cuenta Empresarial');

-- Tipos de moneda
INSERT INTO Budge (Type)
VALUES 
('Colones'),
('Dólares'),
('Euros');

-- ========================================
-- USUARIOS
-- ========================================
INSERT INTO Users (Identification, UserName, Name, LastNameOne, LastNameTwo, BornDate, Email, Phone, Password, IDUser, IDTypeIdentification)
VALUES
('101230456', 'diana_m', 'Diana', 'Montero', 'Vargas', '1996-04-12', 'diana.montero@orbita.com', '88887777', '1234abc', 1, 1),
('204560321', 'ricardo_g', 'Ricardo', 'Gómez', 'Jiménez', '1990-11-22', 'ricardo.gomez@orbita.com', '88776655', 'abcd1234', 1, 1),
('A12345', 'ana_p', 'Ana', 'Pérez', 'López', '1985-06-03', 'ana.perez@orbita.com', '88998877', 'clave2024', 2, 2);

-- ========================================
-- CUENTAS
-- ========================================
INSERT INTO Account (IBAN, Funds, IDUser, IDTypeMoney, IDTypeAccount)
VALUES
('CR0001ORB001', 500000.00, '101230456', 1, 1),
('CR0002ORB002', 2500.50, '204560321', 2, 2),
('CR0003ORB003', 720000.00, 'A12345', 1, 3);

-- ========================================
-- TARJETAS
-- ========================================
INSERT INTO Card (NumberCard, IBAN, IDUser, PIN, CVV, ExpDate)
VALUES
('1111222233334444', 'CR0001ORB001', '101230456', 'ENC:1234', 'ENC:567', '2027-12-31'),
('5555666677778888', 'CR0002ORB002', '204560321', 'ENC:9999', 'ENC:123', '2026-09-30'),
('9999000011112222', 'CR0003ORB003', 'A12345', 'ENC:4321', 'ENC:999', '2028-03-31');

-- ========================================
-- MOVIMIENTOS
-- ========================================
INSERT INTO Movement (Amount, DateMovement, Detail, IBAN, Card)
VALUES
(15000.00, '2025-01-15', 'Pago de servicios públicos', 'CR0001ORB001', '1111222233334444'),
(500.00, '2025-02-10', 'Compra en supermercado', 'CR0002ORB002', '5555666677778888'),
(30000.00, '2025-03-05', 'Depósito de nómina', 'CR0003ORB003', '9999000011112222');


SELECT * FROM orbita.Users;
SELECT * FROM orbita.Account;
SELECT * FROM orbita.Movement;

