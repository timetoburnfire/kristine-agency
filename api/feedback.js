module.exports = function (options) {
  var path = require("path");
  var express = require("express");
  var sequelize = require("sequelize");
  var multiparty = require("multiparty");
  
  var Router = express.Router;
  var Form =  multiparty.Form;
  
  var feedback = new Router();

  var database = options.database;
  var email = options.email;
  
  var Feedback = database.define("feedback", {
    name: sequelize.STRING,
    phone: sequelize.STRING,
    reason: sequelize.STRING(500),
    status: {
      type: sequelize.FLOAT,
      defaultValue: 0
    }
  });

  feedback.post("/feedback", function (req, res) {
    var form = new Form();
    var result = { };
    form.on("field", function (name, value) {
      result[name] = value;
    });
    form.on("close", function () {
      Feedback.sync({ force: true }).then(function () {
        Feedback.create(result).then(function (feedbackData) {
          email.send({
            subject: "Принята новыя заявка на контакт.",
            from: "kristineagencyinfo@gmail.com",
            to: "timetoburnfire@gmail.com,369tree369@gmail.com",
            text: "От кого: " + feedbackData.name + "." + "\nТелефон: " + feedbackData.phone + "\nПричина: " + feedbackData.reason + "."
          }, function (err, message) {
            if (err) throw new Error(err);
          });
          res.json(feedbackData);
        });
      });
    });
    form.parse(req);
  });

  return feedback;

};