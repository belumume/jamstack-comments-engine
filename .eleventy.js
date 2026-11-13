module.exports = function(config) {

  // Add a date formatter filter to Nunjucks
  config.addFilter("dateDisplay", require("./src/filters/dates.js") );

  // More useful markdown inclusions

  const markdownIt = require("markdown-it");
  const md = new markdownIt({
    html: true
  });
  config.addFilter("markdown", (content) => {
    return md.render(content);
  });



  const { minify } = require("terser");
  config.addAsyncFilter("jsmin", async function(code) {
    try {
      const minified = await minify(code);
      return minified.code;
    } catch (error) {
      console.log("Terser error: ", error);
      return code;
    }
  });


  // eleventy config settings
  return {
    dir: {
      input: "src/site",
      output: "dist",
      includes: "_includes"
    },
    templateFormats : ["njk", "md"],
    htmlTemplateEngine : "njk",
    markdownTemplateEngine : "njk"
  };
};
