import mongoose from "mongoose"

const dbConnection = async () => {
     try {
          const connectionInstance = await mongoose.connect(`${process.env.DATABASE_URL}/${process.env.DATABASE_NAME}`)
          console.log(`MongoDB Connected Sucessfully `)
          // console.log(`Connection Instance : ${connectionInstance.connection.host}`)

     } catch (error) {

          console.log(`Error is : ${error}`)
          process.exit(1)
          
     }
}

export default dbConnection;