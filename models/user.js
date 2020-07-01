const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    emailVerified: {
      type: Boolean,
      required: true,
    },
    verificationToken: {
      type: String,
    },
    verificationDate: {
      type: Date,
    },
    password: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },

    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    likedPosts:[
      {
        type:Schema.Types.ObjectId,
        ref:'Post'
      }
    ]

  },
  { timestamps: true }
);
userSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 24 * 60 * 60,
    partialFilterExpression: { emailVerified: false },
  }
);
module.exports = mongoose.model("User", userSchema);
