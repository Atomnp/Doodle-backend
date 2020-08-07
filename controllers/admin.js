const Post = require("../models/posts");

var mongoose = require("mongoose");
const User = require("../models/user");
const path = require("path");
const fs = require("fs");


exports.getPosts = (req, res, next) => {
    let totalUnapprovedPosts=0;
    let noOfUnapprovedPosts;
    let postsPerPage = 7;
    let currentPage = req.body.currentPage;
    Post.find({approved:false}).countDocuments().then(result=>{
        console.log(result);
        totalUnapprovedPosts=result;
        return Post.find({approved:false})
        .populate('user','name')
        .sort(req.body.sortingMethod)
        .skip(postsPerPage * (currentPage - 1))
        .limit(postsPerPage)
        .then((posts) => {

        posts.map(post=>{
            post.username=post.user.name;
            post.user=post.user._id;
        })
        noOfUnapprovedPosts = posts.length;
        console.log("number of un approved post in admin.js",totalUnapprovedPosts);
        res.json({
            posts: posts,
            totalPosts: totalUnapprovedPosts,
        });
        })
    })

    .catch((err) => {
    throw err;
    });
  };

  exports.approvePost=(req,res,next)=>{
      console.log("in approve post");
      let postId=req.params.id;
      Post.findById(postId).then(post=>{
          post.approved=true;
          return post.save();
      }).then(result=>{
          console.log("approved sucessfully");
          res.json({messege:"approved sucessfully"});
      }).catch(err=>{
          console.log("error occured while approving the post",err);
          next (err);
      })
  }