function parseProduct(content) {
   if (!content.brandId) {
      content.brandId = undefined;
   }
   if (!content.title) {
      content.title = undefined;
   }
   if (!content.description) {
      content.description = undefined;
   }

   if (!content.image || Object.keys(content.image).length == 0) {
      content.image = undefined;
   }
   if (!content.specification || Object.keys(content.specification).length == 0) {
      content.specification = undefined;
   }
   if (!content.gifts || (Array.isArray(content.gifts) && content.gifts.length == 0)) {
      content.gifts = [];
   }
   if (
      !content.bundles ||
      (Array.isArray(content.bundles) && content.bundles.length == 0)
   ) {
      content.bundles = [];
   }
   if (
      (content.stock && !content.stock.prices) ||
      (Array.isArray(content.stock.prices) && content.stock.prices.length == 0)
   ) {
      content.stock.prices = [];
   }
   if (!content.stock || Object.keys(content.stock).length == 0) {
      content.stock = undefined;
   }

   return content;
}

const { verifyJWEToken } = require("../utils/jwt.js");
const { UserModel, USER_TYPE } = require("../models/model.user");

const ObjectId = require("mongoose").Types.ObjectId;
const ProductModel = require("../models/model.product");
const CategoryModel = require("../models/model.category");

let router = require("express").Router();

// Get all categories
router.get("/category/list", (request, response) => {
   CategoryModel.find()
      .then((categories) => {
         response.returnAPI({ status: 200, content: categories });
      })
      .catch((error) => {
         response.returnAPI({ status: 500, error: "internal server error" });
      });
});

// Get all items
router.get("/list", async (request, response) => {
   try {
      const items = await ProductModel.find();
      const categories = await CategoryModel.find();

      // Assign empty array to each categories
      for (const category of categories) {
         category._doc.items = [];
      }

      // Find and add items into list
      for (const item of items) {
         let category = categories.find((category) => {
            return category._doc._id == item._doc.categoryId;
         });

         if (!category) {
            category = categories.find((category) => {
               return category._doc.key == "other";
            });
         }

         if (category) {
            if (item.categoryId != category._id) {
               item.categoryId = category._id;
               item.save();
            }
            category._doc.items.push(item._doc);
         }
      }

      response.returnAPI({ status: 200, content: categories });
   } catch (error) {
      response.returnAPI({ status: 500, error: "internal server error" });
   }
});

// Get an item by id
router.get("/id/:id", async (request, response) => {
   const { id = "" } = request.params;

   try {
      const item = await ProductModel.findOne({ _id: id });
      if (!item) {
         response.returnAPI({ status: 404, error: "no such product" });
         return;
      }

      response.returnAPI({ status: 200, content: item });
   } catch (error) {
      response.returnAPI({ status: 500, error: "internal server error" });
   }
});

// Create an item
router.post("/", async (request, response) => {
   const { body } = request;

   const { token = "" } = body;
   if (typeof token !== "string" || token.trim().length === 0) {
      response.returnAPI({ status: 401, error: "access denied" });
      return;
   }

   const payload = await verifyJWEToken(token);
   const user = await UserModel.findOne({ _id: payload.userID });
   if (!user || user.userType != USER_TYPE.ADMIN) {
      response.returnAPI({ status: 403, error: "permission denied" });
      return;
   }

   let { content = {} } = body;

   delete content._id;

   if (typeof content.title != "string" || content.title.trim().length == 0) {
      response.returnAPI({ status: 400, error: "missing title" });
      return;
   }

   if (content.categoryId) {
      const category = await CategoryModel.findOne({ _id: content.categoryId });
      if (category) {
         content.categoryId = category._id;
      } else {
         const category = await CategoryModel.findOne({ key: "other" });
         if (!category) {
            response.returnAPI({ status: 400, error: "resolving category failed" });
            return;
         }
         content.categoryId = category ? category._id : undefined;
      }
   }

   content = parseProduct(content);

   new ProductModel(content)
      .save()
      .then((result) => {
         response.returnAPI({ status: 200, content: result });
      })
      .catch((error) => {
         response.returnAPI({ status: 500, error: "internal server error" });
         console.log(error);
      });
});

// Update an item
router.put("/id/:id", async (request, response) => {
   try {
      const { body } = request;

      const { token = "" } = body;
      if (typeof token !== "string" || token.trim().length === 0) {
         response.returnAPI({ status: 401, error: "access denied" });
         return;
      }

      const payload = await verifyJWEToken(token);
      const user = await UserModel.findOne({ _id: payload.userID });
      if (!user || user.userType != USER_TYPE.ADMIN) {
         response.returnAPI({ status: 403, error: "permission denied" });
         return;
      }

      const { params } = request;
      const { id = "" } = params;
      let { content = {} } = body;

      if (id != content._id) {
         response.returnAPI({ status: 400, error: "id does not match with param" });
         return;
      }

      delete content._id;

      if (typeof content.title != "string" || content.title.trim().length == 0) {
         response.returnAPI({ status: 400, error: "missing title" });
         return;
      }

      if (content.categoryId) {
         const category = await CategoryModel.findOne({ _id: content.categoryId });
         if (category) {
            content.categoryId = category._id;
         } else {
            const category = await CategoryModel.findOne({ key: "other" });
            if (!category) {
               response.returnAPI({ status: 400, error: "resolving category failed" });
               return;
            }
            content.categoryId = category ? category._id : undefined;
         }
      }

      content = parseProduct(content);

      const result = await ProductModel.updateOne({ _id: id }, content);
      if (result.ok) {
         const item = await ProductModel.findOne({ _id: id });
         response.returnAPI({ status: 200, content: item });
      } else {
         response.returnAPI({ status: 500, error: "unable to update" });
      }
   } catch (error) {
      response.returnAPI({ status: 500, error: "internal server error" });
   }
});

router.delete("/id/:id", async (request, response) => {
   const { body } = request;

   const { token = "" } = body;
   if (typeof token !== "string" || token.trim().length === 0) {
      response.returnAPI({ status: 401, error: "access denied" });
      return;
   }

   const payload = await verifyJWEToken(token);
   const user = await UserModel.findOne({ _id: payload.userID });
   if (!user || user.userType != USER_TYPE.ADMIN) {
      response.returnAPI({ status: 403, error: "permission denied" });
      return;
   }

   const { params } = request;
   const { id = "" } = params;
   const bodyId = body.id;

   if (id != bodyId) {
      response.returnAPI({ status: 400, error: "missing id" });
      return;
   }

   const item = await ProductModel.findOne({ _id: id });
   if (!item) {
      response.returnAPI({ status: 404, error: "no such product" });
      return;
   }

   const result = await ProductModel.deleteOne({ _id: id });
   if (result.ok) {
      response.returnAPI({ status: 200, content: item });
      return;
   }

   response.returnAPI({ status: 500, error: "internal server error" });
});

module.exports = router;
