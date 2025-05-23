import jwt from 'jsonwebtoken';
export const isLoggedIn = async(req,res,next) => {
    try {
        console.log(req.cookies);
      const token =  req.cookies?.token;
      
      console.log('Token Found : ' , token ? "YES" : "NO");
      if(!token) {
        console.log("NO token");
       return res.status(401).json({
            success : false,
            message : "Authentication Failed"
        }) 
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded data : ",decoded);
    req.user = decoded;

    next();

    } catch (error) {
        console.log("Auth middleware failure : " , error);
        return res.status(500).json({
            success : false,
            message : "Internal server error"
        })  
    }  
};