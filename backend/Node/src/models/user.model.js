import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
     "userName" : {
          type : String,
          required : true,
          unique : true,
          lowercase : true
     },
     "emailId" : {
          type : String,
          required : true,
          unique : true
     },
     "password" : {
          type : String,
          required : true
     }
})

export const User = mongoose.model("User" , userSchema)