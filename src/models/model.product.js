const mongoose = require("mongoose");
const schemaImage = require("./abstracts/schema.image");
const Schema = mongoose.Schema;

const schemaPrice = new Schema(
   {
      normal: String,
      promotion: String,
      bundles: [
         {
            title: String,
            image: schemaImage,
         },
      ],
   },
   { _id: false, timestamps: false }
);

const schemaBundle = new Schema(
   {
      title: String,
      image: schemaImage,
   },
   { _id: false, timestamps: false }
);

const schemaProduct = new Schema(
   {
      categoryId: String,
      brandId: String,
      title: String,
      description: String,
      image: schemaImage,
      gifts: [String],
      specification: {},
      stock: {
         isAvailable: Boolean,
         isSecondHand: Boolean,
         prices: [schemaPrice],
      },
      bundles: [schemaBundle],
   },
   { timestamps: false }
);
module.exports = mongoose.model("products", schemaProduct);
