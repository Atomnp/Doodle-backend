const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    images: [
      {
      type: String,
    }
  ],
    
    //store user in post field laterwe can get complete

    //info about user using populate method given by mongoose package
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    comments: [
      {
        name: {
          type: String,
        },
        content: {
          type: String,
        },
        commentor: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
        },
      },
    ],
    likes: {
      type: Number,
    },
    likers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    username: {
      type: String,
    },
    approved: {
      type:Boolean,
      required:true
    }
  },

  { timestamps: true }
);
postSchema.index({ title: "text" });
module.exports = mongoose.model("Post", postSchema);
