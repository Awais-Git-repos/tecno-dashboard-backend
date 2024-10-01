const User = require("../Models/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Login = async (req, res) => {
  const { email, password } = req.body;
  console.log("The coming mail is: ", email);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .json({ msg: "User with this email doesnot exists" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(200).json({ msg: "Password Incorrect" });
    }
    const payload = {
      user: {
        id: user.id,
      },
    };
    jwt.sign(
      payload,
      process.env.JWTSECRET,
      { expiresIn: 360000 },
      async (err, token) => {
        if (err) throw err.message;
        return res.status(200).json({ token });
      }
    );
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports = { Login };
