const Post = require("../models/posts");

const emitPostsUpdated = require("../app");
var mongoose = require("mongoose");
const User = require("../models/user");
const path = require("path");
const fs = require("fs");

exports.getUserPosts=(req,res,next)=>{
 
  let currentPage=req.body.currentPage;
  let postPerPage=3;
  let totalPostsCount;
  let noOfPostsInHorizontabBar;
 


  Post.find({user:req.params.userId}).countDocuments().then(number=>{
    totalPostsCount=number;
    //console.log("totalPostscount",totalPostsCount);
    //console.log("currentPate",currentPage);
    noOfPostsInHorizontabBar=totalPostsCount>postPerPage?postPerPage:totalPostsCount;
    
    Post.find({user:req.params.userId})
    .sort({likes:-1})
    .skip((currentPage-1)*postPerPage)
    .limit(noOfPostsInHorizontabBar)
    .then(posts=>{
      res.json({
        posts:posts
      })
    
    })

  }).catch(err=>{
    //console.log(err);
    next(err);
  })
}

exports.updatePost = (req, res, next) => {
  let imagesObject = JSON.parse(req.body.images);
  const postId = req.body.postId;
  //console.log(postId);
  Post.findOne({ _id: postId })
    .then((post) => {
      //console.log(post);
      post.title = req.body.title;
      post.content = req.body.content;
      post.images=imagesObject.images;
      post.save();
    })
    .then((post) => {
      res.json({
        messege: "Item updated to database",
        post,
      });
      emitPostsUpdated();
    })
    .catch((err) => {
      //console.log(err);
      res.status(400).send(err);
    });
};

exports.getSinglePost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findOne({ _id: postId })
    .populate("user")
    .then((post) => {
      //console.log(post);
      res.json({
        title:post.title,
        username: post.user.name,
        content: post.content,
        userId: post.user._id,
        comments:post.comments,
        id:post._id
      });
    })
    .catch((err) => {
      //console.log("Couldn't get posts from database");
    });
};

