const express=require("express");
const app=express();
const cors=require('cors');
const morgan=require('morgan');
const mongoose=require('mongoose');
require("dotenv").config({
    path:"./config.env"
});

// MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended:false
}));
app.use(morgan("dev"));
 

// TEST
app.post("/gotcha",(req,res)=>{
    console.log(req.body);
    res.status(200).send("Working");
});

 
  
// Configuring Routes
const auth=require('./routes/Auth');
app.use("/auth",auth);
const post=require('./routes/Post').router;
app.use("/post",post);
const fetcher=require('./routes/Fetcher');
app.use("/fetcher",fetcher);
const connections=require('./routes/Connections');
app.use("/connections",connections);



// connecting to database
mongoose.connect(process.env.MONGO_URL,{useNewUrlParser:true,useUnifiedTopology:true});
const db=mongoose.connection;
db.on('error',()=>console.log("connection error"));
db.once('open',()=>{
    console.log("We are connected!");
});

const PORT=process.env.PORT;

app.listen(PORT,()=>{
    console.log(`Server running at http://localhost:${PORT}`);
})
