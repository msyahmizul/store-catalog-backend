const { EncryptJWT } = require("jose-node-cjs-runtime/jwt/encrypt");
const { jwtDecrypt } = require("jose-node-cjs-runtime/jwt/decrypt");
const { parseJwk } = require("jose-node-cjs-runtime/jwk/parse");

const EXPIRED_LENGTH = "1w"; // 1 Week Expired
const FORMAT_OPTION = {
   key_ops: ["encrypt", "decrypt"], // key operations
   ext: true, // key exportable
   kty: "oct", // key format data
   k: "[KEY]", // key
   alg: "A256GCM", // algorithm
};

// Function to Generate and export key in above obj
async function generateKey() {
   const key = await subtle.importKey(
      "jwk",
      FORMAT_OPTION,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
   );

   /* const key = await subtle.generateKey(
      {
         name: "AES-GCM",
         length: 256,
      },
      true,
      ["encrypt", "decrypt"]
   );
   let ex = await subtle.exportKey("jwk", key);
   console.log(ex); */
}

async function parseKey() {
   return await parseJwk(FORMAT_OPTION);
}

module.exports = {
   generateJWEToken: async function (body) {
      const key = await parseKey();
      return await new EncryptJWT(body)
         .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
         .setIssuedAt()
         .setExpirationTime(EXPIRED_LENGTH)
         .encrypt(key);
   },
   verifyJWEToken: async function (jwtToken) {
      const key = await parseKey();

      const { payload } = await jwtDecrypt(jwtToken, key);
      return payload;
   },
};
