const userModel = require('../../models/userModel')


async function userDeleteController(req,res){
    try{
    
        const { userId,  } = req.body
        console.log("user id -",userId)
        const user = await userModel.findByIdAndDelete(userId)
        
        console.log("user ->",user)
        res.status(200).json({
          
            error : false,
            success : true,
            message : " User Deleted "
        })


        

    }catch(err){

        res.status(400).json({
            message : err.message || err,
            error : true,
            success : false,
        })
    }
}

module.exports = userDeleteController