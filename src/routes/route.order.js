function isUserPasswordMatch(session) {
   return session.passcode === "adminadmin";
}

const OrderModel = require("../models/model.order");
const mongoose = require("mongoose");

let router = require("express").Router();
router.use((request, response, next) => {
   if (isUserPasswordMatch(request.session)) {
      next();
   } else {
      response.returnAPI({ error: "not authenticated" });
   }
});
router.get("/all", async (request, response) => {
   try {
      const order = await OrderModel.find();
      response.send({ content: order }).end();
   } catch (error) {
      response.returnAPI({ status: 500, error: "not authenticated" });
   }
   response.end();
});
router.post("/", async (request, response) => {
   const body = request.body;
   try {
      const order = new OrderModel(body);
      let result = await order.save();
      if (result) response.returnAPI({ status: 200, content: order });
      else response.returnAPI({ status: 500, error: "internal server errror" });
   } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
         response.returnAPI({ status: 400, error: "required or invalid data field" });
      } else {
         response.returnAPI({ status: 500, error: "internal server errror" });
      }
   }
   response.end();
});
router.put("/", async (request, response) => {
   const { body } = request;
   let { id, status } = body;

   if (!id) {
      response.returnAPI({ status: 400, error: "order id required" });
      return;
   }
   if (!status) {
      response.returnAPI({ status: 400, error: "status required" });
      return;
   }
   try {
      const order = await OrderModel.findOne({ _id: body.id });
      if (order) {
         order.status = body.status;
         await order.save();
         response.returnAPI({ status: 200 });
      } else {
         response.returnAPI({ status: 401, error: "invalid order id" });
      }
   } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
         response.returnAPI({ status: 400, error: "invalid id format" });
      } else if (error instanceof mongoose.Error.ValidationError) {
         response.returnAPI({ status: 400, error: "invalid status code" });
      } else {
         response.returnAPI({ status: 500, error: "internal server error" });
      }
   }

   response.end();
});
router.delete("/", async (request, response) => {
   const body = request.body;
   if (!("id" in body)) {
      response.returnAPI({ status: 400, error: "order id required" });
      return;
   }
   try {
      const res = await Order.deleteOne({ _id: body.id });
      if (res.n !== 0) {
         response.returnAPI({ status: 202 });
      } else {
         response.returnAPI({ status: 200 });
      }
   } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
         response.returnAPI({ status: 400, error: "invalid id format" });
      } else {
         response.returnAPI({ status: 500, error: "internal server error" });
      }
   }

   response.end();
});

module.exports = router;
