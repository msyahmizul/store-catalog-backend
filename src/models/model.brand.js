const mongoose = require("mongoose");
const schemaImage = require("./abstracts/schema.image");
const schemaBrand = new mongoose.Schema(
   {
      name: String,
      title: String,
      icon: schemaImage,
   },
   { timestamps: false }
);

module.exports = mongoose.model("brands", schemaBrand);
