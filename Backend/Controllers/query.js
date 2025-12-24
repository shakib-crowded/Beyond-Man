const Query = require("../Models/query");

module.exports.submitQuery = async (req, res) => {
  try {
    const { email } = req.body;

    const duplicateEmail = await Query.findOne({ email });
    if (duplicateEmail) {
      return res.status(409).json({
        message:
          "A query has already been raised using this email. Please check your inbox or use a different email.",
      });
    }

    const emailQuery = new Query({ email });
    await emailQuery.save();
    res.status(200).json({ message: "Email Added" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
