require('dotenv').config();
const db = require('../src/config/db');

const [email, password] = process.argv.slice(2);

if (!email || !password) {
  console.error('Uso: npm run crear-usuario -- correo@ejemplo.com contraseña');
  process.exit(1);
}

db.saveUser(email.trim(), password)
  .then(() => console.log(`Usuario ${email} guardado.`))
  .catch((error) => {
    console.error('No se pudo guardar el usuario:', error.message);
    process.exitCode = 1;
  })
  .finally(() => db.pool.end());
