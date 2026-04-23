
export const loginUser = (req , res)=>{
     try {
          res.status(202).json({
               "message" : "THis is login api"
          });
     } catch (error) {
          res.status(404).json({
               "message" : error.message
          })
     }
}

export const signUpUser = (req , res)=>{
     res.body("This is Signup User")
}