const express = require("express");
const router = express.Router();
const ViewsController = require("../controllers/view.controller.js");
const viewsController = new ViewsController();
const checkUserRole = require("../middleware/checkrole.js");
const passport = require("passport");
const generateProducts = require("../utils/utils.js");
const authMiddleware = require("../middleware/authmiddleware.js");
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
  const isAdmin = req.user && req.user.role === "admin";
  const isUser = req.user && req.user.role === "user";
  const isPremium = req.user && req.user.role === "premium";

  res.render("home", {
    user: req.user,
    isAuthenticated: req.isAuthenticated(),
    isAdmin,
    isUser,
    isPremium,
  });
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
