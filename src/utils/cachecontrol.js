module.exports = {
   config: {
      "max-age": "21600",
      "s-maxage": "21600",
      public: undefined,
      // "no-cache": undefined,
      // "no-store": undefined,
      // "must-revalidate": undefined,
   },
   toString() {
      if (process.env.NODE_ENV !== "production") {
         this.config = { "no-store": undefined };
      }
      const keys = Object.keys(this.config);

      if (!keys.length) return;

      return keys.reduce((str, key) => {
         return `${str}${!str ? "" : ", "}${key}${
            this.config[key] !== undefined ? `=${this.config[key]}` : ""
         }`;
      }, "");
   },
};
