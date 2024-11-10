import mongoose from "mongoose";

const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("mongodb connected successfully");
    } catch(err){
        console.log("S");  
        console.log(err);
    }
}

export default connectDB;