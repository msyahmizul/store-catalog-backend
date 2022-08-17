const anisi = require("./utils/anisi.js");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

module.exports = {
   start: function () {
      const swaggerApp = express();
      const swaggerDocument = YAML.load(`${__dirname}/document.yaml`);

      swaggerApp.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
      swaggerApp.listen(8082, () => {
         console.log(
            `  - ${anisi.format("cyan", "Documentation")}: ${anisi.format(
               "yellow",
               `http://localhost:8082/api-docs`
            )}`
         );
      });
   },
};
