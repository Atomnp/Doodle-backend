const User = require("../models/user");
const Downloads = require("../models/downloads");

const path=require('path');
const fs=require('fs');



exports.postImageFromTinyMce=(req,res,next)=>{


  const path= req.files[0].path;
  res.json({
    imagePath:path
  });
}


exports.getProfile = (req, res, next) => {

  const userId=req.params.userId;
  //console.log("getProfile printing userId",userId);

  User.findById(userId).populate({
    path:'posts',
    model:'Post',
    options:{sort:{
      likes:-1
    }}
  }).then(user=>{
    user.posts.map(post=>{
      //console.log(post.likes);
    })
    totalPostsCount=user.posts.length;
    //console.log("logging user after populatinf ",user);
    res.status(200).json({
      name:user.name,
      email:user.email,
      createdAt:Date.now().toString(),
      imageUrl:user.imageUrl,
      userPosts:user.posts.slice(0,3),
      totalPostsCount:totalPostsCount
    });
  }).catch(err=>{
    //console.log(err);
    if(!err.statusCode){
      err.statusCode=500;
    }
    next(err);
  })

};
exports.updateProfile=(req,res,next)=>{
  //console.log("in update profile");

  let oldImageUrl;
  const defaultImage="images\\default.jpeg";
  const userId=req.params.userId;
  //console.log(">>>>>",userId,req.userId,userId==req.userId);
  if(userId!=req.userId){
    return res.json({
      messege:"you can only edit your profile"
    })
  }

  User.findById(userId).then(user=>{
      user.name=req.body.name;
      user.email=req.body.email;
     if(req.files[0] && user.imageUrl!==defaultImage)
     {
       //console.log("right condition iffile is added");
        oldImageUrl=user.imageUrl;
        user.imageUrl=req.files[0].path;
        deleteStaticImage(oldImageUrl);
      }
      else if(req.files[0] && user.imageUrl===defaultImage)
      {
        //console.log("file provided and old was default")

        user.imageUrl=req.files[0].path;
      }
      else{
        //console.log("no condition matched");
        if(req.files[0]){
          //console.log("file provided");
        }
      }
      user.save();


     return res.status(200).json({
         user:user,
         message:"post removed sucessfully"
      
        })
 }).catch(err=>{
     //console.log(err);
     next(err);
 })
}

exports.addFile=(req,res,next)=>{
  //console.log("in add file");
  //console.log(req.files)
 

  const downloads=new Downloads({
    fileUrl:req.files[0].path
  })
  downloads.save().then(result=>{
    //console.log("file saved to the database sucessfully");

    res.json({
      messege:"mission sucessfu;"
    })
  });
}
exports.downloadFile=(req,res,next)=>{
  //console.log("in download file");
  const fileId=req.params.fileId
  
  Downloads.findById(fileId).then(file=>{

    let newPath=path.join(__dirname,'..',file.fileUrl);
    res.download(newPath);


  }).catch(err=>{
    //console.log("bei catch");
    //console.log(err);
  })
}

exports.getDownloadFiles=(req,res,next)=>{
  //console.log("in get download files");
  
  Downloads.find().then(files=>{
    res.json({files:files});

  })
}



const deleteStaticImage=(imagePath)=>{
  let completePath=path.join(__dirname,'..',imagePath);
  fs.unlink(completePath,err=>{
      //console.log("file unlink error");
      //console.log(err);
  })
  
}