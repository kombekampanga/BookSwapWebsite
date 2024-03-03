import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Axios from "axios";
import { BookDto } from "../models/BookDto";

const ListABook = () => {
  const { user, getAccessTokenSilently } = useAuth0();
    const userId = user?.sub?.split("|")[1];
    const serverUrl = process.env.REACT_APP_SERVER_URL;

    const [bookTitle, setBookTitle] = useState("");
    const [bookAuthor, setBookAuthor] = useState("");
    const [bookGenre, setBookGenre] = useState("");
    const [bookList, setBookList] = useState<BookDto[]>([]);

    useEffect(() => {
      const getMyListings = async () => {
        const token = await getAccessTokenSilently();

        Axios.get(serverUrl + "/api/listings/my-listings/get", {
          params: { userId: userId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => {
            setBookList(response.data);
          })
          .catch((err) => {
            console.log(err.response);
            alert(err.response.data);
          });
      };

      getMyListings();
    }, [getAccessTokenSilently, serverUrl, userId]);

    const addListing = async () => {
      const token = await getAccessTokenSilently();
      Axios.post(
        serverUrl + "/api/listings/my-listings/insert",
        {
          userId: userId,
          userEmail: user?.email,
          bookTitle: bookTitle,
          bookAuthor: bookAuthor,
          bookGenre: bookGenre,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then(() => {
          alert("Listing Added");
          window.location.reload();
          // Array.from(document.querySelectorAll("input")).forEach(
          //   (input) => (input.value = "")
          //);
        })
        .catch((err) => {
          console.log(err.response);
          alert(err.response.data);
        });
    };

    return (
      <div className="listabook">
        <h1>List a Book</h1>
        <div className="form">
          <label>Title:</label>
          <input
            type="text"
            name="Title"
            onChange={(e) => setBookTitle(e.target.value)}
          />
          <label>Author:</label>
          <input
            type="text"
            name="Author"
            onChange={(e) => setBookAuthor(e.target.value)}
          />
          <label>Genre:</label>
          <input
            type="text"
            name="Genre"
            onChange={(e) => setBookGenre(e.target.value)}
          />

          <button onClick={addListing}>Submit</button>

          <br />
          <br />
          <br />

          <h1>My Listings</h1>
          <br />
          {bookList.map((val) => {
            return (
              <div className="card">
                <h1>{val.title}</h1>
                <h4>By {val.author}</h4>
                <p>{val.genres}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
};

export {ListABook};
