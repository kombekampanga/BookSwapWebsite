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

// send swap requested notification
myAccountRouter.post(
  "/notifications/swap-requested/insert",
  checkJwt,
  (req, res) => {
    const userId = req.body.userId;
    const message = req.body.message;

    const sqlInsert =
      "INSERT INTO swap_requested_notification (userId, message) VALUES (?,?)";

    db.query(sqlInsert, [userId, message], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    });
  }
);

// send swap confirmed notification
myAccountRouter.post(
  "/notifications/swap-confirmed/insert",
  checkJwt,
  (req, res) => {
    const userId = req.body.requesterId;
    const message = req.body.message;

    const sqlInsert =
      "INSERT INTO swap_requested_notification (userId, message) VALUES (?,?)";

    db.query(sqlInsert, [userId, message], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    });
  }
);

// delete swap requested notification
myAccountRouter.delete(
  "/notifications/swap-requested/delete",
  checkJwt,
  (req, res) => {
    const userId = req.body.userId;
    const notificationId = req.body.notificationId;

    const sqlDelete =
      "DELETE FROM swap_requested_notification WHERE userId = ? AND id = ?";

    db.query(sqlDelete, [userId, notificationId], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    });
  }
);

// delete swap confirmed notification
myAccountRouter.delete(
  "/notifications/swap-confirmed/delete",
  checkJwt,
  (req, res) => {
    const userId = req.body.requesterId;
    const notificationId = req.body.notificationId;

    const sqlDelete =
      "DELETE FROM swap_requested_notification WHERE userId = ? AND id = ?";

    db.query(sqlDelete, [userId, notificationId], (err, result) => {
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
    "SELECT requests.swap, requests.createdOn, requestedBook.title, requestedBook.author, requestedBook.genre, requestedBook.userEmail AS listerEmail, requestedBook.image, bookImSwapping.title AS bookImSwappingTitle, bookImSwapping.author AS bookImSwappingAuthor, bookImSwapping.genre AS bookImSwappingGenre, bookImSwapping.image AS bookImSwappingImage FROM requests JOIN books requestedBook ON requests.bookId = requestedBook.id LEFT JOIN books bookImSwapping ON requests.swappedBook = bookImSwapping.id WHERE requesterId = ? AND requests.active = TRUE";
  db.query(sqlSelect, userId, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

// Post a request
myAccountRouter.post("/my-requests/insert", checkJwt, (req, res) => {
  const bookId = req.body.bookId;
  const listerId = req.body.listerId;
  const requesterId = req.body.requesterId;
  const swap = req.body.swap;
  const requesterEmail = req.body.requesterEmail;

  const sqlInsert =
    "INSERT INTO requests (bookId, listerId, requesterId, requesterEmail, swap, active, status) VALUES (?,?,?,?,?,TRUE,'open')";

  db.query(
    sqlInsert,
    [bookId, listerId, requesterId, requesterEmail, swap],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result.insertId);
        res.send(result);
      }
    }
  );
});

// Update a request when accepted
myAccountRouter.put("/my-requests/update/accepted", checkJwt, (req, res) => {
  const requestId = req.body.requestId;
  const status = req.body.status;
  const swappedBookId = req.body.swappedBookId;
  const listerId = req.body.listerId;

  const sqlUpdate =
    "UPDATE requests SET active = false, status = ?, closedOn = CURRENT_TIMESTAMP, swappedBook = ? WHERE id = ? AND listerId = ?";

  db.query(
    sqlUpdate,
    [status, swappedBookId, requestId, listerId],
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

// Update a request when declined
myAccountRouter.put("/my-requests/update/declined", checkJwt, (req, res) => {
  const requestId = req.body.requestId;
  const status = req.body.status;
  const swappedBookId = req.body.swappedBookId;
  const listerId = req.body.listerId;

  const sqlUpdate =
    "UPDATE requests SET active = false, status = ?, closedOn = CURRENT_TIMESTAMP, swappedBook = ? WHERE id = ? AND listerId = ?";

  db.query(
    sqlUpdate,
    [status, swappedBookId, requestId, listerId],
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

// Get books others have requested from me
myAccountRouter.get("/others-requests/get", checkJwt, (req, res) => {
  const userId = req.query.userId;
  const sqlSelect =
    "SELECT requests.id AS requestId, requests.bookId, requests.swap, requests.createdOn, users.email AS requestedBy, requestedBook.title, requestedBook.author, requestedBook.genre, requestedBook.image, bookOfferedForSwapping.title AS bookOfferedForSwappingTitle, bookOfferedForSwapping.author AS bookOfferedForSwappingAuthor, bookOfferedForSwapping.genre AS bookOfferedForSwappingGenre, bookOfferedForSwapping.image AS bookOfferedForSwappingImage FROM requests JOIN books requestedBook ON requests.bookId = requestedBook.id JOIN users ON requests.requesterId = users.userId LEFT JOIN books bookOfferedForSwapping ON requests.swappedBook = bookOfferedForSwapping.id WHERE listerId = ? AND requests.active = TRUE";
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
myAccountRouter.get("/won/get", checkJwt, (req, res) => {
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
myAccountRouter.get("/lost/get", checkJwt, (req, res) => {
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

// Get specific request info for books requested from me
myAccountRouter.get("/others-requests/get/:requestId", checkJwt, (req, res) => {
  const requestId = req.params.requestId;
  const userId = req.query.userId;
  const sqlSelect = "SELECT * FROM requests WHERE listerId = ? AND id = ?";
  db.query(sqlSelect, [userId, requestId], (err, result) => {
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
