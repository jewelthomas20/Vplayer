const mongoose = require('mongoose');

const ConnectToMongoDb=async()=>{
await mongoose.connect(`mongodb+srv://${process.env.mongoID}:${process.env.mongoPass}@vplayer.fre8tyw.mongodb.net/Vplayer?retryWrites=true&w=majority`).then(()=>console.log('connected to server'))

//mong.connect is now not taking callbacks
// accessing videos collection 
global.videoCollection =mongoose.connection.db.collection('videos');
// using find({}) func of mongoose to collect all data and converting it into array [{},{},etc] and adding to global variable
 global.VideosData=await videoCollection.find({}).toArray()


   
}

module.exports = ConnectToMongoDb;