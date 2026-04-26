import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import validator from 'validator';
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

          const userName = req.body.userName?.trim();
          const emailId = req.body.emailId?.trim();
          const password = req.body.password

          // Validation for Required Fields.
          if ( !userName || !emailId || !password ){
               res.status(400).json({
                    "message" : "All Fields are Required..."
               })
          }

          // Validate Email
          if ( !validator.isEmail(emailId) ){
               res.status(400).json({
                    "message" : "Pls provide valid email address..."
               })
          }

          // Validate Strong Password
          if(!validator.isStrongPassword(password , {
               minLength    : 8 ,
               minLowercase : 1 ,
               minUppercase : 1 ,
               minNumbers   : 1 ,
               minSymbols   : 1
          })){
               return res.status(400).json({
                    message: "Password must be at least 8 characters and include uppercase, lowercase, number and symbol..."
               });
          }

          //Validate UserName

          if (!/^[a-zA-Z0-9_]{3,20}$/.test(userName)) {
               return res.status(400).json({
                    message: "Username must be 3-20 characters and contain only letters, numbers or underscores..."
               });
          }

          const userFound = await User.findOne({
               $or: [{ emailId }, { userName: userName.toLowerCase() }]
          });

          if( userFound ){
               if(userFound.emailId === emailId){
                    res.status(404).json({
                         "message" : "User Already Exist. Kindly Login..."
                    })
                    return;
               }
               if(userFound.userName === userName.toLowerCase()){
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