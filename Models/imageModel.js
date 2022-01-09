import mongoose from "mongoose";
import slug from "mongoose-slug-generator";

const options = { separator: "-", lang: "eng", truncate: 1 };
mongoose.plugin(slug, options);

const imageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    tags: {
      type: [String],
    },
    slug: {
      type: String,
      slug: "title",
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Image", imageSchema);
