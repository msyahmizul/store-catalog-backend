const Ps2DiscModel = require("../models/model.ps2-disc");

let router = require("express").Router();
router.get("/disc/", (request, response) => {
   Ps2DiscModel.find()
      .then((discs) => {
         if (!discs) {
            response.returnAPI({ error: "read errror" });
            return;
         }

         response.returnAPI({ content: discs });
      })
      .catch((error) => {
         response.returnAPI({ error: "internal server error" });
         console.log(error);
      });
});
router.get("/disc/id/:id", (request, response) => {
   let { id } = request.params;

   Ps2DiscModel.findOne({ _id: id })
      .then((disc) => {
         if (!disc) {
            response.returnAPI({ error: "read errror" });
            return;
         }

         response.returnAPI({ content: disc });
      })
      .catch((error) => {
         response.returnAPI({ error: "internal server error" });
         console.log(error);
      });
});
router.get("/disc/code/:code", (request, response) => {
   let { code } = request.params;

   Ps2DiscModel.findOne({ code })
      .then((disc) => {
         if (!disc) {
            response.returnAPI({ error: "read errror" });
            return;
         }

         response.returnAPI({ content: disc });
      })
      .catch((error) => {
         response.returnAPI({ error: "internal server error" });
         console.log(error);
      });
});

module.exports = router;
