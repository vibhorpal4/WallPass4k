import Category from "../Models/categoryModel.js";

export const createCategory = async (req, res) => {
  const { name } = req.body;
  try {
    if (!name) {
      return res.status(400).json({ message: `Enter the category name` });
    }
    const oldCategory = await Category.findOne({ name });
    if (oldCategory) {
      return res.status(400).json({ message: `Category already exists` });
    }
    if (!req.user.isAdmin) {
      return res.status(401).json({ message: `Invalid Access` });
    }
    const cate = await Category.create({
      name,
    });
    const category = await cate.save();
    return res
      .status(201)
      .json({ message: `Category created successfully`, category });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const { latest } = req.query;

    const categories = latest
      ? await Category.find().sort({ createdAt: -1 }).limit(10)
      : await Category.find();
    if (categories.length === 0) {
      return res.status(404).json({ message: `No category found` });
    }
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const deleteCategory = async (req, res) => {
  const { slug } = req.params;
  try {
    const category = await Category.findOne({ slug });
    if (!category) {
      return res.status(404).json({ message: `Category not found` });
    }

    if (!req.user.isAdmin) {
      return res.status(401).json({ message: `Invalid Access` });
    }
    await category.deleteOne();
    return res.status(200).json({ message: `Category delete successfully` });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
