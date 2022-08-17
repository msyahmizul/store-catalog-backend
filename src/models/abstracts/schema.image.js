const Schema = require("mongoose").Schema;

module.exports = new Schema(
   {
      method: { type: String, required: true },
      path: { type: String, required: true },
   },
   { timestamps: false, _id: false }
);
