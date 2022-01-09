import mongoose from "mongoose";
import slug from "mongoose-slug-generator";
const options = { separator: "-", lang: "eng", truncate: 1 };
mongoose.plugin(slug, options);

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    images: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Image",
    },
    slug: {
      type: String,
      slug: "name",
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
