const BrandModel = require("../models/model.brand");

let router = require("express").Router();
router.use((request, response, next) => {
   next();
});

// Get all items
router.get("/", async (request, response) => {
   try {
      const brands = await BrandModel.find();

      if (!brands) throw new Error();

      response.returnAPI({ status: 200, content: brands });
   } catch (error) {
      response.returnAPI({ status: 500, error: "internal server error" });
   }
});

// Get an item by id
router.get("/id/:id", async (request, response) => {
   const { id = "" } = request.params;

   try {
      const brand = await BrandModel.findOne({ _id: id });

      if (!brand) {
         response.returnAPI({ status: 404, error: "not found" });
         return;
      }

      response.returnAPI({ status: 200, content: brand });
   } catch (error) {
      response.returnAPI({ status: 500, error: "internal server error" });
   }
});

module.exports = router;
