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
  const sqlSelect = "SELECT * FROM books WHERE active = true";
  db.query(sqlSelect, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

// Get all of particular user's listings
listingsRouter.get("/get/userId=:userId", (req, res) => {
  const userId = req.params.userId;
  const sqlSelect = "SELECT * FROM books WHERE userId = ? AND active = true";
  db.query(sqlSelect, userId, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

// Get a specific book Listing
listingsRouter.get("/get/bookId=:bookId", (req, res) => {
  const bookId = req.params.bookId;
  const sqlSelect = "SELECT * FROM books WHERE id = ? AND active = true";
  db.query(sqlSelect, bookId, (err, result) => {
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
  const sqlSelect = "SELECT * FROM books WHERE userId = ? AND active = true";
  db.query(sqlSelect, userId, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

// Get listings filtered by genre
listingsRouter.get("/filtered/get", (req, res) => {
  const genres = req.query.genres[0];
  console.log(genres);
  if (genres.length > 0) {
    let sqlSelect = `SELECT * FROM books WHERE active = true AND genres LIKE '%${genres[0]}%'`;

    if (genres.length > 1) {
      // ignore the first element since it was already included
      genres.slice(1).forEach((genre) => {
        sqlSelect += ` or genres LIKE '%${genre}%'`;
      });
    }
    console.log(sqlSelect);
    db.query(sqlSelect, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        res.send(result);
      }
    });
  }
});

// Get genres
listingsRouter.get("/genres/get", checkJwt, (req, res) => {
  const sqlSelect = "SELECT * FROM genres";
  db.query(sqlSelect, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

// Add a listing
listingsRouter.post("/my-listings/insert", checkJwt, (req, res) => {
  const imageUrl = req.body.imageUrl;
  const userId = req.body.userId;
  const userEmail = req.body.userEmail;
  const bookTitle = req.body.bookTitle;
  const bookAuthor = req.body.bookAuthor;
  const bookGenres = req.body.bookGenres;
  const availableForSwap = req.body.availableForSwap;
  const availableToGiveAway = req.body.availableToGiveAway;
  const bookDescription = req.body.bookDescription;
  console.log(req.body.bookGenres);
  console.log(bookGenres);

  const sqlInsert =
    "INSERT INTO books (title, author, genres, description, userId, userEmail, image, swap, giveAway, modifiedOn, active, status) VALUES (?,?,(?),?,?,?,?,?,?,CURRENT_TIMESTAMP, TRUE, 'open')";
  db.query(
    sqlInsert,
    [
      bookTitle,
      bookAuthor,
      bookGenres,
      bookDescription,
      userId,
      userEmail,
      imageUrl,
      availableForSwap,
      availableToGiveAway,
    ],
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

// update a listing when request is approved (make inactive)
listingsRouter.put(
  "/my-listings/update/request-approved",
  checkJwt,
  (req, res) => {
    const bookId = req.body.bookId;
    const userId = req.body.userId;
    const status = req.body.status;
    const sqlUpdate =
      "UPDATE books SET active = false, closedOn = CURRENT_TIMESTAMP, status = ?  WHERE id = ? AND userId = ?";
    db.query(sqlUpdate, [status, bookId, userId], (err, result) => {
      if (err) {
        console.log("failed");
        res.send(err);
        console.log(err);
      } else {
        console.log("success");
        console.log(result);
        res.send(result);
      }
    });
  }
);

// update when a request is made (increment no of requests and set requested as true)
listingsRouter.put("/my-listings/update/request-sent", checkJwt, (req, res) => {
  const bookId = req.body.bookId;
  const userId = req.body.userId;
  const sqlUpdate =
    "UPDATE books SET numberOfRequests = numberOfRequests+1, requested = true WHERE id = ? AND userId = ?;";
  db.query(sqlUpdate, [bookId, userId], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      res.send(result);
    }
  });
});

// update a request declined (decrement no of requests and set requested as false if numberOfRequests = 0)
//TODO
listingsRouter.put(
  "/my-listings/update/request-declined",
  checkJwt,
  (req, res) => {
    const bookId = req.body.bookId;
    const userId = req.body.userId;
    const sqlUpdate =
      "UPDATE books SET requested = IF (numberOfRequests = 1, false, true), numberOfRequests = numberOfRequests-1  WHERE id = ? AND userId = ?";
    db.query(sqlUpdate, [bookId, userId, bookId, userId], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        res.send(result);
      }
    });
  }
);

// Update my listing
listingsRouter.put("/my-listings/update", checkJwt, (req, res) => {
  console.log(req.body);
  console.log(req.body.bookGenres);
  const userId = req.body.userId;
  const bookId = req.body.bookId;
  const bookTitle = req.body.bookTitle;
  const bookAuthor = req.body.bookAuthor;
  const bookGenre = req.body.bookGenres;
  const bookDescription = req.body.bookDescription;
  const bookImageUrl = req.body.bookImageUrl;
  const availableForSwap = req.body.availableForSwap;
  const availableToGiveAway = req.body.availableToGiveAway;

  const sqlUpdate =
    "UPDATE books SET title = ?, author = ?, genres = ?, description = ?, image = ?, swap = ?, giveAway = ?, modifiedOn = CURRENT_TIMESTAMP WHERE id = ? AND userId = ?";

  db.query(
    sqlUpdate,
    [
      bookTitle,
      bookAuthor,
      bookGenre,
      bookDescription,
      bookImageUrl,
      availableForSwap,
      availableToGiveAway,
      bookId,
      userId,
    ],
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
