const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const compression = require("express-compression");
const cors = require("cors");
const socket = require("socket.io");
const exphbs = require("express-handlebars");
const jwt = require("jsonwebtoken");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUiExpress = require("swagger-ui-express");
const passport = require("passport");

// Configuración y utilidades
const configObject = require("./config/config.js");
const { puerto, mongo_url, secret_key } = configObject;
require("./database.js"); // Inicialización de la base de datos
const errorManager = require("./midleware/error.js");
const addLogger = require("./utils/logger.js");

// Inicializar la aplicación
const app = express();

// Configuración Handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./src/public"));
app.use(compression());
app.use(cookieParser());
app.use(errorManager);
app.use(addLogger);

// Sesion con MongoDB
app.use(
  session({
    secret: secret_key,
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: mongo_url,
      ttl: 90,
    }),
  })
);

// Inicializar Passport
const initializePassport = require("./config/passport.config.js");
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

// Middleware de autenticación
const authMiddleware = require("./midleware/authmiddleware.js");
app.use(authMiddleware);

// Documentación con Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Documentación del ecommerce",
      description: "Backend de ecommerce",
    },
  },
  apis: ["./src/docs/**/*.yaml"],
};
const specs = swaggerJSDoc(swaggerOptions);
app.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

// Rutas
const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const viewsRouter = require("./routes/views.router.js");
const userRouter = require("./routes/user.router.js");

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);
app.use("/api/users", userRouter);

// Iniciar el servidor
const httpServer = app.listen(puerto, () => {
  console.log(`Escuchando con express en http://localhost:${puerto}`);
});

// Configuracion WebSockets
const SocketManager = require("./sockets/socketmanager.js");
new SocketManager(httpServer);

module.exports = app;
