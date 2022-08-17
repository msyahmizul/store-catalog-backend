const mongoose = require("mongoose");

const schemaPrice = new mongoose.Schema(
   {
      currency: { type: String, required: true },
      amount: { type: String, required: true },
   },
   { timestamps: false, _id: false }
);

const schemaEvent = new mongoose.Schema(
   {
      time: { type: Number, required: true },
      username: { type: String, required: true },
      nameOfUser: { type: String, required: false },
      method: { type: String, required: true },
      description: { type: String, required: true },

      status: { type: String, required: false },
      price: { type: schemaPrice, required: false },
   },
   { timestamps: false, _id: false }
);

const schemaCustomer = new mongoose.Schema(
   {
      name: { type: String, required: true },
      phoneNumber: { type: String, required: false },
   },
   { timestamps: false, _id: false }
);
const schemaBelonging = new mongoose.Schema(
   {
      title: { type: String, required: true },
   },
   { timestamps: false, _id: false }
);

const schemaService = new mongoose.Schema(
   {
      time: { type: Number, required: true },
      username: { type: String, required: true },
      nameOfUser: { type: String, required: false },
      state: { type: String, required: true },
      customer: { type: schemaCustomer, required: false },
      description: { type: String, required: true },

      belongings: { type: [schemaBelonging], required: false },
      events: { type: [schemaEvent], required: false },
   },
   { timestamps: false, _id: true }
);

module.exports = { ServiceModel: mongoose.model("services", schemaService) };
