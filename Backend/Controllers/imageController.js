// const fetch = require("node-fetch");

module.exports.loadImage = async (req, res) => {
  try {
    const imageId = req.params.imageUrl;
    const folder = req.params.folder;
    const cloudinaryUrl = `https://res.cloudinary.com/dsedsszhf/image/upload/v1742569511/${folder}/${encodeURIComponent(
      imageId
    )}`;
    const response = await fetch(cloudinaryUrl);

    if (!response.ok) {
      console.error("Fetch failed with status:", response.status);
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.startsWith("image/")) {
      throw new Error("Invalid image type received");
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.set("Content-Type", contentType);
    res.send(buffer);
  } catch (error) {
    console.error("Error loading image:", error.message);
    if (req.accepts("html")) {
      res.render("error.ejs", {
        message: "An error occurred while load image. Please try again.",
        error: process.env.NODE_ENV === "development" ? error : {},
      });
    }
    res.status(500).send("Error loading image");
  }
};
