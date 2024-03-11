import express from 'express';
import { Profile } from '../models/profileModel.js';

import { User } from '../models/userModel.js';
import bcrypt from 'bcrypt'
import  jwt  from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const router = express.Router();
router.use(cookieParser());


// Route for Save a new Profile
router.post('/', async (request, response) => {
  try {
    if (
      !request.body.name ||
      !request.body.email ||
      !request.body.profession ||
      !request.body.location ||
      !request.body.phone
    ) {
      return response.status(400).send({
        message: 'Send all required fields: name,email, profession, location, phone',
      });
    }

    const newProfile = {
      name: request.body.name,
      email: request.body.email,
      profession: request.body.profession,
      location: request.body.location,
      phone: request.body.phone,
    };

    const profile = await Profile.create(newProfile);

    // Update the user's profiles array with the newly created profile's ID
    const user = await User.findOneAndUpdate(
      { email: request.body.email }, // Find the user by email
      { $push: { profiles: profile._id } }, // Add the profile's ID to the profiles array
      { new: true }
    );

    return response.status(201).send({ profile, user });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});


// Route for Get All Profiles from database
router.get('/', async (request, response) => {
  try {
    const { q, option } = request.query;

    let query = {};

    if (q && option) {
      query[option] = { $regex: q, $options: 'i' };
    }

    const profiles = await Profile.find(query);

    return response.status(200).json({
      count: profiles.length,
      data: profiles,
    });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});


// Route for Get One Profile from database by id
router.get('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    const profile = await Profile.findById(id);

    return response.status(200).json(profile);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for Update a Profile
router.put('/:id', async (request, response) => {
  try {
    if (
      !request.body.profession ||
      !request.body.location ||
      !request.body.phone 
    ) {
      return response.status(400).send({
        message: 'Send all required fields: profession, location,phone',
      });
    }

    const { id } = request.params;

    const result = await Profile.findByIdAndUpdate(id, request.body);

    if (!result) {
      return response.status(404).json({ message: 'Profile not found' });
    }

    return response.status(200).send({ message: 'Profile updated successfully' });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});
// Route for add user comments
router.put('/comment/:id', async (request, response) => {
  try {

    const { id } = request.params;
    // const { user, userRating } = request.body;
    const { commenter, text,color } = request.body;
console.log('commenter',commenter)
console.log('text',text)


    const profile = await Profile.findById(id);

    if (!profile) {
      return response.status(404).json({ message: 'Profile not found' });
    }
// Push the new rating object to the ratedUsers array
// profile.ratedUsers.push({ user, userRating });
profile.comments.push({ commenter, text,color });

// Save the updated profile
await profile.save();

    return response.status(200).send({ message: 'Profile updated successfully' });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});
// Route for add user rating
router.put('/rating/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const { user, userRating } = request.body;

    const profile = await Profile.findById(id);

    if (!profile) {
      return response.status(404).json({ message: 'Profile not found' });
    }

    // Push the new rating object to the ratedUsers array
    profile.ratedUsers.push({ user, userRating });

    // Calculate the new average rating
    const totalRatings = profile.ratedUsers.reduce((acc, curr) => acc + curr.userRating, 0);
    const averageRating = totalRatings / profile.ratedUsers.length;

    // Update the profile's rating with the new average rating
    profile.rating = averageRating;

    // Save the updated profile
    await profile.save();

    return response.status(200).send({ message: 'Profile updated successfully' });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});


// Route for Delete a profile
router.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    const result = await Profile.findByIdAndDelete(id);

    if (!result) {
      return response.status(404).json({ message: 'Profile not found' });
    }

    return response.status(200).send({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});


router.post('/register', async (request, response) => {
  try {
    if (
      !request.body.name ||
      !request.body.email ||
      !request.body.password ||
      !request.body.color
    ) {
      return response.status(400).send({
        message: 'Send all required fields: name, email, password, color',
      });
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ email: request.body.email });
    if (existingUser) {
      return response.status(400).send({
        message: 'User with this email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(request.body.password, 10);

    const newUser = {
      name: request.body.name,
      email: request.body.email,
      password: hashedPassword,
      color: request.body.color,
    };

    const user = await User.create(newUser);

    return response.status(201).send(user);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});




router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    bcrypt.compare(password, user.password, (err, response) => {
      if (err || !response) {
        return res.status(401).json({ message: "Incorrect password" });
      } else {
        const token = jwt.sign({ email: user.email }, "jwt-secret-key", { expiresIn: "1d" });
        res.cookie("token", token);
        console.log("Username:", user.name);
        res.json({
          message: "Success",
          username: user.name,
          token: token
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
