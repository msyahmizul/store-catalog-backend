const bcrypt = require("bcrypt");
const SALT_ROUND = 10;

module.exports = {
   hash: async function (text) {
      return await bcrypt.hash(text, SALT_ROUND);
   },
   verifyHash: async function (hash, text) {
      return await bcrypt.compare(text, hash);
   },
};
