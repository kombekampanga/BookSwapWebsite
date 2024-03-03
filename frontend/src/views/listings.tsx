import React, { useState, useEffect } from "react";
import Axios from "axios";
import { BookDto } from "../models/BookDto";

const Listings = () => {
  const serverUrl = process.env.REACT_APP_SERVER_URL;
  const [bookList, setBookList] = useState<BookDto[]>([]);

  useEffect(() => {
    Axios.get(serverUrl + "/api/listings/get").then((response) => {
      setBookList(response.data);
    });
  }, [serverUrl]);

  return (
    <div>
      {/* {JSON.stringify(user, null, 2)} */}
      {bookList.map((val) => {
        return (
          <div className="card">
            <h1>{val.title}</h1>
            <h4>By {val.author}</h4>
            <h5>{val.genres}</h5>
            <p>Listed by {val.userEmail}</p>
          </div>
        );
      })}
    </div>
  );
};

export {Listings};
