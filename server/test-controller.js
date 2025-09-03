console.log("Starting test controller...");

try {
  console.log("Loading BlogPost model...");
  const BlogPost = require("./models/blogPostModel");
  console.log("BlogPost loaded successfully");
  
  console.log("Loading SeoAccount model...");
  const SeoAccount = require("./models/seoAccountModel");
  console.log("SeoAccount loaded successfully");
  
  console.log("Defining createBlogPost function...");
  const createBlogPost = async (req, res) => {
    console.log('Test function');
  };
  console.log("Function defined successfully");
  
  console.log("Exporting...");
  module.exports = {
    createBlogPost
  };
  console.log("Export completed");
  
} catch (error) {
  console.error("Error in test controller:", error);
  throw error;
}
