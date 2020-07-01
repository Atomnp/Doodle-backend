const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const isAuth = require("../middlewares/authorization");

//string validation like email and password requirements
const { check, validationResult } = require("express-validator");

router.put(
  "/signup",
  [
    check("email").trim().isEmail(),
    check("password").trim().isLength({ min: 5 }),
    check("name").isString().withMessage("Name format mismatch."),
  ],
  authController.postSignUp
);

router.post(
  "/login",
  [check("email").trim().isEmail(), check("password").trim()],
  authController.postLogIn
);
router.get("/verify", authController.verifyUser);

module.exports = router;
