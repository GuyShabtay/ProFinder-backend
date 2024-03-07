import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
    {
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
          required: true,
        },
      profiles: [
        {
          profession: {
            type: String,
            required: true,
          },
          location: {
            type: String,
            required: true,
          },
          phone: {
            type: String,
            required: true,
          },
          rating: {
            type: Number,
            default: 0,
          },
          ratedUsers: [
            {
              userId: { type: mongoose.Schema.Types.ObjectId},
              // user: { type: String},
              userRating: { type: Number, default: 0 }
            }
          ],
          comments: [
            {
              commenter: {
                type: String,
                required: true,
              },
              text: {
                type: String,
                required: true,
              },
              color: {
                type: String,
                required: true,
              },
              createdAt: {
                type: Date,
                default: Date.now,
              },
            }
          ],
        }
      ],    
    }
    );
export const User = mongoose.model('User', userSchema);