import { User } from "../models/user.model.js";


export const loginUser = async (req , res)=>{
     try {
          
          const {emailId , password , userName} = req.body;
          const userFound = await User.findOne({userName});

          if ( !userFound){
               res.status(404).json({
                    "message" : "User Does not Exist. Kindly Create One..."
               });
               return;
          }

          res.status(202).json({
               "message" : "User Sucessfully Login"
          });

     } catch (error) {
          res.status(404).json({
               "message" : error.message
          })
     }
}

export const signUpUser = async (req , res)=>{
     try {
          
          const {userName , emailId , password } = req.body;

          const userFound = await User.findOne({
               $or: [{ emailId }, { userName: userName.toLowerCase() }]
          });

          if( userFound ){
               if(userFound.emailId = emailId){
                    res.status(404).json({
                         "message" : "User Already Exist. Kindly Login..."
                    })
                    return;
               }
               if(userFound.userName = userName.toLowerCase()){
                    res.status(404).json({
                         "message" : "UserName is already taken. Pls choose different ..."
                    })
                    return;
               }
               
          }

          const user = await User.create({userName , emailId , password})

          res.status(200).json({
               "message" : "User have been created."
          })

     } catch (error) {
          res.status(404).json({
               "message" : error.message
          })
     }
}