const jwt = require("jsonwebtoken");


module.exports=(req,res,next)=>{
    console.log("in authorization middleware")
    const authHeader=req.header('Authorization');
    console.log(authHeader);
    if(!authHeader){
        return res.status(401).json({
            message:"not authorized"
        })
        
    }
    const token=req.get('Authorization').split(' ')[1];
    let decodedToken;
    try{
        decodedToken=jwt.verify(token,'thisissexretkey')
    }
    catch(err){
        console.log("token not verified");
        err.statusCode=422;
        throw err;
    }
    if(!decodedToken){
        let error= new Error("not authorized");
        error.statusCode=422;
        throw error;
    }
    req.userId=decodedToken.userId;
    req.username=decodedToken.username;
    req.userEmail=decodedToken.userEmail;
    next();
    

}
