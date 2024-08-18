const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/userdetails", authController.getUserDetails);
router.post("/token", authController.generateToken);
router.post("/refresh-token", authController.refreshToken);

module.exports = router;
