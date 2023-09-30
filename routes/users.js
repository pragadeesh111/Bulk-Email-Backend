var express = require("express");
const jwt = require("jsonwebtoken");
var router = express.Router();
var {
  HashPassword,
  HashCompare,
  CreateToken,
  Validation,
  createForgetToken,
} = require("../common/auth");
var { SendResetEmail } = require("../common/PasswordReset");
var UserModel = require("../schemas/ValidationSchemas");

/* User SignUp Form */
/* GET users listing. */

router.get("/", Validation, async (req, res) => {
  try {
    let user = await UserModel.find({}, { password: 0 });
    res.status(201).send({
      user,
      message: "User Fetch Data Successfull",
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
});

// GET LOGIN USER DETAILS
router.post("/getuser", async (req, res) => {
  try {
    let data = await jwt.decode(req.body.token);
    req.body.token = data.email;
    let user = await UserModel.findOne({ email: req.body.token });

    res.status(201).send({
      user,
      message: "User Fetch Data Successfull",
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
});

router.post("/verifyAccount", async (req, res) => {
  try {
    let data = await jwt.decode(req.body.token);
    req.body.token = data.email;

    let user = await UserModel.findByIdAndUpdate(
      {
        email: req.body.token,
      },
      {
        activation: true,
      }
    );
    res.status(201).send({
      message: "User Verify Successfull",
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
});

// User Data Fetch
router.get("/:id", async (req, res) => {
  try {
    let user = await UserModel.find({ _id: req.params.id });
    res.status(201).send({
      user,
      message: "User Data Successfull",
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
});

/* POST Request User SignUp */
router.post("/signup", async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      let hasedPassword = await HashPassword(req.body.password);
      req.body.password = hasedPassword;
      let user = await UserModel.create(req.body);
      res.status(201).send({
        message: "User Signup Successfull",
      });
    } else {
      res.status(400).send({
        message: "User Already Exist!",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
});

/* Delete User */
router.delete("/:id", async (req, res) => {
  try {
    let user = await UserModel.findOne({ _id: req.params.id });
    if (user) {
      let user = await UserModel.deleteOne({ _id: req.params.id });
      res.status(201).send({
        message: "User Delete Successfull",
      });
    } else {
      res.status(400).send({
        message: "Invalid User!",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
});

/* Update User */
router.put("/edituser", async (req, res) => {
  try {
    let data = await jwt.decode(req.body.token);
    req.body.token = data.email;
    let user = await UserModel.findOne({ email: req.body.token });
    if (user) {
      let user = await UserModel.updateOne(req.body);
      res.status(201).send({
        message: "User Update Successfull",
      });
    } else {
      res.status(400).send({
        message: "Invalid User!",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
});

/* User Login  */

router.post("/login", async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.body.email });
    if (user) {
      //Verify password
      if (await HashCompare(req.body.password, user.password)) {
        //Token Create
        let token = await CreateToken({
          name: user.name,
          email: user.email,
          id: user._id,
          role: user.role,
        });
        res.status(201).send({
          token,
          message: "User Login Successfull",
        });
      } else {
        res.status(402).send({
          message: "User Cretendial",
        });
      }
    } else {
      res.status(400).send({
        message: "User Not Exist!",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
});

//Forgot Password
router.post("/forgetPassword", async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.body.email });
    if (user) {
      //create token
      let token = await createForgetToken({ id: user._id });

      //send mail
      const url = `https://bulk-email-tool-frontend.netlify.app/reset-password/${token}`;
      const name = user.firstName;
      const email = user.email;
      SendResetEmail(email, url, "Reset Your Password", name);

      //success
      res
        .status(200)
        .send({ message: "Link Has Been Sent To Your Email Id", token });
    } else {
      res.status(400).send({ message: "Invalid User" });
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error });
  }
});

//Reset Password
router.post("/resetPassword", async (req, res) => {
  console.log(req.headers.authorization);
  try {
    if (req.headers.authorization) {
      let token = req.headers.authorization.split(" ")[1];
      let data = await jwt.decode(token);
      // console.log(token);
      let currentTime = Math.floor(+new Date() / 1000);
      if (currentTime < data.exp) {
        let hashedPassword = await HashPassword(req.body.password);
        let user = data;

        let updatedData = await UserModel.findOneAndUpdate(
          { _id: user.id },
          { password: hashedPassword }
        );
        updatedData.save();
        res.status(200).send({ message: "Password Changed Successfully !!!" });
      } else {
        res.status(401).send({ message: "Token Expired Try Again" });
      }
    } else {
      res.status(401).send({ message: "Token Not Found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error", error });
  }
});

module.exports = router;
