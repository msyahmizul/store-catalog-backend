const mongoose = require("mongoose");

const USER_TYPE = { ADMIN: 0, STAFF: 1, CUSTOMER: 2 };
const RESERVED_USERNAME = ["admin", "staff"];

const schemaUser = new mongoose.Schema({
   userType: {
      type: Number,
      enum: [USER_TYPE.ADMIN, USER_TYPE.STAFF, USER_TYPE.CUSTOMER],
      required: true,
   },
   username: { type: String, unique: true },
   password: { type: String },
   name: { type: String, required: true },
   phoneNum: { type: String },
});
module.exports = {
   RESERVED_USERNAME,
   USER_TYPE,
   UserModel: mongoose.model("users", schemaUser),
};
