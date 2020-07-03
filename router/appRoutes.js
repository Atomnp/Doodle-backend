const express = require("express");
const router = express.Router();
const appController = require("../controllers/app");
const isAuth = require("../middlewares/authorization");

router.get("/profile/:userId", appController.getProfile);
router.put("/updateProfile/:userId",isAuth, appController.updateProfile);
router.post("/addFile", isAuth, appController.addFile);
router.get("/downloadFile/:fileId", appController.downloadFile);
router.post("/getFiles", appController.getDownloadFiles);
router.post("/postImageFromTinyMce", appController.postImageFromTinyMce);

module.exports = router;
