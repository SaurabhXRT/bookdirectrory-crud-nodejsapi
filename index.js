const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// MongoDB connection
mongoose.set("strictQuery", false);
mongoose.connect('mongodb://localhost:27017/book_directory', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB...");
});

//  the Book schema
const bookSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
    },
  });
const Book = mongoose.model('Book', bookSchema);

app.use(bodyParser.json());

// GET all books
app.get('/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving books' });
  }
});

// POST a new book
app.post('/books', async (req, res) => {
  try {
    const newBook = req.body;
    const book = new Book(newBook);
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ error: 'Error creating book' });
  }
});

// PUT (update) a book by ID
app.put('/books/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updatedBook = req.body;
    const updated = await Book.findByIdAndUpdate(id, updatedBook, { new: true });

    if (!updated) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: 'Error updating book' });
  }
});

// DELETE a book by ID
app.delete('/books/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Book.findByIdAndRemove(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({ message: 'Book deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Error deleting book' });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
