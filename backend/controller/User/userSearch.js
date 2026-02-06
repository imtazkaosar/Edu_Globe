
const userModel = require('../../models/userModel')




async function userSearchController(req,res){
   
    try{
        const { email } = req.body
        console.log("body = ",req.body)

        console.log("email = ", email)

        if(!email){
            throw new Error("Please provide an Email")
        }
       

        const user = await userModel.findOne({email})
      console.log("user details = ",user)

       if(!user){
            throw new Error("User not found")
       }
     
 
       res.json({
        message: " user found ",
        data:  user,
        success:true,
        error:false

    })

    }catch(err){
        res.status(400).json({
            message : err.message || err,
            error : true,
            success : false,
        })
    }

}

module.exports = userSearchController