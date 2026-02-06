const userModel = require("../models/userModel")

const uploadproductpermission = async(userId) =>{
    const user = await userModel.findById(userId)
    if(user.role !== "ADMIN"){
        return false
    }
    else{
        return true
    }
}

module.exports = uploadproductpermission