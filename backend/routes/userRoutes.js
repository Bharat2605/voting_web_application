const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware,generateToken} = require('./../jwt');

router.post('/signup', async (req ,res) => {
   try{
       const data = req.body ;  //Assuming the request body  contains the person data

       //Create a new person document using the Mongoose model
       const newUser = new User(data);

       // Save the new person to the databasse

       const response  = await newUser.save();
       console.log('data saved');
      
       const payload = {
        id: response.id
       }
      console.log(JSON.stringify(payload));
      const token = generateToken(payload);
      console.log("Token is :",token);

       res.status(200).json({response: response , token: token});
   }
  catch(err){
    console.log(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
}
);

router.post('/login' ,async (req,res) => {
      try{
          const {aadharCardNumber,password} = req.body;

          // find the user by username
          const user = await User.findOne({aadharCardNumber: aadharCardNumber});
          
          //if user does not exist or password does not match , return error
          if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({error : 'Invalid aadharCardNumber or password'});
          }
      
      //generate token
      const payload = {
        id: user.id,
      }
      const token = generateToken(payload);

      //resturn token as response
      res.json({token})
    }

      catch(err){
         console.error(err);
         res.status(500).json({error: 'Internal Server Error'});
      }
}
);

router.get('/profile',jwtAuthMiddleware,async (req,res) => {
try{
   const userData = req.user;
   const userId = userData.id;
   const user = await User.findById(userId);
   res.status(200).json({user})

}  
catch(err){
    console.error(err);
    res.status(500).json({error : 'Internal Server Error'});
}
}
);

router.put('/profile/password',jwtAuthMiddleware,async (req,res) => {
    try{
     const userId = req.user.id;
     const {currentPassword , newPassword} = req.body;

     if(!currentPassword || !newPassword){
        return res.status(400).json({err : 'Both currentPassword and newPassword are required'});
     }
    
     const user = await User.findById(userId);
     if (!user || !(user.comparePassword(currentPassword))) {
        return res.status(401).json({error : ' INvalid current Password'});
     }

     //update the user's password
     user.password = newPassword;
     await user.save();
     console.log('password updated');
     res.status(200).json({message : 'password updated'});

    }
    catch(err){
          console.error(err);
          res.status(500).json({error : ' Internal Server Error'});
    }

}
)

// Admin dashboard: list of registered voters (name + Aadhar number only).
router.get('/registration', jwtAuthMiddleware,  async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select('role');
    if (admin?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin role required' });
    }

    const users = await User.find({ role: 'voter' })
      .select('name aadharCardNumber')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      total: users.length,
      registrations: users.map((u) => ({
        id: u._id,
        name: u.name,
        aadharCardNumber: u.aadharCardNumber,
      })),
    });
  } catch (err) {
    console.error('Registration list error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;