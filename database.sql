-- Base de datos de la ferretería (MySQL / XAMPP).
-- Las tablas categoria, productos, etc. ya existen; esto solo agrega la tabla de usuarios.
USE ferreteria;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  creado TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
