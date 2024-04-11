const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ 
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
      });
      if(validusers.length > 0){
        return true;
      } else {
        return false;
      }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
  
    if (authenticatedUser(username,password)) {
      let accessToken = jwt.sign({
        username: username,
        password: password
      }, 'access', { expiresIn: 60 * 60 });
  
      req.session.authorization = {
        accessToken,username
    }
    return res.status(200).send("User successfully logged in");
    } else {
      return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params.isbn;
    const { review } = req.query;
    const username = req.session.authorization.username;;
  // Check if the user is logged in
  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }
  // Check if there's already a review for the given ISBN
  if (!books[isbn]) {
    books[isbn] = [];
  }
  // Check if this user has already posted a review for this ISBN
  let userReview = books[isbn].find(r => r.username === username);
  if (userReview) {
    // If the review exists, update it
    userReview.review = review;
  } else {
    // If the review doesn't exist, add a new one
    books[isbn].reviews = review;
  }
  // Assuming everything went well
  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: books[isbn].reviews
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    // Extracting the ISBN number from the request parameters
    const { isbn } = req.params;
  
    // Extracting the username from the session
    const { username } = req.session.authorization.username;
  
    // Check if the book with the given ISBN exists in the 'books' object
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Check if the user has a review for this book
    if (books[isbn].reviews) {
      // Delete the review by the username
      delete books[isbn].reviews;
  
      // Responding with a success message
      return res.status(200).json({ message: "Review deleted successfully" });
    } else {
      // If the user has no review for the book
      return res.status(404).json({ message: "Review not found" });
    }
  });
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
