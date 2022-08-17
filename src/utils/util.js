module.exports = {
   parseQuery: function (query) {
      return Object.keys(query).reduce((str, key) => {
         return `${str}${!str ? "?" : "&"}${key}=${query[key]}`;
      }, "");
   },
   checkRequiredField: function (body, arrayFieldToCheck) {
      for (const element of arrayFieldToCheck) {
         if (!(element in body)) {
            return false;
         }
      }
      return true;
   },
   deleteObjFields: function (obj, arrayFieldToDelete) {
      for (const element of arrayFieldToDelete) {
         delete obj[element];
      }
   },
};
