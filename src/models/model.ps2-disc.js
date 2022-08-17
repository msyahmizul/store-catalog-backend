const mongoose = require("mongoose");

const schemaPs2Disc = new mongoose.Schema(
   {
      code: { type: String, required: true },
      title: { type: String, required: true },
   },
   { timestamps: false }
);

module.exports = mongoose.model("ps2-discs", schemaPs2Disc);
