const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt=require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../Models/User');
const salt = 8;

router.post('/api/createuser', [
    body('name', "Enter a name with minimum 3 letter or enter full name").isLength({ min: 5 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', "Enter a password with minimum 7 characters").isLength({ min: 7 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.errors[0].msg });
    }
    try {
        const userExist = await User.findOne({ email: req.body.email });
        if (userExist) return res.status(400).json({ errors: 'Use a different email' })

        let userPassword = req.body.password;
        const hashPassword = await bcrypt.hash(userPassword, salt)

        const newUser = await User.create({
            email: req.body.email,
            name: req.body.name,
            password: hashPassword,
        })
        return res.status(200).json({ success: true })
    } catch (err) {
        console.error(err)
        res.status(500).json({error:"Internal error"})
    }
})

router.post('/api/login', [
    body('email', 'Enter correct credentials').isEmail(),
    body('password', 'Enter correct credentials').isLength({ min: 7 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.errors[0].msg });

    let userEmail = req.body.email;
    let userPassword = req.body.password;

    try {
        const userExist = await User.findOne({ email: req.body.email });
        if (!userExist) return res.status(400).json({ errors: 'Invalid user' })
        let hashPassword = await bcrypt.compare(userPassword, userExist.password)
        if (!hashPassword) return res.status(401).json({ errors: 'Enter correct credentials' })

        const token=jwt.sign({id:userExist._id},process.env.jwtSECRET)
        return res.status(200).json({ token })
    } catch (err) {
        console.error(err);
        res.status(500).json({error:"Internal error"});
    }
})



module.exports = router