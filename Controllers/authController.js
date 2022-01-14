import User from "../Models/userModel.js";
import generateToken from "../Utils/generateToken.js";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  try {
    if ((!username || !email || !password, !confirmPassword)) {
      return res
        .status(400)
        .json({ message: `Please fill all the required fields` });
    }

    const oldUsername = await User.findOne({ username });
    if (oldUsername) {
      return res.status(400).json({ message: `Username is already in use` });
    }

    const oldEmail = await User.findOne({ email });
    if (oldEmail) {
      return res.status(400).json({ message: `Email is already in use` });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: `Password must be same` });
    }

    const newUser = await User.create({
      username,
      email,
      password,
    });

    const user = await newUser.save();
    const token = await generateToken(user._id);
    return res
      .status(201)
      .json({ message: `User registration successfull`, user, token });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!password || !email) {
      return res
        .status(404)
        .json({ message: `Please enter all required fields` });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: `User not found` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: `Invalid Credentials` });
    }

    const token = await generateToken(user._id);
    return res.status(200).json({ message: `Login Successfull`, token });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
