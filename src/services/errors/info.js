const generateErrorInfo = (user) => {
  return ` Los datos estan incompletos o no son válidos. 
      Necesitamos recibir los siguientes datos: 
      - Nombre: String, recibimos ${user.first_name}
      - Apellido: String, recibimos ${user.last_name}
      - Email: String, recibimos ${user.email}
      `;
};

module.exports = { generateErrorInfo };
