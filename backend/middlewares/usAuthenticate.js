import jwt from "jsonwebtoken";

const isAuthenticate = async(req,res,next) => {
    try{
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({
                message : 'User not authenticate',
                success : false
            })
        }
        const decode = await jwt.verify(token, process.env.SECRET_KEY);
        if(!decode){
            return res.status(401).json({
                message : 'Invalid token',
                success : false
            })
        }

        req.id = decode.userId;
        next();
    }catch(err){
        console.log(err);
        
    }
}

export default isAuthenticate