const { UserModel, USER_TYPE } = require("../models/model.user");
const { JWTExpired, JWEDecryptionFailed } = require("jose-node-cjs-runtime/util/errors");

const { hash, verifyHash } = require("../utils/crypto.js");
const { generateJWEToken, verifyJWEToken } = require("../utils/jwt.js");

let router = require("express").Router();

router.post("/user/:username", async (request, response) => {
   const { authorization } = request.headers;

   if (!authorization) {
      response.returnAPI({ status: 401, error: "authorization token required" });
      return;
   }

   let payload = null;

   try {
      payload = await verifyJWEToken(authorization);
   } catch (error) {
      if (error instanceof JWTExpired) {
         response.returnAPI({ status: 401, error: "expired token" });
      } else if (error instanceof JWEDecryptionFailed) {
         response.returnAPI({ status: 400, error: "invalid token" });
      } else if (error instanceof SyntaxError) {
         response.returnAPI({ status: 400, error: "bad token" });
      } else {
         response.returnAPI({ status: 500, error: "internal server error" });
         console.error(error);
      }
      return;
   }

   if (!payload) {
      response.returnAPI({ status: 500, error: "internal server error" });
      return;
   }

   const { username } = request.params;
   const user = await UserModel.findOne({ username });

   if (!user) {
      response.returnAPI({ status: 404, error: "not found" });
      return;
   }

   response.returnAPI({
      status: 200,
      content: {
         user: {
            name: user.name,
            username: user.username,
            userType: user.userType,
         },
      },
   });
});

router.post("/login", async (request, response) => {
   const body = request.body;
   const { username, password } = body;

   if (!username || !password) {
      response.returnAPI({ status: 400, error: "invalid or incomplete field" });
      return;
   }

   try {
      const existingUser = await UserModel.findOne({ username });
      if (existingUser && (await verifyHash(existingUser.password, password))) {
         let payload = {
            userID: existingUser._id,
            userType: existingUser.userType,
            password: existingUser.password,
         };
         const token = await generateJWEToken(payload);

         const user = {
            name: existingUser.name,
            username: existingUser.username,
            userType: existingUser.userType,
         };
         response.returnAPI({ status: 200, content: { token, user } });
      } else {
         response.returnAPI({ status: 401, error: "invalid username or password" });
      }
   } catch (error) {
      response.returnAPI({ status: 500, error: "internal Server Error" });
      console.error(error);
   }
});

router.post("/currentUser", async (request, response) => {
   const body = request.body;
   const { token } = body;
   if (!token) {
      response.returnAPI({ status: 400, error: "invalid or incomplete field" });
      return;
   }
   try {
      const payload = await verifyJWEToken(token);
      const user = await UserModel.findOne({ _id: payload.userID });

      if (user === null) {
         response.returnAPI({ status: 401, error: "invalid user id" });
         return;
      }

      if (user.password !== payload.password) {
         response.returnAPI({ status: 401, error: "credentail voided" });
         return;
      }

      response.returnAPI({
         status: 200,
         content: {
            user: {
               name: user.name,
               username: user.username,
               userType: user.userType,
            },
         },
      });
   } catch (error) {
      if (error instanceof JWTExpired) {
         response.returnAPI({ status: 401, error: "expired token" });
      } else if (error instanceof JWEDecryptionFailed) {
         response.returnAPI({ status: 400, error: "invalid token" });
      } else if (error instanceof SyntaxError) {
         response.returnAPI({ status: 400, error: "bad token" });
      } else {
         response.returnAPI({ status: 500, error: "internal server error" });
         console.error(error);
      }
   }
});

module.exports = router;
