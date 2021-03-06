import Image from "../Models/imageModel.js";
import Category from "../Models/categoryModel.js";
import User from "../Models/userModel.js";
import cloudinary from "cloudinary";
import removeTmp from "../Utils/removeTmp.js";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (req, res) => {
  try {
    const { title, tags, category } = req.body;
    const { image } = req.files;
    if (!title || !tags || !image || !category) {
      return res.status(400).json({ message: `Please fill all the fields` });
    }

    const isCategory = await Category.findOne({ name: category });
    if (!isCategory) {
      return res.status(404).json({ message: `Category not found` });
    }

    if (image.mimetype !== "image/jpeg" && image.mimetype !== "image/png") {
      removeTmp(image.tempFilePath);
      return res.status(400).json({ msg: "File format is incorrect." });
    }

    const user = req.user;

    const result = await cloudinary.v2.uploader.upload(
      image.tempFilePath || req.file.path,
      {
        folder: "Images",
      }
    );

    const img = await Image.create({
      title,
      tags,
      category: isCategory,
      owner: user,
      image: result.url,
    });

    const imgs = await img.save();

    removeTmp(image.tempFilePath);

    return await res
      .status(201)
      .json({ message: `Image upload successfull`, imgs });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const getAllImages = async (req, res) => {
  const { latest, category, tag } = req.query;
  try {
    const imgs = await Image.find();
    const cate = await Category.findOne({ name: category });
    if (latest) {
      const imgsLatest = await Image.find().sort({ createdAt: -1 }).limit(10);
      return res.status(200).json(imgsLatest);
    }
    if (category) {
      const imgsCat = await Image.find({
        category: cate._id,
      });
      return res.status(200).json(imgsCat);
    }

    if (imgs.length === 0) {
      return res.status(404).json({ message: `No Images found` });
    }
    return res.status(200).json(imgs);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

export const getImage = async (req, res) => {
  const { id } = req.params;
  try {
    const image = await Image.findOne({ _id: id });
    if (!image) {
      return res.status(404).json({ message: `Image Not Found` });
    }
    return res.status(200).json(image);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const deleteImage = async (req, res) => {
  const { id } = req.params;
  try {
    const image = await Image.findOne({ _id: id });
    if (!image) {
      return res.status(404).json({ message: `Image Not Found` });
    }
    if (!req.user.isAdmin) {
      return res.status(401).json({ message: `Invalid Access` });
    }
    await image.deleteOne();
    return res.status(200).json({ message: `Image delete successfully` });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const likeImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Image.findOne({ _id: id });

    if (!image.likes.includes(req.user._id)) {
      await image.updateOne({
        $push: { likes: req.user._id },
      });
      res.status(200).json({ message: `This image has been liked` });
    } else {
      await image.updateOne({
        $pull: { likes: req.user._id },
      });
      res.status(200).json({ message: `This image had been unliked` });
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
