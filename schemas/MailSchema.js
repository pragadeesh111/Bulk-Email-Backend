const mongoose = require("mongoose");
const Validation = require("validator");

const MailSchema = new mongoose.Schema(
  {
    users_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    toEmail: [],
    subject: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

const SendMail = mongoose.model("SenderMails", MailSchema);

module.exports = { SendMail };

