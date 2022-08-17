const mongoose = require("mongoose");
const { ServiceModel } = require("../models/model.service");
const { UserModel, USER_TYPE } = require("../models/model.user");

const { verifyJWEToken } = require("../utils/jwt.js");
const { JWTExpired, JWEDecryptionFailed } = require("jose-node-cjs-runtime/util/errors");

const router = require("express").Router();
router.use(async (request, res, next) => {
   const { authorization } = request.headers;

   if (!authorization) {
      res.returnAPI({ status: 401, error: "authorization token required" });
      return;
   }

   let payload = null;

   try {
      payload = await verifyJWEToken(authorization);
   } catch (error) {
      if (error instanceof JWTExpired) {
         res.returnAPI({ status: 401, error: "expired token" });
      } else if (error instanceof JWEDecryptionFailed) {
         res.returnAPI({ status: 400, error: "invalid token" });
      } else if (error instanceof SyntaxError) {
         res.returnAPI({ status: 400, error: "bad token" });
      } else {
         res.returnAPI({ status: 500, error: "internal server error" });
      }
      console.error(error);
      return;
   }

   if (!payload) {
      res.returnAPI({ status: 500, error: "internal server error" });
      return;
   }

   if (payload.userType !== USER_TYPE.CUSTOMER) {
      next();
   } else {
      res.returnAPI({ status: 401, error: "lack of priviledge" });
   }
});

// get services
router.get("/", async (req, res) => {
   try {
      const services = await ServiceModel.find();
      res.returnAPI({ content: services });
   } catch (error) {
      res.returnAPI({ error: "internal server error" });
      console.error(error);
   }
});

// Check the user get from token has met the requirements
async function onAuthorization(token, res) {
   let payload = await verifyJWEToken(token);
   if (!(USER_TYPE.ADMIN <= payload.userType && payload.userType <= USER_TYPE.STAFF)) {
      res.returnAPI({ status: 401, error: "access denied" });
      return;
   }
   let user = await UserModel.findOne({ _id: payload.userID });
   if (!user) {
      res.returnAPI({ error: "internal server error" });
      return;
   }
   return user;
}
// Check for required data fields and tries to correct them
function onProcessData(content, res) {
   if (!content.description) {
      res.returnAPI({ status: 400, error: "missing description" });
      return null;
   }
   if (!content.customer || !content.customer.name) {
      res.returnAPI({ status: 400, error: "missing customer" });
      return null;
   }
   if (!content.state) content.state = "pending";
   content.time = Date.now();

   return content;
}

// create service
router.post("/", async (req, res) => {
   let { authorization } = req.headers;
   let user = await onAuthorization(authorization);
   if (!user) {
      return;
   }

   let { body } = req;
   let { content } = body;
   content = onProcessData(content);
   if (!content) {
      res.returnAPI({ status: 500, error: "internal server error" });
      return;
   }

   let userIsDefault =
      (user.userType === USER_TYPE.ADMIN && user.username === "admin") ||
      (user.userType === USER_TYPE.STAFF && user.username === "staff");
   if (!userIsDefault) {
      delete content.nameOfUser;
   } else {
      if (!content.nameOfUser) {
         res.returnAPI({ status: 400, error: "missing fields" });
         return;
      }
   }
   content.username = user.username;

   try {
      const service = new ServiceModel(content);
      const result = await service.save();
      if (!result) {
         res.returnAPI({ status: 500, error: "internal server error" });
         return;
      }
      res.send({ content: service });
      res.end();
   } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
         res.returnAPI({ status: 400, error: "invalid service id" });
      } else {
         res.returnAPI({ error: "internal server error" });
         console.error(error);
      }
   }
});
// update service
router.put("/", async (req, res) => {
   let { authorization } = req.headers;
   let user = await onAuthorization(authorization);
   if (!user) {
      return;
   }

   let { body } = req;
   let { id, content } = body;

   if (id !== content.id) {
      res.returnAPI({ status: 400, error: "invalid fields" });
      return;
   }
   content = onProcessData(content);
   if (!content) {
      res.returnAPI({ error: "internal server error" });
      return;
   }
   content.username = user.username;

   try {
      const service = await ServiceModel.findOne({ _id: id });
      if (service == null) {
         res.returnAPI({ status: 404, error: "not found" });
         return;
      }
      service.state = content.state;
      let result = await service.save();
      if (!result) {
         res.returnAPI({ error: "internal server error" });
         return;
      }
      res.status(200);
      res.send({ content: service });
      res.end();
   } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
         res.status(400);
         res.send({ error: "invalid service id" });
         res.end();
      } else {
         res.status(500);
         res.send({ error: "internal server error" });
         res.end();
         console.error(error);
      }
   }
});
// delete service
router.delete("/", async (req, res) => {
   let { authorization } = req.headers;
   let user = await onAuthorization(authorization);
   if (!user) {
      res.status(500);
      res.send({ error: "internal server error" });
      res.end();
      return;
   }

   let { body } = req;
   let { id } = body;

   if (!id) {
      res.status(400);
      res.send({ error: "misssing id" });
      res.end();
      return;
   }

   try {
      let result = await ServiceModel.deleteOne({ _id: id });

      if (!result) {
         res.status(500);
         res.send({ error: "internal server error" });
         res.end();
         return;
      }

      res.status(200);
      res.send({ content: "ok" });
      res.end();
   } catch (error) {
      res.status(500);
      res.send({ error: "internal server error" });
      res.end();
      console.error(error);
   }
});

