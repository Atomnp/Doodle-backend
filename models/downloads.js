const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const downloadsSchema = new Schema(
  {

    fileUrl: {
      type: String,
      required: true,
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Downloads", downloadsSchema);
