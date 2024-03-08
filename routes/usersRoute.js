import express from 'express';
import { User } from '../models/userModel.js';
import bcrypt from 'bcrypt'
import  jwt  from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const router = express.Router();
// const jwt = require('jsonwebtoken');
// const cookieParser=require('cookie-parser');

router.use(cookieParser());

// Route for Save a new Profile

router.post('/', async (request, response) => {
  try {
    const { name, profession, location, phone } = request.body;

    if (!name || !profession || !location || !phone) {
      return response.status(400).send({
        message: 'Send all required fields: name, profession, location, phone',
      });
    }

    // Find the user by email
    const user = await User.findOne({ name });

    if (!user) {
      return response.status(404).send({ message: 'User not found' });
    }

    // Create a new profile object
    const newProfile = {
      name,
      profession,
      location,
      phone,
    };

    // Push the new profile into the profiles array of the user
    user.profiles.push(newProfile);

    // Save the updated user
    await user.save();

    return response.status(201).send(user);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});


// Route for Get All Users from database
router.get('/', async (request, response) => {
  try {
    const { q, option } = request.query;

    let query = {};

    if (q && option) {
      query[option] = { $regex: q, $options: 'i' };
    }

    const users = await User.find(query);

    return response.status(200).json({
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});


// Route for Get One User from database by id
router.get('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    const user = await User.findById(id);

    return response.status(200).json(user);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for Update a User
router.put('/:id', async (request, response) => {
  try {
    if (
      !request.body.name ||
      !request.body.profession ||
      !request.body.location ||
      !request.body.phone 
    ) {
      return response.status(400).send({
        message: 'Send all required fields: name, profession, location,phone',
      });
    }

    const { id } = request.params;

    const result = await User.findByIdAndUpdate(id, request.body);

    if (!result) {
      return response.status(404).json({ message: 'User not found' });
    }

    return response.status(200).send({ message: 'User updated successfully' });
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


    const user = await User.findById(id);

    if (!user) {
      return response.status(404).json({ message: 'User not found' });
    }
// Push the new rating object to the ratedUsers array
// user.ratedUsers.push({ user, userRating });
user.comments.push({ commenter, text,color });

// Save the updated user
await user.save();

    return response.status(200).send({ message: 'User updated successfully' });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});
// Route for add user rating
router.put('/rating/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const { userId, userRating } = request.body;

    const user = await User.findById(id);

    if (!user) {
      return response.status(404).json({ message: 'User not found' });
    }

    // Push the new rating object to the ratedUsers array
    user.ratedUsers.push({ userId, userRating });

    // Calculate the new average rating
    const totalRatings = user.ratedUsers.reduce((acc, curr) => acc + curr.userRating, 0);
    const averageRating = totalRatings / user.ratedUsers.length;

    // Update the user's rating with the new average rating
    user.rating = averageRating;

    // Save the updated user
    await user.save();

    return response.status(200).send({ message: 'User updated successfully' });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});


// Route for Delete a user
router.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    const result = await User.findByIdAndDelete(id);

    if (!result) {
      return response.status(404).json({ message: 'User not found' });
    }

    return response.status(200).send({ message: 'User deleted successfully' });
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
      !request.body.password
    ) {
      return response.status(400).send({
        message: 'Send all required fields: name, email,password',
      });
    }
    
    const hashedPassword = await bcrypt.hash(request.body.password, 10);
   
    const newUser = {
      name: request.body.name,
      email: request.body.email,
      password: hashedPassword,
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
  User.findOne({email: email})
  .then(user => {
      console.log("User:", user);
      if(user) {
        bcrypt.compare (password, user.password, (err, response) => {
          if(err) 
          {
            return res.json("the password is incorrect")
          }
          else {
            const token = jwt.sign ({email: user.email}, "jwt-secret-key", {expiresIn: "1d"})
            res.cookie("token", token) ;
            console.log("Username:", user.name);
            res.json({
              message: "Success",
              username: user.name,
              token: token})
            }
          })
      }
      else{
        res.json("no record")
      }
  })
});


export default router;
