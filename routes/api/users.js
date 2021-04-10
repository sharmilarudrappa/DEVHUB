/*For routing of different pages */
const express=require('express')
const router=express.Router();
const gravatar=require('gravatar');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const config=require('config');
/* to validate email and password */
const {check,validationResult}=require('express-validator');
const { Mongoose } = require('mongoose');
const User=require('../../models/User'); //To import the user file

/* @route POST api/users 
Description of the route : Register the user 
Access of the route      :Public
(the access of the route can be public or private in private we
    send the token along like for authentication) */
/* second parameter is the message on the check */
router.post('/',[
check('name','Name is required')
.not()
.isEmpty(),
/* is email checks if its a valid email address */
/* the . after check is the for the rule we want to validate like 
length of password must be greater than 6 */
check('email','Please include a valid email').isEmail(),
check('password','Please enter a password with length greater than six').isLength({min:6})
],async function(request,response){
    const errors=validationResult(request);
    /* if there is a error the response status is shwon */
    /* that error is converted to a json array and displayed */
    if(!errors.isEmpty()){
        return response.status(400).json({errors:errors.array()});
    }
    const {name,email,password}=request.body;
    //We will check if the user exists
    // instead of findOne we use async await   
    try{
        // To get the user based on the email
        let user=await User.findOne({email});
        // This is during sign up if the user already exists then the error message is printed
        if(user)
        {
           return response.status(400).json({errors:[{msg:'User already exists'}]});
        }
        //Get the user's gravatar which is based on the user's email
        // Now if the user isnt present we get the gravatar of the user
        const avatar = gravatar.url(email,{
            s:'200', // Here 200 is the size of the avatar  
            r:'pg', // pg is the rating that no nude pictures
            d:'mm', // mm is for the default image/ avatar
        })

        // Creating the instance of the user
        user=new User({
            name,
            email,
            avatar,
            password
        })

        //Encrypt the password using bcrypt
        const salt=await bcrypt.genSalt(10); // This is for hashing
        user.password=await bcrypt.hash(password,salt);

        await user.save(); // Anything that requires a promise await is written in front of it 
        //Return the JSON web token because in order to be logged in we need that
        // payload we send here is the user id 

        const payload={
            // To get the user's id
            user:
            {
                id:user.id
            }
        }
        // The second argument is the secret key which is stored in config
        jwt.sign(
            payload,
            config.get('jwtSecret',
            { expiresIn:3600000}) // To tell the user expires in these many minutes
            ,(err,token)=>{ // Callback 
                if(err)throw err
                response.json({token}); //Send the token back to the client
            })        
        // response.send('User is registered');
    }
    catch(err)
    {
        console.error(err.message);
        response.status(500).send('Server error');
    }









})

module.exports=router;