const express=require('express')
const ConnectToMongoDB= require('./db');
require('dotenv').config()
const app=express();
const cors = require('cors')
app.use(cors())
app.use(express.json());


app.use('',require('./Routes/Auth'))
app.use('',require('./Routes/Display'))


ConnectToMongoDB();

app.listen(5000,()=>{
    console.log('server running')
})