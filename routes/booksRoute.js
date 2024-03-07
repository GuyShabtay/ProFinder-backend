import express from 'express';
import { Book } from '../models/bookModel.js';
import { User } from '../models/userModel.js';
import bcrypt from 'bcrypt'
import  jwt  from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const router = express.Router();
// const jwt = require('jsonwebtoken');
// const cookieParser=require('cookie-parser');

router.use(cookieParser());

// Route for Save a new Book
router.post('/', async (request, response) => {
  try {
    if (
      !request.body.name ||
      !request.body.profession ||
      !request.body.location
    ) {
      return response.status(400).send({
        message: 'Send all required fields: name, profession, location',
      });
    }
    const newBook = {
      name: request.body.name,
      profession: request.body.profession,
      location: request.body.location,
    };

    const book = await Book.create(newBook);

    return response.status(201).send(book);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for Get All Books from database
router.get('/', async (request, response) => {
  try {
    const books = await Book.find({});

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
      !request.body.name ||
      !request.body.profession ||
      !request.body.location
    ) {
      return response.status(400).send({
        message: 'Send all required fields: name, profession, location',
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
      !request.body.password
    ) {
      return response.status(400).send({
        message: 'Send all required fields: name, email, phone,password',
      });
    }
    
    const hashedPassword = await bcrypt.hash(request.body.password, 10);
   
    const newUser = {
      name: request.body.name,
      email: request.body.email,
      phone: request.body.phone,
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
