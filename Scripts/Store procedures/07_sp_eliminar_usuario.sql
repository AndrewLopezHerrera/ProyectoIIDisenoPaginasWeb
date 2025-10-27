/* ==========================================================
   7. PROCEDIMIENTO: sp_eliminar_usuario
   ----------------------------------------------------------
   Descripción:
       Elimina un usuario del sistema, junto con sus datos
       relacionados (según restricciones de clave foránea).

   Parámetros:
       p_ident  Identificación del usuario a eliminar.
   ========================================================== */
CREATE OR REPLACE PROCEDURE sp_eliminar_usuario(p_ident TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM orbita.Users
    WHERE Identification = p_ident;
END;
$$;