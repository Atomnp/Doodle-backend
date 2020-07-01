const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postContentSchema = new Schema(
  {

    content: {
      type: String,
      required: true,
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("PostContents", postContentSchema);
