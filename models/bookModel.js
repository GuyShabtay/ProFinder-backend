import mongoose from 'mongoose';

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
      required: false,
    },
  },
  {
    timestamps: true,
  }
);
export const Book = mongoose.model('Book', bookSchema);
