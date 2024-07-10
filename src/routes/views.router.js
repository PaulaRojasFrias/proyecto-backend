const express = require("express");
const router = express.Router();
const ViewsController = require("../controllers/view.controller.js");
const viewsController = new ViewsController();
const checkUserRole = require("../midleware/checkrole.js");
const passport = require("passport");
const generateProducts = require("../utils/utils.js");
const authMiddleware = require("../midleware/authmiddleware.js");
router.get(
  "/products",
  checkUserRole(["user"]),
  passport.authenticate("jwt", { session: false }),
  viewsController.renderProducts
);

router.get("/carts/:cid", authMiddleware, viewsController.renderCart);
router.get("/login", viewsController.renderLogin);
router.get("/register", viewsController.renderRegister);

router.get(
  "/realtimeproducts",
  checkUserRole(["admin", "premium"]),
  viewsController.renderRealTimeProducts
);
router.get("/chat", checkUserRole(["user"]), viewsController.renderChat);

router.get("/", authMiddleware, (req, res) => {
  console.log("Usuario autenticado:", req.user);
  res.render("home", { user: req.user, isAuthenticated: req.isAuthenticated });
});

router.get("/mockingProducts", (req, res) => {
  const products = generateProducts();
  res.json(products);
});

router.get("/reset-password", viewsController.renderResetPassword);
router.get("/password", viewsController.renderCambioPassword);
router.get("/confirmacion-envio", viewsController.renderConfirmacion);
router.get("/panel-premium", viewsController.renderPremium);
router.get("/usersView", viewsController.renderUsersView);

module.exports = router;