// update service state
router.put("/state/", async (req, res) => {
   let { authorization } = req.headers;
   let user = await onAuthorization(authorization);
   if (!user) {
      res.status(500);
      res.send({ error: "internal server error" });
      res.end();
      return;
   }

   let { body } = req;
   let { serviceID, content } = body;

   if (!serviceID || !content) {
      res.status(400);
      res.send({ error: "missing fields" });
      res.end();
      return;
   }

   if (
      content !== "pending" &&
      content !== "waiting" &&
      content !== "completed" &&
      content !== "rejected"
   ) {
      res.status(400);
      res.send({ error: "invalid fields" });
      res.end();
      return;
   }

   try {
      const service = await ServiceModel.findOne({ _id: serviceID });
      if (!service) {
         res.status(404);
         res.send({ error: "not found" });
         res.end();
         return;
      }
      service.username = user.username;
      service.state = content;
      let result = await service.save();
      if (!result) {
         res.status(500);
         res.send({ error: "internal server error" });
         res.end();
         return;
      }
      res.status(200);
      res.send({ content: service });
      res.end();
   } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
         res.status(400);
         res.send({ error: "invalid service id" });
         res.end();
      } else {
         res.status(500);
         res.send({ error: "internal server error" });
         res.end();
         console.error(error);
      }
   }
});

// create service event
router.post("/event", async (req, res) => {
   let { authorization } = req.headers;
   let user = await onAuthorization(authorization);
   if (!user) {
      res.status(500);
      res.send({ error: "internal server error" });
      res.end();
      return;
   }

   let { body } = req;
   let { serviceID, content } = body;

   if (!serviceID || !content || !content.description) {
      res.status(400);
      res.send({ error: "missing fields" });
      res.end();
      return;
   }

   content.time = Date.now();
   content.username = user.username;
   if (content.method === "purchase" && content.price && !content.price.amount) {
      content.method = "info";
      delete content.price;
   }

   let userIsDefault =
      (user.userType === USER_TYPE.ADMIN && user.username === "admin") ||
      (user.userType === USER_TYPE.STAFF && user.username === "staff");
   if (!userIsDefault) {
      delete content.nameOfUser;
   } else {
      if (!content.nameOfUser) {
         res.returnAPI({ status: 400, error: "missing fields" });
         return;
      }
   }

   try {
      const service = await ServiceModel.findOne({ _id: serviceID });
      if (!service) {
         res.returnAPI({ status: 404, error: "not found" });
         return;
      }

      service.events.push(content);
      await service.save();

      res.returnAPI({ status: 200, content });
   } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
         res.returnAPI({ status: 400, error: "invalid service id format" });
      } else {
         res.returnAPI({ status: 500, error: "internal server error" });
         console.error(error);
      }
   }
});
//delete service event
router.delete("/event", async (req, res) => {
   let { authorization } = req.headers;
   let user = await onAuthorization(authorization);
   if (!user) {
      return;
   }

   let { body } = req;
   let { serviceID, time } = body;

   if (!serviceID || !time) {
      res.returnAPI({ status: 400, error: "missing fields" });
      return;
   }

   try {
      const service = await ServiceModel.findOne({ _id: serviceID });
      if (!service) {
         res.returnAPI({ status: 404, error: "not found" });
         return;
      }

      let event = service.events.find((event) => {
         return event.time === time;
      });
      if (!event) {
         res.returnAPI({ status: 404, error: "not found" });
         return;
      }

      service.events.splice(service.events.indexOf(event), 1);
      let result = await service.save();
      if (!result) {
         res.returnAPI({ status: 500, error: "internal server error" });
         return;
      }
      res.returnAPI({ status: 200, content: "ok" });
   } catch (error) {
      res.returnAPI({ status: 500, error: "internal server error" });
      console.error(error);
   }
});

router.get("/:id", (req, res) => {
   let { params } = req;
   let { id } = params;

   if (!id) {
      res.returnAPI({ status: 400, error: "invalid or missing required data" });
      return;
   }

   ServiceModel.findOne({ _id: params.id })
      .then((service) => {
         if (service) res.returnAPI({ status: 200, content: services });
         else throw new Error();
      })
      .catch((error) => {
         res.returnAPI({ status: 500, error: "internal server error" });
         console.error(error);
      });
});

module.exports = router;
return;
