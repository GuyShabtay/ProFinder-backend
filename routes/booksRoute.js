import express from 'express';
import { Book } from '../models/bookModel.js';

import { User } from '../models/userModel.js';
import bcrypt from 'bcrypt'
import  jwt  from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const router = express.Router();
router.use(cookieParser());


// Route for Save a new Book
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

    const newBook = {
      name: request.body.name,
      email: request.body.email,
      profession: request.body.profession,
      location: request.body.location,
      phone: request.body.phone,
    };

    const book = await Book.create(newBook);

    // Update the user's books array with the newly created book's ID
    const user = await User.findOneAndUpdate(
      { name: request.body.name }, // Find the user by name
      { $push: { books: book._id } }, // Add the book's ID to the books array
      { new: true }
    );

    return response.status(201).send({ book, user });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});


// Route for Get All Books from database
router.get('/', async (request, response) => {
  try {
    const { q, option } = request.query;

    let query = {};

    if (q && option) {
      query[option] = { $regex: q, $options: 'i' };
    }

    const books = await Book.find(query);

    return response.status(200).json({
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});


// Route for Get One Book from database by id
router.get('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    const book = await Book.findById(id);

    return response.status(200).json(book);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for Update a Book
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

    const result = await Book.findByIdAndUpdate(id, request.body);

    if (!result) {
      return response.status(404).json({ message: 'Book not found' });
    }

    return response.status(200).send({ message: 'Book updated successfully' });
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


    const book = await Book.findById(id);

    if (!book) {
      return response.status(404).json({ message: 'Book not found' });
    }
// Push the new rating object to the ratedUsers array
// book.ratedUsers.push({ user, userRating });
book.comments.push({ commenter, text,color });

// Save the updated book
await book.save();

    return response.status(200).send({ message: 'Book updated successfully' });
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

    const book = await Book.findById(id);

    if (!book) {
      return response.status(404).json({ message: 'Book not found' });
    }

    // Push the new rating object to the ratedUsers array
    book.ratedUsers.push({ user, userRating });

    // Calculate the new average rating
    const totalRatings = book.ratedUsers.reduce((acc, curr) => acc + curr.userRating, 0);
    const averageRating = totalRatings / book.ratedUsers.length;

    // Update the book's rating with the new average rating
    book.rating = averageRating;

    // Save the updated book
    await book.save();

    return response.status(200).send({ message: 'Book updated successfully' });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});


// Route for Delete a book
router.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    const result = await Book.findByIdAndDelete(id);

    if (!result) {
      return response.status(404).json({ message: 'Book not found' });
    }

    return response.status(200).send({ message: 'Book deleted successfully' });
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
      !request.body.phone ||
      !request.body.password||
      !request.body.color
    ) {
      return response.status(400).send({
        message: 'Send all required fields: name, email, phone,password,color',
      });
    }
    
    const hashedPassword = await bcrypt.hash(request.body.password, 10);
   
    const newUser = {
      name: request.body.name,
      email: request.body.email,
      phone: request.body.phone,
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
router.post("/users1", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

   
        console.log("Username:", user.name);
        res.json(user);
     
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.get('/user', async (request, response) => {
  try {
    const { email } = request.query;

    const user = await User.findOne({ email: email });

    if (!user) {
      return response.status(404).json({ message: "User not found" });
    }

    return response.status(200).json({
      data: user,
    });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});




export default router;
