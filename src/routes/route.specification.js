const SpecificationModel = require("../models/model.specification");

let router = require("express").Router();

// Get all items
router.get("/", (request, response) => {
   SpecificationModel.find()
      .then((specifications) => {
         response.returnAPI({ status: 200, content: specifications });
      })
      .catch((error) => {
         response.returnAPI({ status: 500, error: "internal server error" });
         console.log(error);
      });
});
// Get an item by id
router.get("/id/:id", (request, response) => {
   const { id = "" } = request.params;

   SpecificationModel.findOne({ _id: id })
      .then((specification) => {
         if (specification) response.returnAPI({ status: 200, content: specification });
         else response.returnAPI({ status: 404, error: "not found" });
      })
      .catch((error) => {
         response.returnAPI({ status: 500, error: "internal server error" });
         console.log(error);
      });
});
// Get an item by id
router.get("/key/:key", (request, response) => {
   const { key = "" } = request.params;

   SpecificationModel.findOne({ key: key })
      .then((specification) => {
         if (specification) response.returnAPI({ status: 200, content: specification });
         else response.returnAPI({ status: 404, error: "not found" });
      })
      .catch((error) => {
         response.returnAPI({ status: 500, error: "internal server error" });
         console.log(error);
      });
});

module.exports = router;
