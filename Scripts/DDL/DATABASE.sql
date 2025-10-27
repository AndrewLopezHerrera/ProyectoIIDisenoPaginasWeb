-- ========================================
-- LIMPIEZA PREVIA (SI YA EXISTE EL ESQUEMA)
-- ========================================
DROP SCHEMA IF EXISTS orbita CASCADE;
CREATE SCHEMA orbita;
SET search_path TO orbita;

-- ========================================
-- TABLAS DE CATÁLOGOS
-- ========================================

-- Tipos de identificación
CREATE TABLE TypeIdentificationUser (
    ID SERIAL PRIMARY KEY,
    Type TEXT UNIQUE NOT NULL
);

-- Tipos de usuario
CREATE TABLE UserType (
    ID SERIAL PRIMARY KEY,
    Type TEXT UNIQUE NOT NULL
);

-- Tipos de cuenta
CREATE TABLE TypeAccount (
    ID SERIAL PRIMARY KEY,
    Type TEXT NOT NULL
);

-- Tipos de moneda
CREATE TABLE Budge (
    ID SERIAL PRIMARY KEY,
    Type TEXT NOT NULL
);

-- ========================================
-- TABLA DE USUARIOS
-- ========================================
CREATE TABLE Users (
    Identification TEXT PRIMARY KEY,
    UserName TEXT UNIQUE NOT NULL,
    Name TEXT NOT NULL,
    LastNameOne TEXT NOT NULL,
    LastNameTwo TEXT NOT NULL,
    BornDate DATE NOT NULL,
    Email TEXT NOT NULL,
    Phone TEXT,
    Password TEXT NOT NULL,
    IDUser INT NOT NULL,
    IDTypeIdentification INT NOT NULL,
    FOREIGN KEY (IDUser) REFERENCES UserType(ID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (IDTypeIdentification) REFERENCES TypeIdentificationUser(ID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ========================================
-- TABLA DE CUENTAS
-- ========================================
CREATE TABLE Account (
    IBAN TEXT PRIMARY KEY,
    Funds MONEY NOT NULL,
    IDUser TEXT NOT NULL,
    IDTypeMoney INT NOT NULL,
    IDTypeAccount INT NOT NULL,
    FOREIGN KEY (IDUser) REFERENCES Users(Identification) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (IDTypeMoney) REFERENCES Budge(ID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (IDTypeAccount) REFERENCES TypeAccount(ID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ========================================
-- TABLA DE TARJETAS
-- ========================================
CREATE TABLE Card (
    NumberCard CHAR(16) PRIMARY KEY,
    IBAN TEXT NOT NULL,
    IDUser TEXT NOT NULL,
    PIN TEXT NOT NULL,  -- almacenado encriptado
    CVV TEXT NOT NULL,  -- almacenado encriptado
    ExpDate DATE NOT NULL,
    FOREIGN KEY (IBAN) REFERENCES Account(IBAN) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (IDUser) REFERENCES Users(Identification) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ========================================
-- TABLA DE MOVIMIENTOS
-- ========================================
CREATE TABLE Movement (
    ID SERIAL PRIMARY KEY,
    Amount MONEY NOT NULL,
    DateMovement DATE NOT NULL,
    Detail TEXT NOT NULL,
    IBAN TEXT NOT NULL,
    Card CHAR(16) NOT NULL,
    FOREIGN KEY (IBAN) REFERENCES Account(IBAN) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Card) REFERENCES Card(NumberCard) ON DELETE CASCADE ON UPDATE CASCADE
);
