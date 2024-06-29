const UserModel = require("../models/user.model.js");
const CartModel = require("../models/cart.model.js");
const jwt = require("jsonwebtoken");
const { createHash, isValidPassword } = require("../utils/hashBcrypt.js");
const UserDTO = require("../dto/user.dto.js");
const CustomError = require("../services/errors/custom-error.js");
const { generateErrorInfo } = require("../services/errors/info.js");
const EErrors = require("../services/errors/enums.js");
const { generateResetToken } = require("../utils/tokenreset.js");
const EmailManager = require("../services/email.js");
const emailManager = new EmailManager();
const UserRepository = require("../repositories/user.repository.js");
const userRepository = new UserRepository();

class UserController {
  async register(req, res) {
    const { first_name, last_name, email, password, age } = req.body;
    try {
      if (!first_name || !last_name || !email) {
        throw CustomError.createError({
          name: "Usuario nuevo",
          cause: generateErrorInfo({ first_name, last_name, email }),
          message: "Error al intentar crear un usuario",
          code: EErrors.INCORRECT_DATA,
        });
      }

      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).send("El usuario ya existe");
      }

      const newCart = new CartModel();
      await newCart.save();

      const newUser = new UserModel({
        first_name,
        last_name,
        email,
        cart: newCart._id,
        password: createHash(password),
        age,
      });

      await newUser.save();

      const token = jwt.sign({ user: newUser }, "ecommercebackend", {
        expiresIn: "1h",
      });

      res.cookie("coderCookieToken", token, {
        maxAge: 3600000,
        httpOnly: true,
      });

      res.redirect("/api/users/profile");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error interno del servidor");
    }
  }

  async login(req, res) {
    const { email, password } = req.body;
    try {
      const foundUser = await UserModel.findOne({ email });

      if (!foundUser) {
        return res.status(401).send("Usuario no válido");
      }

      const isValid = isValidPassword(password, foundUser);
      if (!isValid) {
        return res.status(401).send("Contraseña incorrecta");
      }

      const token = jwt.sign({ user: foundUser }, "ecommercebackend", {
        expiresIn: "1h",
      });

      foundUser.last_connection = new Date();
      await foundUser.save();

      res.cookie("coderCookieToken", token, {
        maxAge: 3600000,
        httpOnly: true,
      });

      res.redirect("/api/users/profile");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error interno del servidor");
    }
  }

  async profile(req, res) {
    const isPremium = req.user.role === "premium";
    const userDto = new UserDTO(
      req.user.first_name,
      req.user.last_name,
      req.user.role
    );
    const isAdmin = req.user.role === "admin";
    const isAuthenticated = req.isAuthenticated();
    res.render("profile", {
      isAuthenticated,
      user: userDto,
      isAdmin,
      isPremium,
    });
  }

  async logout(req, res) {
    if (req.user) {
      try {
        req.user.last_connection = new Date();
        await req.user.save();
        res.clearCookie("coderCookieToken");
        res.redirect("/login");
      } catch (error) {
        console.error(error);
        res.status(500).send("Error interno del servidor");
      }
    }
  }

  async admin(req, res) {
    if (req.user.role !== "admin") {
      return res.status(403).send("Acceso denegado");
    }
    res.render("admin");
  }

  async requestPasswordReset(req, res) {
    const { email } = req.body;

    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).send("Usuario no encontrado");
      }

      const token = generateResetToken();

      user.resetToken = {
        token: token,
        expiresAt: new Date(Date.now() + 3600000),
      };
      await user.save();

      await emailManager.enviarCorreoRestablecimiento(
        email,
        user.first_name,
        token
      );

      res.redirect("/confirmacion-envio");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error interno del servidor");
    }
  }

  async resetPassword(req, res) {
    const { email, password, token } = req.body;

    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.render("passwordcambio", { error: "Usuario no encontrado" });
      }

      const resetToken = user.resetToken;
      if (!resetToken || resetToken.token !== token) {
        return res.render("passwordreset", {
          error: "El token de restablecimiento de contraseña es inválido",
        });
      }

      const now = new Date();
      if (now > resetToken.expiresAt) {
        return res.redirect("/passwordcambio");
      }

      if (isValidPassword(password, user)) {
        return res.render("passwordcambio", {
          error: "La nueva contraseña no puede ser igual a la anterior",
        });
      }

      user.password = createHash(password);
      user.resetToken = undefined;
      await user.save();

      return res.redirect("/login");
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .render("passwordreset", { error: "Error interno del servidor" });
    }
  }

  async changeToPremiumRole(req, res) {
    try {
      const { uid } = req.params;

      const user = await userRepository.findById(uid);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const requiredDocuments = [
        "Identificación",
        "Comprobante de domicilio",
        "Comprobante de estado de cuenta",
      ];
      const userDocuments = user.documents.map((doc) => doc.name);

      const hasRequiredDocuments = requiredDocuments.every((doc) =>
        userDocuments.includes(doc)
      );

      if (!hasRequiredDocuments) {
        return res.status(400).json({
          message:
            "El usuario debe cargar los siguientes documentos: Identificación, Comprobante de domicilio, Comprobante de estado de cuenta",
        });
      }
      const newRole = user.role === "user" ? "premium" : "user";

      const updatedUser = await userRepository.updateUserRole(uid, newRole);
      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async uploadDocuments(req, res) {
    const { uid } = req.params;
    const uploadedDocuments = req.files;

    try {
      const user = await userRepository.findById(uid);

      if (!user) {
        return res.status(404).send("Usuario no encontrado");
      }

      if (uploadedDocuments) {
        let documents = [];

        if (uploadedDocuments.document) {
          documents = documents.concat(
            uploadedDocuments.document.map((doc) => ({
              name: doc.originalname,
              reference: doc.path,
            }))
          );
        }
        if (uploadedDocuments.products) {
          documents = documents.concat(
            uploadedDocuments.products.map((doc) => ({
              name: doc.originalname,
              reference: doc.path,
            }))
          );
        }
        if (uploadedDocuments.profile) {
          documents = documents.concat(
            uploadedDocuments.profile.map((doc) => ({
              name: doc.originalname,
              reference: doc.path,
            }))
          );
        }

        user.documents = [...user.documents, ...documents];
        await user.save();
      }

      res.status(200).send("Documentos subidos exitosamente");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error interno del servidor");
    }
  }
}

module.exports = UserController;
