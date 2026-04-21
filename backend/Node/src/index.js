import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import dbConnection from "./DB/db_connection.js";

dotenv.config();
const app = express();

app.use(cors({
     origin : process.env.CORS_ORIGIN,
     credentials : true
}))

app.get('/' , (req,res) => {
     res.status(200).json({
          "message" : "Node Backend is Running"
     })
})




dbConnection()
.then(
     ()=>{
          app.listen(process.env.PORT , () => {
               console.log(`Server is Listening on Port ${process.env.PORT}`)
          })
     }
)
.catch((err) => {
     console.log("Error Occurred", err);
     process.exit(1)
});