exports.commentPost = (req, res, next) => {
  const postId = req.params.postId;
  //console.log("postID", postId);

  //console.log("in a comment post");

  Post.findOne({ _id: postId })
    .then((post) => {
      //console.log(req.body);
      //console.log(req.userEmail);
      let comment = {};

      comment.name = req.username;
      comment.commentor = req.userId;
      comment.content = req.body.content;
      comment.createdAt = Date.now();

      updatedComments = [...post.comments];
      updatedComments.push(comment);
      post.comments = updatedComments;

      post.save();
      res.json({
        name: req.username,
        content: req.body.content,
        createdAt: Date.now().toString,
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.likePost = (req, res, next) => {
  const postId = req.params.postId;
  //console.log("postID", postId);

  //console.log("in a like post");

  Post.findOne({ _id: postId })
    .then((post) => {
      let likers = post.likers;
      //console.log("logging likers", likers);
      let liked = likers.includes(req.userId);
      //console.log("value of liked", liked);
      // liked ? (post.likes = post.likes - 1) : (post.likes = post.likes + 1);
      if (liked) {
        //if like decrease count and remove user from likers
        User.findById(req.userId)
          .then((user) => {
            let updatedLikedPosts = [...user.likedPosts];
            //console.log("liked posts before updateing ", updatedLikedPosts);
            updatedLikedPosts = updatedLikedPosts.filter((post) => {
              return post != postId;
            });
            //console.log("liked posts after updateing ", updatedLikedPosts);
            user.likedPosts = updatedLikedPosts;
            return user.save();
          })
          .then((result) => {
            let updatedLikers = [...likers];
            updatedLikers = updatedLikers.filter((liker) => {
              //console.log("liker", liker);
              //console.log("req.userId", req.userId);
              //console.log("truthness", liker !== req.userId);
              return liker != req.userId;
            });
            //console.log("updated likers ", updatedLikers);

            post.likes = post.likes - 1;
            post.likers = updatedLikers;
            post.save();
          });
      } else {
        //increase like and add user to likers
        User.findById(req.userId)
          .then((user) => {
            let updatedLikedPosts = [...user.likedPosts];
            updatedLikedPosts.push(postId);
            user.likedPosts = updatedLikedPosts;
            return user.save();
          })
          .then((result) => {
            let updatedLikers = [...likers];
            // //console.log(
            //   "updated likers when liked is false before pushing",
            //   updatedLikers
            // );
            updatedLikers.push(req.userId);
            //console.log("updated likers when liked is false", updatedLikers);
            post.likes = post.likes + 1;
            post.likers = updatedLikers;
            post.save();
          })
          .catch((err) => {
            //console.log(err);
          });
      }

      res.json({
        messege: "liked sucessfully",
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findOne({ _id: postId }).then((post) => {
    //deleting image stored in server
    if (req.userId == post.user) {
      if (post.images.length > 0) {
        post.images.map((image) => {
          //console.log("image", image);
          deleteStaticImage(image);
        });
      }

      Post.deleteOne({ _id: postId })
        .then((result) => {
          User.findById(req.userId)
            .then((user) => {
              updatedPosts = [...user.posts];
              let index = updatedPosts.findIndex((id) => id === postId);
              updatedPosts.splice(index, 1);
              user.posts = updatedPosts;

              return user.save();
            })
            .then(() => {
              Post.find().then((updatedPosts) => {
                res.json({
                  posts: updatedPosts,
                });
              });
            })
            .catch((err) => {
              //console.log(err);
            });
        })
        .catch((err) => {
          //console.log("Couldn't get posts from database");
        });
    } else {
      return;
    }
  });
};

exports.getPosts = (req, res, next) => {
  let sideBarPosts = [];

  let noOfPosts;
  let totalNoOfPosts;
  let postsPerPage = 7;
  let currentPage = req.body.currentPage;

  // //console.log("in get posts function with query " + req.body.query);
  let query = {};
  if (
    req.body.query !== "" &&
    req.body.query !== null &&
    req.body.query !== undefined
  ) {
    query = {
      $text: { $search: req.body.query },
    };
  }

  Post.find(query)
    .countDocuments()
    .then((result) => {
      totalNoOfPosts = result;
      let numberOfPostInSideBar = totalNoOfPosts > 2 ? 3 : totalNoOfPosts;

      return Post.find()
        .sort({ likes: -1 })
        .limit(numberOfPostInSideBar)
        .then((sidePosts) => {
          sideBarPosts = sidePosts;
        })
        .then((result) => {
          return Post.find(query)
            .sort(req.body.sortingMethod)
            .skip(postsPerPage * (currentPage - 1))
            .limit(postsPerPage)

            .then((posts) => {
              // //console.log("sideBarPosts", sideBarPosts);

              noOfPosts = posts.length;
              res.json({
                posts: posts,
                sideBarPosts: sideBarPosts,
                totalPosts: totalNoOfPosts,
              });
            });
        })
        .catch((err) => {
          throw err;
        });
    })
    .catch((err) => {
      //console.log(err);
    });
};

exports.createPost = (req, res, next) => {
  let imagesObject = JSON.parse(req.body.images);

  var newPost = new Post({
    title: req.body.title,
    content: req.body.content,
    //in order to pass array from form data json.stringify is used in fronend is images.images
    images: imagesObject.images,
    user: req.body.userId,
    comments: [],
    likes: 0,
    likers: [],
    username: req.username,
  });
  User.findById(req.body.userId)
    .then((user) => {
      // //console.log("adding user to post");
      updatedPosts = [...user.posts];
      updatedPosts.push(newPost);
      user.posts = updatedPosts;
      return user.save();
    })
    .then()
    .catch((err) => {
      //console.log("user save failed");
      //console.log(err);
    });

  newPost
    .save()
    .then((item) => {
      res.json({
        messege: "Item saved to database",
        post: newPost,
      });
      emitPostsUpdated();
    })
    .catch((err) => {
      //console.log(err);
      res.status(400).send(err);
    });
};
const deleteStaticImage = (imagePath) => {
  if (imagePath === null || imagePath === undefined) return;
  let completePath = path.join(__dirname, "..", imagePath);
  fs.unlink(completePath, (err) => {
    //console.log("File unlink error");
    //console.log(err);
  });
};
