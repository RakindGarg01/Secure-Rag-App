import express from "express"
import dotenv from "dotenv"

dotenv.config();
const app = express();

app.get('/' , (req,res) => {
     res.json({
          "message" : "Node Backend is Running"
     })
})

app.listen(process.env.PORT , ()=>{
     console.log(`Server is listening on port ${process.env.PORT}`)
})