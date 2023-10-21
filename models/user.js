const mongoose = require('mongoose');
// Define the User schema
const userSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber : {
        type :Number,
        required : true
    },
    publicKey : {
      type : String,
      required : true
    },
    privateKey : {
      type : String,
      required : true
    },
    category : {
      type : String,
      required : true,
      enum :  ['verifier', 'holder', 'issuer'],
      lowercase : true 
    }
  });
  
  // Define the User model
  const User = mongoose.model('User', userSchema);

  
  module.exports = User;