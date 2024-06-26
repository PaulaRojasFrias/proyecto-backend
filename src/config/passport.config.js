const passport = require("passport");
const local = require("passport-local");
const UserModel = require("../models/user.model.js");
const { createHash, isValidPassword } = require("../utils/hashBcrypt.js");
const jwt = require("passport-jwt");
const JWTStrategy = jwt.Strategy;
const ExtractJwt = jwt.ExtractJwt;

const LocalStrategy = local.Strategy;

// Función para inicializar Passport
const initializePassport = () => {
  // Estrategia de registro
  passport.use(
    "register",
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: "email",
      },
      async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body;
        try {
          let user = await UserModel.findOne({ email });
          if (user) return done(null, false);
          let newUser = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
          };
          let result = await UserModel.create(newUser);
          return done(null, result);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Estrategia de login
  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
      },
      async (email, password, done) => {
        try {
          const user = await UserModel.findOne({ email });
          if (!user) {
            console.log("El usuario no existe");
            return done(null, false);
          }
          if (!isValidPassword(password, user)) return done(null, false);
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialización y deserialización de usuarios
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    let user = await UserModel.findById(id);
    done(null, user);
  });

  // Estrategia de autenticación con JWT
  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: "ecommercebackend",
      },
      async (jwt_payload, done) => {
        try {
          const user = await UserModel.findById(jwt_payload.user._id);
          if (!user) {
            return done(null, false);
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};

// Función para extraer el token JWT de las cookies
const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["coderCookieToken"];
  }
  return token;
};

module.exports = initializePassport;
