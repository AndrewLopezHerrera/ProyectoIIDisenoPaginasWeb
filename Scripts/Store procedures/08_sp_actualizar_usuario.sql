/* ==========================================================
   8. PROCEDIMIENTO: sp_actualizar_usuario
   ----------------------------------------------------------
   Descripción:
       Permite modificar los datos de contacto y contraseña
       de un usuario existente.

   Parámetros:
       p_identification  Identificación del usuario.
       p_email           Nuevo correo electrónico.
       p_phone           Nuevo número telefónico.
       p_password        Nueva contraseña.
   ========================================================== */
CREATE OR REPLACE PROCEDURE sp_actualizar_usuario(
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
