const dotenv = require("dotenv");
dotenv.config();

const configObject = {
  puerto: process.env.PUERTO,
  mongo_url: process.env.MONGO_URL,
  secret_key: process.env.SECRET_KEY,
  password_aplicacion: process.env.PASSWORD_APLICACION,
  gmail_aplicacion: process.env.GMAIL_APLICACION,
};

module.exports = configObject;
