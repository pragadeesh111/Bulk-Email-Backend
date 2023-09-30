var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const { SendMail } = require("../schemas/MailSchema");
const { SendEmailToUser } = require("../utilits/SendEmail");
var UserModel = require("../schemas/ValidationSchemas");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

/* Send Mail */
router.post("/sendmail", async (req, res) => {
  let data = await jwt.decode(req.body.token);
  req.body.token = data.email;
  // console.log(data);
  let user = await UserModel.findOne({ email: req.body.token });
  try {
    if (user) {
      //send mail
      let customer = await SendMail.create({
        toEmail: req.body.toEmail,
        subject: req.body.subject,
        content: req.body.content,
        users_id: user.id,
      });
      customer.save();
      let senderMail = user.email;
      let senderName = user.firstName;

      let { toEmail } = req.body;
      console.log(toEmail);

      let ToEmail = "";
      for (let i = 0; i < toEmail.length; i++) {
        ToEmail += toEmail[i] + ",";
      }
      console.log(ToEmail);

      let { subject } = req.body;
      let { content } = req.body;
      SendEmailToUser(senderName, senderMail, ToEmail, subject, content);
      res.status(201).send({
        message: "Send Email Successfull",
      });
    } else {
      res.status(401).send({
        message: "Failed Resend Email",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
