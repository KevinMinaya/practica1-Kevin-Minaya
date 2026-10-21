# Ferretería El Martillo

Inventario con Node.js, Express, EJS y MySQL (XAMPP). Usa la base `ferreteria`, tabla `productos` y `categoria`, y permite consultar, agregar, editar y eliminar productos.

## Puesta en marcha

1. En XAMPP, inicia **MySQL**.
2. Copia `.env.example` a `.env` (ajusta `DB_PASSWORD` si tu root tiene contraseña).
3. Ejecuta `database.sql` en phpMyAdmin (agrega la tabla `usuarios`; las demás ya existen).
4. Crea un usuario de acceso:

   ```sh
   npm install
   npm run crear-usuario -- correo@ejemplo.com tu_contraseña
   ```

5. Inicia la app con `npm run dev` y abre http://localhost:3000.

Las contraseñas se guardan con hash (scrypt). Para producción usa HTTPS y un almacén de sesiones persistente.
