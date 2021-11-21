const express = require("express");
const { checkJwt } = require("../authz/check-jwt");

const listingsRouter = express.Router();

const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: process.env.SQL_PASS,
  database: "bookswap",
});

// Get all Listings
listingsRouter.get("/get", (req, res) => {
  const sqlSelect = "SELECT * FROM books";
  db.query(sqlSelect, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

// Get my listings
listingsRouter.get("/my-listings/get", checkJwt, (req, res) => {
  const userId = req.query.userId;
  const sqlSelect = "SELECT * FROM books WHERE userId = ?";
  db.query(sqlSelect, userId, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

// Add a listing
listingsRouter.post("/my-listings/insert", checkJwt, (req, res) => {
  const userId = req.body.userId;
  const userEmail = req.body.userEmail;
  const bookTitle = req.body.bookTitle;
  const bookAuthor = req.body.bookAuthor;
  const bookGenre = req.body.bookGenre;

  const sqlInsert =
    "INSERT INTO books (title, author, genre, userId, userEmail) VALUES (?,?,?,?, ?)";
  db.query(
    sqlInsert,
    [bookTitle, bookAuthor, bookGenre, userId, userEmail],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

// Delete a listing to my listings
listingsRouter.delete("/my-listings/delete/", checkJwt, (req, res) => {
  //console.log(req.body);
  const bookId = req.body.bookId;
  const userId = req.body.userId;
  const sqlDelete = "DELETE FROM books WHERE id = ? AND userId = ?";
  db.query(sqlDelete, [bookId, userId], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      res.send(result);
    }
  });
});

// Update my listing
listingsRouter.put("/my-listings/update/", checkJwt, (req, res) => {
  console.log(req.body);
  const userId = req.body.userId;
  const bookId = req.body.bookId;
  const bookTitle = req.body.bookTitle;
  const bookAuthor = req.body.bookAuthor;
  const bookGenre = req.body.bookGenre;

  const sqlUpdate =
    "UPDATE books SET title = ?, author = ?, genre = ? WHERE id = ? AND userId = ?";

  db.query(
    sqlUpdate,
    [bookTitle, bookAuthor, bookGenre, bookId, userId],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        res.send(result);
      }
    }
  );
});

module.exports = {
  listingsRouter,
};
