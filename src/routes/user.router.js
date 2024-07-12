const express = require("express");
const router = express.Router();
const passport = require("passport");
const UserController = require("../controllers/user.controller.js");
const userController = new UserController();
const UserModel = require("../models/user.model");
const { createHash } = require("../utils/hashBcrypt");
const upload = require("../midleware/multer.js");
const authMiddleware = require("../midleware/authMiddleware");
const checkUserRole = require("../midleware/checkrole.js");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  userController.profile
);
router.post("/logout", userController.logout.bind(userController));
router.get(
  "/admin",
  passport.authenticate("jwt", { session: false }),
  userController.admin
);

router.post("/requestPasswordReset", userController.requestPasswordReset);
router.post("/reset-password", userController.resetPassword);
router.put("/premium/:uid", userController.changeToPremiumRole);

router.post(
  "/:uid/documents",
  upload.fields([
    { name: "document" },
    { name: "products" },
    { name: "profile" },
  ]),
  async (req, res) => {
    try {
      await userController.uploadDocuments(req, res);
    } catch (error) {
      console.error("Error en la ruta de documentos", error);
      res.status(500).send("Error interno del servidor");
    }
  }
);

router.get("/", userController.getUsers);

router.delete("/", userController.deleteInactiveUsers);

router.delete("/:id", async (req, res) => {
  try {
    await userController.deleteUser(req, res);
  } catch (error) {
    console.error("Error al eliminar usuario", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/:userId/role", userController.updateUserRole);

module.exports = router;
