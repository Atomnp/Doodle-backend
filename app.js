const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const helmet =require('helmet');

const server = require("http").createServer(app);

//Emit post changed event to all conneted sockets
const emitPostsUpdated = function () {
  io.emit("postsUpdated");
};
module.exports = emitPostsUpdated;
//for image
const multer = require("multer");

const authRoute = require("./router/auth");
const postRoute = require("./router/posts");
const appRoutes = require("./router/appRoutes");

app.use(helmet());
//for image storage
const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    //console.log(file);
    if (file.fieldname === "uploadFile") {
      cb(null, "files");
    } else {
      cb(null, "images");
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now().toString() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  },
});

//filter to store different immage extensions
const fileFilter = (req, file, cb) => {
  //console.log(file);
  if (file.fieldname === "uploadFile") {
    cb(null, true);
  } else if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};


app.use(cors());

//for the form data
app.use(bodyParser.json());

//this add req.file file attribute in the request object which contentsfile we picked in frontnend
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).any());

//for serving staic files
app.use("/images", express.static(path.join(__dirname, "images")));

//Custom middleware for routes
app.use("/auth", authRoute);
app.use("/posts", postRoute);
app.use(appRoutes);

//Error handler middleware
app.use((error, req, res, next) => {
  //console.log(error);
  const message = error.message;
  let statusCode;
  if (error.statusCode) {
    const statusCode = error.statusCode;
  } else {
    statusCode = 500;
  }
  //console.log("sucessfully in error handling function in app.js");
  res.status(statusCode).json({
    message: message,
  });
});

//Load and connect to mongoose database
const myUrl =
  "mongodb+srv://aayushlamichhane:clfa5b95b4@cluster0-cqxay.gcp.mongodb.net/SocialSite?retryWrites=true&w=majority";
const yourUrl =
  `${process.env.MONGO_URL}`;
mongoose
  .connect(yourUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Connected to the database sucessfully");
    console.log(process.env.port);
    server.listen(process.env.PORT || 8080);
    res.send("fuck")
  })
  .catch((err) => {
    //console.log(err);
  });
