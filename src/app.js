const portConfig = require("./configs/port.js");
const anisi = require("./utils/anisi.js");
const { parseQuery } = require("./utils/util.js");

const express = require("express");
const expressSession = require("express-session");
const cors = require("cors");

if (process.env.NODE_ENV !== "production") {
   require("./document.js").start();
}

require("./utils/mongodb.js").connect();

const app = express();
app.use((request, response, next) => {
   const cacheControl = require("./utils/cachecontrol.js");
   response.set("Cache-Control", cacheControl.toString());
   response.returnAPI = (param = { status, content, error }) => {
      let { status, content, error } = param;

      let body = {};
      if (content) body.content = content;
      if (error && typeof error === "string") body.error = error;

      if (!status || typeof status !== "number")
         if (error) status = 500;
         else if (content) status = 200;
         else status = 500;

      if (error) console.log(error);

      response.status(status);
      response.send(body);
      response.end();
   };
   next();
});
app.use(
   expressSession({
      name: "session",
      secret: "[SESSION]",
      resave: false,
      saveUninitialized: false,
   })
);
app.use(express.static(`${__dirname}/../public`));
app.use(express.json());
app.use(
   cors(process.env.NODE_ENV === "production" ? { origin: "freshnet.app" } : undefined)
);

// API
app.use("/api", require("./routes/route.api"));

// Front-End Redirect
app.get("/home", (request, response) => {
   response.redirect(`/page/#/home${parseQuery(request.query)}`);
});
app.get("/product", (request, response) => {
   response.redirect(`/page/#/product${parseQuery(request.query)}`);
});
app.get("/item/id/:id", (request, response) => {
   request.query.item = request.params.id;
   response.redirect(`/page/#/product${parseQuery(request.query)}`);
});
app.get("/manage", (request, response) => {
   response.redirect(`/page/#/manage${parseQuery(request.query)}`);
});
app.get("/login", (request, response) => {
   response.redirect(`/page/#/login${parseQuery(request.query)}`);
});
app.get("/ps2", (request, response) => {
   response.redirect(`/page/#/ps2/disc${parseQuery(request.query)}`);
});
app.get("/ps2/disc", (request, response) => {
   response.redirect(`/page/#/ps2/disc${parseQuery(request.query)}`);
});
app.get("/order", (request, response) => {
   request.query.view = "order";
   response.redirect(`/page/#/manage${parseQuery(request.query)}`);
});
app.get("/", (request, response) => {
   response.redirect("/page");
});
app.get("*", (request, response) => {
   response.redirect("/page");
});

//Listen on Port
app.listen(portConfig.server, () => {
   let stringLocal = anisi.format("purple", "Local");
   let stringURL = anisi.format("yellow", `http://localhost:${portConfig.server}`);
   console.log(`  - ${stringLocal}: ${stringURL}`);
});
