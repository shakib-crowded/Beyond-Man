const Contact = require("../Models/contacts");

module.exports.contactPage = (req, res) => {
  res.render("contact", { user: req.session.user });
};
module.exports.submitQueryForm = async (req, res) => {
  try {
    const { subject, message } = req.body;

    const newContactQuery = new Contact({
      subject,
      message,
      userId: req.user._id,
    });
    await newContactQuery.save();

    req.flash("success", "Message sent successfully!");
    res.redirect("/contact"); // Redirect to the contact page (or any desired route)
  } catch (error) {
    console.error(error);
    // Contact validation failed: subject: Path `subject` is required., message: Path `message` is required

    // Path `subject` is required. Path `message` is required.
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) =>
        err.message.replace("Path ", "").replace(/`/g, "")
      );
      req.flash("error", messages.join(`\n`));
    } else {
      req.flash("error", error.message);
    }

    res.redirect("/contact"); // Redirect back to show the error message
  }
};
