const mongoose = require("mongoose");
const Validation = require("validator");

const ValidationSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      validate: (value) => {
        return Validation.isEmail(value);
      },
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    activation: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
  }
);

const UserModel = mongoose.model("users", ValidationSchema);

module.exports = UserModel;

