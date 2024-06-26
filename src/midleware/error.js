const { EErrors } = require("../services/errors/enums.js");

const errorManager = (error, req, res, next) => {
  console.log(error.cause);
  switch (error.code) {
    case EErrors.ERROR_ROUTE:
      res.send({ status: "error", error: error.name });
      break;
    case EErrors.INVALID_TYPE:
      res.send({ status: "error", error: error.name });
      break;
    case EErrors.DB_ERROR:
      res.send({ status: "error", error: error.name });
      break;
    case EErrors.INCORRECT_DATA:
      res.send({ status: "error", error: error.name });
      break;
    default:
      res.send({ status: "error", error: "Error desconocido" });
  }
};

module.exports = errorManager;
