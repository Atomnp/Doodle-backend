const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const postController = require("../controllers/posts");

const isAuth = require("../middlewares/authorization");

router.post("/getPosts", isAuth,adminController.getPosts);
router.post("/approvePost/:id", isAuth, adminController.approvePost);
router.post("/deletePost/:postId", isAuth, postController.deletePost);

module.exports = router;