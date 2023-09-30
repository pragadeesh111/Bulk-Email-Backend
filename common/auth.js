const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
SALT_COUNT = 10;
SECRET_KEY = "Aolem@dvsd/vdssdfgg";

const HashPassword = async (password) => {
  let salt = await bcrypt.genSalt(SALT_COUNT);
  let hassedPassword = await bcrypt.hash(password, salt);
  return hassedPassword;
};

const HashCompare = async (password, hasedPassword) => {
  return await bcrypt.compare(password, hasedPassword);
};

const CreateToken = async (payload) => {
  let token = await jwt.sign(payload, SECRET_KEY, {
    expiresIn: "10h",
  });
  return token;
};

const createForgetToken = async (payload) => {
  let tokenn = await jwt.sign(payload, SECRET_KEY, {
    expiresIn: "5m",
  });
  return tokenn;
};

const Validation = async (req, res, next) => {
  if (req.headers.authorization) {
    let token = req.headers.authorization.split(" ")[1];
    let data = await jwt.decode(token);
    console.log(data);
    if (Math.floor(+new Date() / 1000) < data.exp) next();
    else res.status(401).send({ message: "Token Expired!" });
  } else {
    res.status(400).send({ message: "Token Not Found" });
  }
};

const AdminGuard = async (req, res, next) => {
  if (req.headers.authorization) {
    let token = req.headers.authorization.split(" ")[1];
    let data = await jwt.decode(token);
    if (data.role === "admin") next();
    else res.status(401).send({ message: "Only allowed Admin!" });
  } else {
    res.status(400).send({ message: "Token Not Found" });
  }
};

module.exports = {
  HashPassword,
  HashCompare,
  CreateToken,
  Validation,
  AdminGuard,
  createForgetToken,
};
