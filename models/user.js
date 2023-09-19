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
    phoneNumner : {
        type :Number,
        required : true
    }
  });
  
  // Define the User model
  const User = mongoose.model('User', userSchema);
  