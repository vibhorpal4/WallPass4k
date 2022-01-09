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

    const result = await cloudinary.v2.uploader.upload(image.tempFilePath, {
      folder: "Images",
    });

    const img = await Image.create({
      title,
      tags,
      cate: isCategory,
      owner: user,
      image: result.url,
    });

    const imgs = await img.save();

    removeTmp(image.tempFilePath);

    await user.updateOne({ $push: { images: imgs } });
    await isCategory.updateOne({ $push: { images: imgs } });

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
    // const images = await Image.aggregate([
    //   {
    //     $lookup: {
    //       from: "Category",
    //       localField: "_id",
    //       foreignField: "category",
    //       as: "category",
    //     },
    //   },
    // ]);

    let images;

    if (latest) {
      images = await Image.find().sort({ createdAt: -1 }).limit(10);
    } else if (category) {
      images = await Image.find({
        category: {
          $in: category,
        },
      });
    } else if (tag) {
      images = await Image.find({
        tags: {
          $in: [tag],
        },
      });
    } else {
      images = await Image.find();
    }
    if (images.length === 0) {
      return res.status(404).json({ message: `No Images found` });
    }
    return res.status(200).json(images);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const getImage = async (req, res) => {
  const { slug } = req.params;
  try {
    const image = await Image.findOne({ slug });
    if (!image) {
      return res.status(404).json({ message: `Image Not Found` });
    }
    return res.status(200).json(image);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const deleteImage = async (req, res) => {
  const { slug } = req.params;
  try {
    const image = await Image.findOne({ slug });
    const user = await User.findOne({ _id: image.owner });

    if (!image) {
      return res.status(404).json({ message: `Image Not Found` });
    }
    if (!req.user.isAdmin) {
      return res.status(401).json({ message: `Invalid Access` });
    }
    const category = await Category.findOne({ _id: image.category });
    await category.updateOne({
      $pull: {
        images: image._id,
      },
    });
    await user.updateOne({
      $pull: {
        images: image._id,
      },
    });
    await image.deleteOne();
    return res.status(200).json({ message: `Image delete successfully` });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
