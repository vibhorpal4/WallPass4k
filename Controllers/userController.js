import User from "../Models/userModel.js";
import cloudinary from "cloudinary";
import removeTmp from "../Utils/removeTmp.js";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export const getAllUser = async (req, res) => {
  try {
    const { latest } = req.query;

    const users = latest
      ? await User.find().sort({ createdAt: -1 }).limit(10).select("-password")
      : await User.find().select("-password");

    if (!users) {
      return res.status(404).json({ message: `No user found` });
    }

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const getUserStats = async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const monthData = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);

    const yearData = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          year: { $year: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$year",
          total: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({ monthData, yearData });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const getUser = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ message: `User not found` });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const deleteUser = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: `User not found` });
    }
    if (user.username === req.user.username || user.isAdmin) {
      await user.deleteOne();
      return res.status(200).json({ message: `Account deleted succesfully` });
    } else {
      return res.status(401).json({ message: `Invalid Access` });
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const updateUser = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: `User not found` });
    }

    if (req.user.username === user.username || user.isAdmin) {
      if (req.files) {
        const { profile_pic } = req.files;

        // if (profile_pic.size > 1024 * 1024) {
        //     removeTmp(profile_pic.tempFilePath)
        //     return res.status(400).json({ msg: "Size too large" })
        // }

        if (
          profile_pic.mimetype !== "image/jpeg" &&
          profile_pic.mimetype !== "image/png"
        ) {
          removeTmp(profile_pic.tempFilePath);
          return res.status(400).json({ msg: "File format is incorrect." });
        }
        const result = await cloudinary.v2.uploader.upload(
          profile_pic.tempFilePath,
          { folder: "User Profile" }
        );
        await user.updateOne({
          $set: {
            username: req.body.username || user.username,
            name: req.body.name || user.name,
            profile_pic: result.url || user.profile_pic,
            isAdmin: req.user.isAdmin || user.isAdmin,
            email: req.body.email || user.email,
          },
        });
        return res
          .status(200)
          .json({ message: `User Profile update successfull` });
      } else {
        await user.updateOne({ $set: req.body });
        return res
          .status(200)
          .json({ message: `User Profile Update successfully` });
      }
    } else {
      return res.status(401).json({ message: `Invalid Access` });
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const followUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id });
    const currentUser = await User.findOne({ _id: req.user._id });
    if (user._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ message: `You can't follow yourself` });
    } else {
      if (!user.followers.includes(req.user._id)) {
        await user.updateOne({
          $push: { followers: req.user._id },
        });
        await currentUser.updateOne({
          $push: { followings: user._id },
        });
        return res.status(200).json({ message: `User has been followed` });
      } else {
        return res
          .status(403)
          .json({ message: `You allready follow this user` });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id });
    const currentUser = await User.findOne({ _id: req.user._id });
    if (user._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ message: `You can't unFollow yourself` });
    } else {
      if (user.followers.includes(req.user._id)) {
        await user.updateOne({
          $pull: { followers: req.user._id },
        });
        await currentUser.updateOne({
          $pull: { followings: user._id },
        });
        return res.status(200).json({ message: `User has been unFollowed` });
      } else {
        return res
          .status(403)
          .json({ message: `You allready unfollow this user` });
      }
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
