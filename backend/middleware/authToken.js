const jwt = require('jsonwebtoken')

async function authToken(req,res,next){
    try{

        const token = req.cookies?.token 

        console.log("token - ",token)

        if(!token){
            return res.json({
                message : "user not loged-in",
                error : true,
                success : false,

            })
        }

        jwt.verify(token, process.env.TOKEN_SECRET_KEY, function(err, decoded) {
            console.log(err)
            console.log("decoded",decoded) // bar


            if(err){
                console("auth error ",err)
            }

            req.userId = decoded?._id
            next()


          });



      

    }catch(err){

        res.status(400).json({
            message : err.message || err,
            data : [],
            error : true,
            success : false,
        })
    }
}

module.exports = authToken