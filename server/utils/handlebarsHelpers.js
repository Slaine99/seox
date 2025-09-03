const handlebars = require("handlebars");

// Register equality helper
handlebars.registerHelper("eq", function(a, b) {
  return a === b;
});

// Export handlebars for use in the application
module.exports = handlebars;