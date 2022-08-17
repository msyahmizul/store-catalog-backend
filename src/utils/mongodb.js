const anisi = require("./anisi.js");
const mongoose = require("mongoose");
const { parseQuery } = require("./util.js");

module.exports = {
   config: {
      username: "username",
      password: "password",
      // database : "freshnet_test",
      database: "database",
      options: {
         retryWrites: true,
         w: "majority",
         compressors: "zlib",
      },
   },

   connect: async function () {
      const { username, password, database, options } = this.config;

      this.onConnect(this.config);

      mongoose
         .connect(
            `mongodb+srv://${username}:${password}@cluster0.z0pq1.mongodb.net/${database}${parseQuery(
               options
            )}`,
            {
               useNewUrlParser: true,
               useUnifiedTopology: true,
            }
         )
         .then((result) => {
            result ? this.onConnected(this.config) : this.onConnectFailed(this.config);
         })
         .catch((error) => {
            this.onError(this.config);
         });
   },

   onConnect: function (config = {}) {},
   onConnected: function (config = {}) {
      console.log(
         `  - ${anisi.format("green", "MongoDB")}: Connected to ${anisi.format(
            "blue",
            config.database
         )}`
      );
   },
   onConnectFailed: function (config = {}) {
      console.log(
         `  - ${anisi.format("red", `MongoDB: Connection to ${config.database} failed`)}`
      );
   },
   onError: function (config = {}) {
      console.log(`  - ${anisi.format("red", `MongoDB: Error`)}`);
   },
};
