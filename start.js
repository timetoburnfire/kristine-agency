var express = require("express");
var path = require("path");
var fs = require("fs");
var io = require("io");
var bodyParser = require("body-parser");
var serveFavicon = require("serve-favicon");
var pg = require("pg");
var Sequelize = require("sequelize");
var email = require("emailjs");

var sequelize = new Sequelize("dee8e77384ipme", "ippgkvtmbtfchu", "BAJF5pzi4LSlv0grXKyOz33hHM", {
    dialect:  "postgres",
    protocol: "postgres",
    port:  "5432",
    host: "ec2-54-163-228-109.compute-1.amazonaws.com",
    dialectOptions: {
        ssl: true
    }
});

var email = email.server.connect({
  user: "kristineagencyinfo@gmail.com",
  password: "h3idbk884vjrjk8475gdvnfgeipk6",
  host: "smtp.gmail.com",
  ssl: true
});

var app = express();

var login = require(__dirname + "/api/login.js");
var secondHalf = require(__dirname + "/api/second-half.js");
var events = require(__dirname + "/api/events.js");
var feedback = require(__dirname + "/api/feedback.js");

var loginVerification = login.verification;
var loginApi = login.api;

app.set("port", 5000);

app.use(serveFavicon(__dirname + "/favicon.ico"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/manager/public")));
app.use("/files/photos", express.static(__dirname + "/files/photos"));
app.use("/files/posters", express.static(__dirname + "/files/posters"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.get("/manager", function (req, res) {
  fs.createReadStream("manager/public/index.html").pipe(res);
});

app.use(loginApi);
// app.use(loginVerification);
app.use(secondHalf({ database: sequelize }));
app.use(events({ database: sequelize }));
app.use(feedback({ database: sequelize, email: email }));

app.get("*", function (req, res) {
  res.writeHead(500);
  res.end("Error loading " + req.url);
});

process.on("uncaughtException", function(mainError) {
  var mainErrorMessage = __filename + "::" + __line +  "\n" + mainError.toString();
  io.write(mainErrorMessage, "red");
});

app.listen(process.env.PORT || app.get("port"), function() {
  console.log("Node app is running on port", app.get("port"));
});