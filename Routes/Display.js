const express = require('express');
const router = express.Router();
const User = require('../Models/User');
const fetchUser = require('../Middleware/FetchUser')



//===============================================DISPLAYING VIDEOS DATA=========================================================================
router.get('/displayvideo', async (req, res) => {
    try {
        //returning the videos data from db file stored into global variable and sending as video {videos:[{},{}{}]}
        await global.VideosData;
        return res.status(200).json({ 'videos': global.VideosData })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "internal error" })
    }
})
//===============================================DISPLAYING NOTIFICATION =========================================================================
router.get('/displayNotification', fetchUser, async (req, res) => {
    try {
        //getting user _id from auth-token after been extracted through middleware
        const userID = await req.user;
        const currentUser = await User.findOne({ _id: userID });
        //after fetching user, checking for {notification:[]} and sending this to front as { notification:[]}
        const notification = await currentUser.notification;
        return res.status(200).json({ notification })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "internal error" })
    }
})

//===============================================SETTING VIEWS (will be called only when loggedin)====================================================================
router.post('/setViews', fetchUser, async (req, res) => {
    try {
        //getting user _id from auth-token after been extracted through middleware and fetching email from front send sent as body
        const userID = await req.user;
        const currentUser = await User.findOne({ _id: userID });
        const userEmail = currentUser.email;
        const title = req.body.title;
        //will stored data from likes[] if the user has liked the video then user email will exist in likes[]
        var liked;
        //storing the current{} data using its title into Videos 
        const Video = await global.videoCollection.findOne({ title: title });

        //length gives actual length not index, checking if view[]length is 0 if yes will add the first view by pushing in using $push
        if (Video.views.length === 0) {
            await global.videoCollection.updateOne({ title: title }, { $push: { views: userEmail } })
        }
        else {
            //filtering the views[]and eliminating if current email already exist then will add the current email also to array and set entire view[].
            let newView = await Video.views.filter((data) => data !== userEmail);
            await newView.push(userEmail)
            await global.videoCollection.findOneAndUpdate({ title: title }, { $set: { views: newView } });
        }
        //will check if the current user have already liked the video and will sent yes acc to display in front
        if(Video.likes.includes(userEmail)){
            liked='Yes'
        }
        else{
            liked='No'
        }
        const updatedView = await global.videoCollection.findOne({ title: title });
        return res.status(200).json({ views: updatedView.views, liked })

    } catch (err) {
        console.warn(err);
    }
})
//===============================================SETTING LIKE AND UNLIKE=========================================================================
router.post('/setLikes', fetchUser, async (req, res) => {
    try {
        //getting user _id from auth-token after been extracted through middleware and fetching email from front send sent as body
        const userID = await req.user;
        const currentUser = await User.findOne({ _id: userID });
        const userEmail = currentUser.email;
        const title = req.body.title;
        const Video = await global.videoCollection.findOne({ title: title });
        var liked;


        //length gives actual length not index. checking if likes is empty then pushing 1st like
        if (Video.likes.length === 0) {
            await global.videoCollection.updateOne({ title: title }, { $push: { likes: userEmail } })
            const updatedLikes = await global.videoCollection.findOne({ title: title });
            return res.status(200).json({ likes: updatedLikes.likes })
        }
        else {
            //checking if the email already exist in likes[] if yes then will proceed to unlike 
            let newlike = await Video.likes.includes(userEmail);
            if (newlike) {
                //since email exist in array filtering the array and returning new array without usermail (unliking)
                const newLikes = await Video.likes.filter((data) => data !== userEmail);
                //the new [] is replaced with the entire likes[] using set
                await global.videoCollection.findOneAndUpdate({ title: title }, { $set: { likes: newLikes } });

            }
            else {
                //as checked userEmail doesnot exist so this block will add new like
                //fetching the likes[] and pushing new email to [] and changing the entire likes[]
                let newlike = await Video.likes;
                await newlike.push(userEmail)
                await global.videoCollection.findOneAndUpdate({ title: title }, { $set: { likes: newlike } });
            }
        }
     
        const updatedLikes = await global.videoCollection.findOne({ title: title });
        return res.status(200).json({ likes: updatedLikes.likes })

    } catch (err) {
        console.warn(err);
    }
})

// function to check views and like but dont need it as data is already sent in /display  with props we can access in frontend// but now need this to show updated likes
router.post('/viewLikesandviews',async(req,res)=>{
    const title=req.body.title;
    const Video=await global.videoCollection.findOne({title:title});
    return res.status(200).json({likes:Video.likes,views:Video.views,comments:Video.comment})

})

//===============================================POSTING COMMENTS=========================================================================

router.post('/postcomment', fetchUser, async (req, res) => {
    try {
        //getting user _id from auth-token after been extracted through middleware and fetching email from front send sent as body
        const userID = await req.user;
        const currentUser = await User.findOne({ _id: userID });
        const userName = currentUser.name;
        const userComment = req.body.comment;
        const title = req.body.title;
        //after getting email and comment comments are pushed into comments[]
        await global.videoCollection.updateOne({ title: title }, { $push: { comment: { name: userName, comment: userComment } } })

        const updatedComment = await global.videoCollection.findOne({ title: title });
        return res.status(200).json({ comments: updatedComment.comment })

    } catch (err) {
        console.warn(err);
    }
})

module.exports = router

