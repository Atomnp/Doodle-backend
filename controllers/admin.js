const Post = require("../models/posts");

var mongoose = require("mongoose");
const User = require("../models/user");
const path = require("path");
const fs = require("fs");


exports.getPosts = (req, res, next) => {
    let sideBarPosts = [];
  
    let noOfPosts;
    let totalNoOfPosts;
    let postsPerPage = 7;
    let currentPage = req.body.currentPage;
  
    // //console.log("in get posts function with query " + req.body.query);
    let query = {approved:false};
    if (
      req.body.query !== "" &&
      req.body.query !== null &&
      req.body.query !== undefined
    ) {
      query = {
        approved:false,
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
              .populate('user','name')
              .sort(req.body.sortingMethod)
              .skip(postsPerPage * (currentPage - 1))
              .limit(postsPerPage)
              .then((posts) => {
                
                
                posts.map(post=>{
                  post.username=post.user.name;
                  post.user=post.user._id;
                })
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