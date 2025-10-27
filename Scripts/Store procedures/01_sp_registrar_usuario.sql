
/* ==========================================================
   1. PROCEDIMIENTO: sp_registrar_usuario
   ----------------------------------------------------------
   Descripción:
       Registra un nuevo usuario en el sistema con sus datos
       personales y credenciales de acceso.

   Parámetros:
       p_identification        Identificación del usuario.
       p_username              Nombre de usuario.
       p_name                  Nombre.
       p_lastnameone           Primer apellido.
       p_lastnametwo           Segundo apellido.
       p_borndate              Fecha de nacimiento.
       p_email                 Correo electrónico.
       p_phone                 Teléfono.
       p_password              Contraseña.
       p_idusertype            Tipo de usuario.
       p_idtypeident           Tipo de identificación.
   ========================================================== */
CREATE OR REPLACE PROCEDURE sp_registrar_usuario(
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