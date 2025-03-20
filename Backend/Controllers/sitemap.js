const { SitemapStream, streamToPromise } = require("sitemap");
require("dotenv").config();

module.exports.mainSiteMap = async (req, res) => {
  try {
    // Create sitemap stream
    const sitemap = new SitemapStream({ hostname: process.env.BASE_URL });

    // Add homepage
    sitemap.write({ url: "/", changefreq: "daily", priority: 1.0 });
    sitemap.write({
      url: "/programming/programming-in-c",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/programming/object-oriented-programming",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/programming/data-structure-and-algorithm-in-c++",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/programming/java-programming",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/programming/programming-with-kotlin",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/programming/programming-in-javascript",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/programming/programming-in-python",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/programming/programming-in-swift",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/programming/programming-in-golan",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/programming/programming-with-php",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/website-dev/html-css-and-javascript",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/website-dev/responsive-design-and-css-framework",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/website-dev/frontend-frameworks",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/website-dev/backend-development",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/website-dev/database-and-orm",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/website-dev/api-development-and-integration",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/website-dev/authentication-and-authorization",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/website-dev/website-performance-and-optimization",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/website-dev/deployment-and-hosting",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/android-dev/basics-of-android-development",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/android-dev/user-development-interface",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/android-dev/core-components",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/android-dev/data-storage-and-management",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/android-dev/networking-in-android",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/android-dev/android-advanced-concept",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/android-dev/working-with-apis-and-libraries-in-android",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/android-dev/testing-and-debugging-in-android",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/android-dev/publishing-and-maintenance-in-andorid",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/software-dev/software-development-life-cycle",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/software-dev/agile-and-scrum-methodologies",
      changefreq: "weekly",
      priority: 0.9,
    });

    sitemap.write({
      url: "/software-dev/version-control-and-ci-cd-pipline",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/software-dev/unit-testing-integration-testing-and-automation-of-software",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/software-dev/code-reviews-and-team-collaboration-in-software",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/software-dev/dependency-management-and-package-managers",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/software-dev/application-security-best-practices",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/software-dev/software-documentation",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/software-dev/api-desing-and-sdk-development",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({
      url: "/software-dev/scalability-and-maintainability-of-software",
      changefreq: "weekly",
      priority: 0.9,
    });
    sitemap.write({ url: "/about", changefreq: "yearly", priority: 0.8 });
    sitemap.write({ url: "/contact", changefreq: "yearly", priority: 0.8 });
    sitemap.write({
      url: "/privacy-policy",
      changefreq: "yearly",
      priority: 0.8,
    });
    sitemap.end();

    // Convert stream to XML
    const xmlData = await streamToPromise(sitemap);
    res.header("Content-Type", "application/xml");
    res.send(xmlData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating sitemap");
  }
};
