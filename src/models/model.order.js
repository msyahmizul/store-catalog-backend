const mongoose = require("mongoose");
const status_code = {
   PENDING: 0,
   COMPLETE: 1,
};
const schemaOrder = new mongoose.Schema(
   {
      content: { type: String, required: true },
      customer_name: String,
      phone_number: String,
      status: {
         type: Number,
         default: status_code.PENDING,
         enum: [status_code.PENDING, status_code.COMPLETE],
      },
   },
   { timestamps: true }
);
module.exports = mongoose.model("orders", schemaOrder);
