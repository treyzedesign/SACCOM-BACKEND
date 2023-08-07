const express = require("express");
const mongoose = require('mongoose')
const cors = require('cors')
const userRouter = require('./routes/User')

// config
const server = express();
const PORT = 4000
require('dotenv').config()
server.use(cors())
server.use(express.json())

// Routes
server.use('/api/v1', userRouter)

server.get('*', (req,res) => {
    res.send('This Route does not exists')
})


// dB connection
const startserver = async()=>{
    await mongoose.connect(process.env.DB_URI).then(()=>{
        console.log('db connected successfully');
    })
    server.listen(PORT, ()=>{
        console.log(`server is listening on port ${PORT}`);
    })
}
startserver()