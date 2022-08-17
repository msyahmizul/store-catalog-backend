const mongoose = require("mongoose");
const schemaImage = require("./abstracts/schema.image");
const schemaCategory = new mongoose.Schema(
   {
      key: String,
      title: String,
      icon: schemaImage,
      background: schemaImage,
   },
   { timestamps: false }
);
module.exports = mongoose.model("categories", schemaCategory);
