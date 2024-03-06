import mongoose from 'mongoose';
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};
const bookSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    profession: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    ratedUsers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId},
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
          type: Date,
          default: getRandomColor(),
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      }
    ]
  },
  {
    timestamps: true,
  }
);

export const Book = mongoose.model('Book', bookSchema);
