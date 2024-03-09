import mongoose from 'mongoose';

const profileSchema = mongoose.Schema({
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
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        default: 0,
    },
    ratedUsers: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }
    ],
});

export const Profile = mongoose.model('Profile', profileSchema);
