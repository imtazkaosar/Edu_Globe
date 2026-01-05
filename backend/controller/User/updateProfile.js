const userModel = require("../../models/userModel")

async function updateProfile(req, res) {
    try {
        const sessionUser = req.userId
        console.log("id --- ",sessionUser)

        const {  email, name, profilePic } = req.body
        console.log("user sent from profile - ",req.body)
        console.log("sent name",name)
        console.log("sent email",email)
        console.log("sent pp",profilePic)
        const payload = {
            ...(email && { email: email }),
            ...(name && { name: name }),
            ...(profilePic && { profilePic: profilePic }),
            
        }
        console.log("payload --- ",payload)

        const user = await userModel.findById(sessionUser)
       // console.log('user ', user)


         const updateUser = await userModel.findByIdAndUpdate(sessionUser, payload)
         console.log("update ->  ",updateUser)

        res.json({
            data: updateUser,
            message: "Updated successfully",
            success: true,
            error: false
        })

    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false,
        })
    }
}


module.exports = updateProfile