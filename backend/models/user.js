const mongoose = require('mongoose');
const { type } = require('node:os');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    age : {
        type: Number,
         min: [18, 'Age must be 18 or above']
    },
    email : {
        type : String,

    },
    mobile : {
        type : String
    },
    address : {
        type : String,
        required : true
    },
    aadharCardNumber : {
        type : Number,
        required : true,
        unique: true
    },
    password : {
        type : String,
        required : true
    },
    role : {
        type : String,
        enum : ['voter','admin'],
        default : 'voter'
    },
    
       isVoted : {
    type : Boolean,
    default : false
}
    
});


userSchema.pre('save',async function(){
    const User = this;

    // Hash the password only if it has been modified (or is new)
    if(!User.isModified('password')) return;

  
    const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(User.password,salt);

      //Override the plain password with the hashed one

      User.password = hashPassword;
      
 
}
);

userSchema.methods.comparePassword = async function(userPassword) {
    try{
      //use bcrypt tp compare the provided password with the hashed password
      const isMatch = await bcrypt.compare(userPassword,this.password);
      return isMatch;
    }
    catch(err){
        throw err;
    }
};

const User = mongoose.model('User',userSchema);
module.exports = User;