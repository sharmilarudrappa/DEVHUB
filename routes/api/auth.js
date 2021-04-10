/*For routing of different pages */
const express=require('express')
const router=express.Router();
const auth=require('../middleware/auth')
const bcrypt=require('bcryptjs');
const User=require('../../models/User')
const jwt=require('jsonwebtoken');
const config=require('config');
/* to validate email and password */
const {check,validationResult}=require('express-validator');

/* @route POST api/auth
Description of the route : Authenticate user and get token
Access of the route      :Public
(the access of the route can be public or private in private we
    send the token along like for authentication) */
router.get('/', auth, async (req, res) => {
        try {
          const user = await User.findById(req.user.id).select('-password');
          res.json(user);
        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server Error');
        }
      });

router.post('/',[
        /* is email checks if its a valid email address */
        /* the . after check is the for the rule we want to validate like 
        length of password must be greater than 6 */
        check('email','Please include a valid email').isEmail(),
        check('password','password is required').exists()
        ],async function(request,response){
            const errors=validationResult(request);
            /* if there is a error the response status is shwon */
            /* that error is converted to a json array and displayed */
            if(!errors.isEmpty()){
                return response.status(400).json({errors:errors.array()});
            }
            const {email,password}=request.body;
            //We will check if the user exists
            // instead of findOne we use async await   
            try{
                // To get the user based on the email
                let user=await User.findOne({email});
                // This is during sign up if the user already exists then the error message is printed
                if(!user)
                {   
                   return response.status(400).json({errors:[{msg:'Invalid credentials'}]});
                }
        
                // To match the email and password if the user is found
                // To check the password entered by the user and the password in the database
                const isMatch=await bcrypt.compare(password,user.password)
                if(!isMatch)
                {
                    return response.status(400).json({errors:[{msg:'Invalid credentials'}]});
                }
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