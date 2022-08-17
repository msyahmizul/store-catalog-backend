let router = require("express").Router();

router.use((request, response, next) => {
   response
      .set("Content-Type", "application/json;charset=UTF-8")
      .set("Cache-Control", "no-store");
   next();
});

for (let route of [
   { path: "item", require: "product" },
   { path: "product", require: "product" },
   { path: "brand", require: "brand" },
   { path: "spec", require: "specification" },
   { path: "ps2", require: "ps2" },
   { path: "order", require: "order" },
   { path: "session", require: "session" },
   { path: "service", require: "service" },
]) {
   router.use(`/${route.path}`, require(`./route.${route.require}`));
}

module.exports = router;
