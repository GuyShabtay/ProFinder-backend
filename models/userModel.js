import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  color: {
    type: String,
  },
  profiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],
});
export const User = mongoose.model('User', userSchema);
