import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Axios from "axios";
const qs = require("qs");

const Listings = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const userId = user.sub.split("|")[1];
  const serverUrl = process.env.REACT_APP_SERVER_URL;
  const [bookList, setBookList] = useState([]);
  const [genreList, setGenreList] = useState([]);
  const [filteredBookList, setFilteredBookList] = useState([]);
  const [allBooksList, setAllBooksList] = useState([]);

  const getGenres = async () => {
    const token = await getAccessTokenSilently();

    Axios.get(serverUrl + "/api/listings/genres/get", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        setGenreList(response.data);
      })
      .catch((err) => {
        console.log(err.response);
        alert(err.response.data);
      });
  };

  useEffect(() => {
    Axios.get(serverUrl + "/api/listings/get").then((response) => {
      setBookList(response.data);
      setAllBooksList(response.data);
    });
    getGenres();
  }, []);

  function filterFunction() {
    const input = document.getElementById("myInput");
    const filter = input.value.toUpperCase();
    const div = document.getElementById("myDropdown");
    let a = div.getElementsByTagName("span");
    for (let i = 0; i < a.length; i++) {
      const txtValue = a[i].textContent || a[i].innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        a[i].style.display = "";
      } else {
        a[i].style.display = "none";
      }
    }
  }

  function myFunction() {
    const currentDisplay = document.getElementById("myDropdown").style.display;

    if (currentDisplay == "none") {
      document.getElementById("myDropdown").style.display = "inline";
    } else {
      document.getElementById("myDropdown").style.display = "none";
    }
  }

  const filterByGenres = () => {
    const genres = Array.from(
      document.querySelectorAll('input[type="checkbox"]')
    )
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);

    console.log(genres);
    if (genres.length > 0) {
      // find books with those genres
      Axios.get(serverUrl + "/api/listings/filtered/get", {
        params: {
          genres: [genres],
        },
        paramsSerializer: (params) => {
          return qs.stringify(params);
        },

        // then update the booklist
      }).then((response) => {
        setFilteredBookList(response.data);
        setBookList(response.data);
      });
    } else {
      setBookList(allBooksList);
    }
  };

  return (
    <div className="allListings">
      {/* {JSON.stringify(user, null, 2)} */}
      <span>
        <input
          style={{
            border: "3px solid #555",
            borderRadius: "5px",
            marginRight: "10px",
            padding: "12px 20px",
          }}
          type="search"
          placeholder="Search.."
          id="searchForBook"
          onKeyUp={(e) => {
            console.log("hello");
          }}
        />
        <div className="dropdown">
          <button
            onClick={(e) => {
              myFunction();
            }}
            className="dropbtn"
          >
            Search by genre
          </button>
          <div
            style={{
              overflow: "scroll",
              maxHeight: "500px",
            }}
            id="myDropdown"
            className="dropdown-content"
          >
            <input
              type="text"
              placeholder="Search.."
              id="myInput"
              onKeyUp={(e) => {
                filterFunction();
              }}
            />
            {genreList.map((val) => {
              return (
                <span>
                  <input
                    style={{ width: "20px", height: "20px" }}
                    type="checkbox"
                    id={val.genre}
                    name={val.genre}
                    value={val.genre}
                    onClick={(e) => {
                      filterByGenres();
                    }}
                  />
                  <label htmlFor={val.genre}>{val.genre}</label>
                  <br></br>
                </span>
              );
            })}
          </div>
        </div>
      </span>
      {bookList.map((val) => {
        return (
          <div className="card">
            <h1>{val.title}</h1>
            {val.image === "" ? (
              <img
                src="https://res.cloudinary.com/dmxlueraz/image/upload/v1637478934/missing-picture-page-for-website_dmujoj.jpg"
                alt="No Image"
              />
            ) : (
              <img src={val.image} alt="Listing Image" />
            )}
            <h4>By {val.author}</h4>
            {val.genres !== null && (
              <h5> {val.genres.replaceAll(",", ", ")}</h5>
            )}
            <p>Listed by {val.userEmail}</p>
            <h4>Description:</h4>
            {val.description === null ? (
              <p>No description</p>
            ) : (
              <p>{val.description}</p>
            )}

            {!!val.swap && <h4>Available for swap</h4>}
            {!!val.giveAway && <h4>Available for free (no swap)</h4>}
            {val.userId !== userId && (
              <button
                id="requestThisBook"
                onClick={() => {
                  window.open(
                    "http://localhost:4040/request-a-book?bookId=" + val.id,
                    "_self"
                  );
                }}
              >
                Request This Book
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Listings;
