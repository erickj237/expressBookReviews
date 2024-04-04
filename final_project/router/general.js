const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

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

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn])
 });
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {

    const author = req.params.author;
    let allBooks = Object.values(books);
    let filtered_books = allBooks.filter(book => book.author === author);
    
    if (filtered_books.length === 0) {
        res.status(404).send("No books found for the author: " + author);
    } else {
        res.send(JSON.stringify(filtered_books,null,4));
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    let allBooks = Object.values(books);
    let filtered_books = allBooks.filter(book => book.title === title);
    
    if (filtered_books.length === 0) {
        res.status(404).send("No books found for the title: " + title);
    } else {
        res.send(JSON.stringify(filtered_books,null,4));
    }
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
