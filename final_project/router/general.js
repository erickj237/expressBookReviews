const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

const doesExist = (username)=>{
    let userswithsamename = users.filter((user)=>{
      return user.username === username
    });
    if(userswithsamename.length > 0){
      return true;
    } else {
      return false;
    }
}

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!doesExist(username)) { 
          users.push({"username":username,"password":password});
          return res.status(200).json({message: "User successfully registred."});
        } else {
          return res.status(404).json({message: "User already exists!"});    
        }
      } 
      return res.status(404).json({message: "Unable to register user. User or password are not provided."});    
});

// Get the book list available in the shop Task 10 & 1
public_users.get('/', async function (req, res) {
    try {
        const bookList = await new Promise((resolve, reject) => {
            resolve(books);
        });
        res.json(bookList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving books. Please try again." });
    }
});


// Get book details based on ISBN - Task 11 & 2
public_users.get('/isbn/:isbn', function (req, res) {
    let isbn = req.params.isbn;
    let isbnNum = parseInt(isbn);
    
    // Using Promise directly inside the route handler
    new Promise((resolve, reject) => {
        if (books[isbnNum]) {
            resolve(books[isbnNum]);
        } else {
            reject({ status: 404, message: `ISBN ${isbn} not found` });
        }
    })
    .then(
        result => res.send(result),
        error => res.status(error.status).json({message: error.message})
    );
});

  
// Get book details based on author - task 12 & 3
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    
    new Promise((resolve, reject) => {
        resolve(books);
    })
    .then((bookEntries) => Object.values(bookEntries))
    .then((booksArray) => booksArray.filter((book) => book.author === author))
    .then((filteredBooks) => res.send(filteredBooks))
    .catch((error) => res.status(500).json({ message: "An error occurred" }));
});


// Get all books based on title - task 13 and 4
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    
    new Promise((resolve, reject) => {
        resolve(books);
    })
    .then((bookEntries) => Object.values(bookEntries))
    .then((booksArray) => booksArray.filter((book) => book.title === title))
    .then((filteredBooks) => res.send(filteredBooks))
    .catch((error) => res.status(500).json({ message: "An error occurred" }));
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    let allBooks = Object.values(books);
    let book = allBooks.find(book => book.isbn === isbn);
    
    if (book) {
        res.send(book.reviews);
    } else {
        res.status(404).send("No book found for the ISBN: " + isbn);
    }

});

module.exports.general = public_users;
