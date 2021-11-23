const express = require("express");
const { checkJwt } = require("../authz/check-jwt");

const myAccountRouter = express.Router();

const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: process.env.SQL_PASS,
  database: "bookswap",
});

// Get my notifications
myAccountRouter.get(
  "/notifications/swap-confirmed/get",
  checkJwt,
  (req, res) => {
    const userId = req.query.userId;
    const sqlSelect =
      "SELECT * FROM swap_confirmed_notification WHERE userId = ?";
    db.query(sqlSelect, userId, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    });
  }
);

myAccountRouter.get(
  "/notifications/swap-requested/get",
  checkJwt,
  (req, res) => {
    const userId = req.query.userId;
    const sqlSelect =
      "SELECT * FROM swap_requested_notification WHERE userId = ?";
    db.query(sqlSelect, userId, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    });
  }
);

// Get books i've requested
myAccountRouter.get("/my-requests/get", checkJwt, (req, res) => {
  const userId = req.query.userId;
  const sqlSelect =
    "SELECT requests.swap, requests.giveAway, requests.createdOn, requestedBook.title, requestedBook.author, requestedBook.genre, requestedBook.userEmail AS listerEmail, requestedBook.image, bookImSwapping.title AS bookImSwappingTitle, bookImSwapping.author AS bookImSwappingAuthor, bookImSwapping.genre AS bookImSwappingGenre, bookImSwapping.image AS bookImSwappingImage FROM requests JOIN books requestedBook ON requests.bookId = requestedBook.id LEFT JOIN books bookImSwapping ON requests.swappedBook = bookImSwapping.id WHERE requesterId = ? AND requests.active = TRUE";
  db.query(sqlSelect, userId, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

// Get books others have requested from me
myAccountRouter.get("/others-requests/get", checkJwt, (req, res) => {
  const userId = req.query.userId;
  const sqlSelect =
    "SELECT requests.swap, requests.giveAway, requests.createdOn, users.email AS requestedBy, requestedBook.title, requestedBook.author, requestedBook.genre, requestedBook.image, bookOfferedForSwapping.title AS bookOfferedForSwappingTitle, bookOfferedForSwapping.author AS bookOfferedForSwappingAuthor, bookOfferedForSwapping.genre AS bookOfferedForSwappingGenre, bookOfferedForSwapping.image AS bookOfferedForSwappingImage FROM requests JOIN books requestedBook ON requests.bookId = requestedBook.id JOIN users ON requests.requesterId = users.userId LEFT JOIN books bookOfferedForSwapping ON requests.swappedBook = bookOfferedForSwapping.id WHERE listerId = ? AND requests.active = TRUE";
  db.query(sqlSelect, userId, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

// Get closed listings
myAccountRouter.get("/closed-listings/get", checkJwt, (req, res) => {
  const userId = req.query.userId;
  const sqlSelect = "SELECT * FROM books WHERE userId = ? AND active = false";
  db.query(sqlSelect, userId, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

// Get books i've won
myAccountRouter.get("/my-account/won/get", checkJwt, (req, res) => {
  const userId = req.query.userId;
  const sqlSelect = "SELECT * FROM books WHERE userId = ? AND active = false";
  db.query(sqlSelect, userId, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

// Get books i've lost
myAccountRouter.get("/my-account/lost/get", checkJwt, (req, res) => {
  const userId = req.query.userId;
  const sqlSelect = "SELECT * FROM books WHERE userId = ? AND active = false";
  db.query(sqlSelect, userId, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

module.exports = {
  myAccountRouter,
};
