const mongoose = require("mongoose");
const schemaImage = require("./abstracts/schema.image");
const schemaSpecification = new mongoose.Schema(
   {
      key: String,
      title: String,
      icon: schemaImage,
      color: String,
   },
   { timestamps: false }
);
module.exports = mongoose.model("specifications", schemaSpecification);
