const jwt=require('jsonwebtoken')

const fetchUser=(req,res,next)=>{
    const token=req.header('auth-token')
    if(!token) return res.status(401).json({errors:"Invalid Token"})
    try{
       let data= jwt.verify(token,process.env.jwtSECRET)
       //.user can be any variable on to which id from token will be stored
        req.user=data.id;
        next();
    }catch(err){
        console.warn(err)
    }
}
module.exports =fetchUser