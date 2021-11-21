const express = require("express");
const { checkJwt } = require("../authz/check-jwt");

const usersRouter = express.Router();

const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: process.env.SQL_PASS,
  database: "bookswap",
});

// Get all users

usersRouter.get("/get", (req, res) => {
  res.status(200).send("See BookSwap users here");
  //   const sqlSelect = "SELECT * FROM books";
  //   db.query(sqlSelect, (err, result) => {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       res.send(result);
  //     }
  //   });
});

// Add a user (if they dont already exist)
usersRouter.post("/insert", checkJwt, (req, res) => {
  const userId = req.body.userId;
  const userEmail = req.body.userEmail;

  const sqlInsert = "INSERT IGNORE INTO users (userId, email) VALUES (?,?)";
  db.query(sqlInsert, [userId, userEmail], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

// Delete a user

// listingsRouter.delete("/my-listings/delete/:bookId", checkJwt, (req, res) => {
//   console.log(req.params);
//   const bookId = req.params.bookId;
//   const sqlDelete = "DELETE FROM books Where id = ?";

//   db.query(sqlDelete, bookId, (err, result) => {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log(result);
//       res.send(result);
//     }
//   });
// });

// Update a user
// listingsRouter.put("/my-listings/update/", checkJwt, (req, res) => {
//   console.log(req.body);
//   const bookId = req.body.bookId;
//   const bookTitle = req.body.bookTitle;
//   const bookAuthor = req.body.bookAuthor;
//   const bookGenre = req.body.bookGenre;

//   const sqlUpdate =
//     "UPDATE books SET title = ?, author = ?, genre = ? WHERE id = ?";

//   db.query(
//     sqlUpdate,
//     [bookTitle, bookAuthor, bookGenre, bookId],
//     (err, result) => {
//       if (err) {
//         console.log(err);
//       } else {
//         console.log(result);
//         res.send(result);
//       }
//     }
//   );
// });

module.exports = {
  usersRouter,
};
