import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Axios from "axios";
import Modal from "react-modal";
import "./editListingModal.css";
import { Checkbox, FormControlLabel } from "@material-ui/core";

Modal.setAppElement("#root");

const MyListings = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const serverUrl = process.env.REACT_APP_SERVER_URL;

  const userId = user.sub.split("|")[1];

  const { name, picture, email } = user;

  const [bookList, setBookList] = useState([]);
  const [editIsOpen, setEditIsOpen] = useState(false);

  const [selectedBook, setSelectedBook] = useState({});

  const [updatedBookTitle, setUpdatedBookTitle] = useState("");
  const [updatedBookAuthor, setUpdatedBookAuthor] = useState("");
  const [updatedBookGenres, setUpdatedBookGenres] = useState([]);
  const [updatedBookDescription, setUpdatedBookDescription] = useState("");
  const [updatedBookImageUrl, setUpdatedBookImageUrl] = useState("");
  const [imageHasChanged, setImageHasChanged] = useState(false);
  const [uploadedBookImage, setUploadedBookImage] = useState({});
  const [saving, setSaving] = useState(false);
  const [updatedAvailableForSwap, setUpdatedAvailableForSwap] = useState("");
  const [updatedAvailableToGiveAway, setUpdatedAvailableToGiveAway] =
    useState("");
  const [genreList, setGenreList] = useState([]);

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
    getMyListings();
    getGenres();
  }, []);

  const deleteListing = async (bookId) => {
    const token = await getAccessTokenSilently();
    console.log(bookId);
    Axios.delete(serverUrl + "/api/listings/my-listings/delete/", {
      data: { userId: userId, bookId: bookId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        setEditIsOpen(false);
        setSelectedBook({});
        alert("Listing Deleted");
        window.location.reload();
      })
      .catch((err) => {
        console.log(err.response);
        alert(err.response.data);
      });
  };

  const editEventHandler = (val) => {
    setSelectedBook(val);
    setEditIsOpen(true);
    setUpdatedBookTitle(val.title);
    setUpdatedBookAuthor(val.author);
    if (val.genres !== null) {
      setUpdatedBookGenres(val.genres.split(","));
    }
    setUpdatedBookDescription(val.description);
    setUpdatedBookImageUrl(val.image);
    setImageHasChanged(false);
    // !! to turn integer into boolean
    setUpdatedAvailableForSwap(!!val.swap);
    setUpdatedAvailableToGiveAway(!!val.giveAway);
  };

  const finishEditEventHandler = () => {
    setSelectedBook({});
    setEditIsOpen(false);
    setUpdatedBookTitle("");
    setUpdatedBookAuthor("");
    setUpdatedBookGenres([]);
    setUpdatedBookDescription("");
    setUpdatedBookImageUrl("");
    setImageHasChanged(false);
    setImageHasChanged(false);
    setUpdatedAvailableForSwap("");
    setUpdatedAvailableToGiveAway("");
  };

  const updateListing = async (bookId) => {
    const token = await getAccessTokenSilently();
    const formData = new FormData();
    formData.append("file", uploadedBookImage);
    formData.append("upload_preset", "ju4duels");

    // Add to database
    const addListingToDatabase = (imageUrl) => {
      Axios.put(
        serverUrl + "/api/listings/my-listings/update",
        {
          userId: userId,
          bookId: bookId,
          bookTitle: updatedBookTitle,
          bookAuthor: updatedBookAuthor,
          bookGenres: updatedBookGenres.toString(),
          bookDescription: updatedBookDescription,
          bookImageUrl: imageUrl,
          availableForSwap: updatedAvailableForSwap,
          availableToGiveAway: updatedAvailableToGiveAway,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then((response) => {
          setSaving(false);
          alert(updatedBookTitle + " listing updated");
          console.log(response);
          finishEditEventHandler();
          window.location.reload();
        })
        .catch((err) => {
          setSaving(false);
          console.log(err.response);
          alert(err.response.data);
        });
    };

    // If new image has been added, upload the image to cloudinary
    if (imageHasChanged) {
      Axios.post(
        "https://api.cloudinary.com/v1_1/dmxlueraz/image/upload",
        formData
      )
        .then((response) => {
          console.log(response.data.url);
          setUpdatedBookImageUrl(response.data.url);
          addListingToDatabase(response.data.url);
        })
        .catch((err) => {
          setSaving(false);
          console.log(err.response);
          alert(err.response.data);
          return;
        });
    } else {
      addListingToDatabase(updatedBookImageUrl);
    }
  };

  const addSelectedGenres = () => {
    const genres = Array.from(
      document.querySelectorAll('input[type="checkbox"]')
    )
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value)
      .filter(Boolean);
    //Boolean removes trailing empty array values that seem to pop up

    setUpdatedBookGenres(genres);
  };

  function myFunction() {
    const currentDisplay = document.getElementById("myDropdown").style.display;

    if (currentDisplay == "none") {
      document.getElementById("myDropdown").style.display = "inline";
    } else {
      document.getElementById("myDropdown").style.display = "none";
    }
  }

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

  return (
    <div className="myListings">
      {bookList.map((val) => {
        return (
          <div className="card">
            <h1>{val.title}</h1>
            {val.image === "" ? (
              <img
                src="https://res.cloudinary.com/dmxlueraz/image/upload/v1637477634/missing-picture-page-for-website_dmujoj.jpg"
                alt="Listing Image"
              />
            ) : (
              <img src={val.image} alt="Listing Image" />
            )}

            <h4>By {val.author}</h4>
            {val.genres !== null && <p> {val.genres.replaceAll(",", ", ")}</p>}
            <h4>Description:</h4>
            <p>{val.description}</p>
            {!!val.swap && <h4>Available for swap</h4>}
            {!!val.giveAway && <h4>Available for free (no swap)</h4>}

            <div id="editListing">
              <button
                onClick={() => {
                  editEventHandler(val);
                }}
              >
                Edit
              </button>
              <button
                onClick={() => {
                  const deleteConfirmed = window.confirm(
                    "Are you sure you want to delete this listing for " +
                      val.title +
                      "?"
                  );
                  if (deleteConfirmed) {
                    console.log("Confirmed deletion");
                    deleteListing(val.id);
                  } else {
                    console.log("pressed cancel");
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}

      {/* Edit Listing Modal */}
      {editIsOpen && (
        <div className="modalBackground">
          <Modal
            isOpen={editIsOpen}
            contentLabel="My dialog"
            className="mymodal"
            overlayClassName="myoverlay"
          >
            <div className="xModalBtn">
              <button onClick={() => finishEditEventHandler()}>X</button>
            </div>

            <div className="modalTitle">
              <h1>Edit Your Listing</h1>
            </div>
            <div className="modalBody">
              <div>
                <label>Title:</label>
                <input
                  type="text"
                  name="Title"
                  defaultValue={selectedBook.title}
                  onChange={(e) => {
                    setUpdatedBookTitle(e.target.value);
                  }}
                />
              </div>
              <div>
                <label>Image:</label>
                {selectedBook.image === "" ? (
                  <img
                    id="editListingImage"
                    src="https://res.cloudinary.com/dmxlueraz/image/upload/v1637477634/missing-picture-page-for-website_dmujoj.jpg"
                    alt="Listing Image"
                  />
                ) : (
                  <img
                    id="editListingImage"
                    src={selectedBook.image}
                    alt="Listing Image"
                  />
                )}
                <label>Upload New Image:</label>
                <input
                  accept="image/*"
                  type="file"
                  name="Picture"
                  onChange={(e) => {
                    document.getElementById("editListingImage").src =
                      window.URL.createObjectURL(e.target.files[0]);
                    setUploadedBookImage(e.target.files[0]);
                    setImageHasChanged(true);
                    console.log(e.target.files[0]);
                  }}
                />
              </div>
              <div>
                <label>Author:</label>
                <input
                  type="text"
                  name="Author"
                  defaultValue={selectedBook.author}
                  onChange={(e) => {
                    setUpdatedBookAuthor(e.target.value);
                  }}
                />
              </div>
              <div>
                <label>Genres:</label>
                <ul style={{ textAlign: "left" }}>
                  {updatedBookGenres.map((val) => {
                    return (
                      <span>
                        <li>{val}</li>
                      </span>
                    );
                  })}
                </ul>
                <div className="dropdown">
                  <button
                    onClick={(e) => {
                      myFunction();
                    }}
                    className="dropbtn"
                  >
                    Search genres
                  </button>
                </div>
                <div
                  style={{
                    position: "relative",
                    display: "none",
                    overflow: "scroll",
                    maxHeight: "300px",
                  }}
                  id="myDropdown"
                  className="dropdown-content"
                  size="4"
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
                            addSelectedGenres();
                          }}
                        />
                        <label htmlFor={val.genre}>{val.genre}</label>
                        <br></br>
                      </span>
                    );
                  })}
                </div>
                {/* <label>Genre:</label>
                <input
                  type="text"
                  name="Genre"
                  defaultValue={selectedBook.genre}
                  onChange={(e) => {
                    setUpdatedBookGenres(e.target.value);
                  }}
                /> */}
              </div>
              <div>
                <label>Description:</label>
                <textarea
                  className="description"
                  type="text"
                  name="Description"
                  defaultValue={selectedBook.description}
                  maxlength="1500"
                  onChange={(e) => {
                    setUpdatedBookDescription(e.target.value);
                  }}
                />
              </div>
              <div>
                <label>Swap/ Give away settings:</label>
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      checked={updatedAvailableForSwap}
                      onChange={() => {
                        setUpdatedAvailableForSwap(!updatedAvailableForSwap);
                      }}
                      name="availableForSwap"
                    />
                  }
                  label="Available for swap"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      checked={updatedAvailableToGiveAway}
                      onChange={() => {
                        setUpdatedAvailableToGiveAway(
                          !updatedAvailableToGiveAway
                        );
                      }}
                      name="availableToGiveAway"
                    />
                  }
                  label="Available to give away"
                />
              </div>
            </div>
            <div className="modalFooter">
              <button onClick={() => finishEditEventHandler()}>Cancel</button>
              <button
                onClick={() => {
                  if (
                    updatedAvailableForSwap === false &&
                    updatedAvailableToGiveAway === false
                  ) {
                    alert(
                      "Please select whether the book is available for swap and/ or free give away"
                    );
                  } else {
                    setSaving(true);
                    updateListing(selectedBook.id);
                  }
                }}
              >
                Save
              </button>
              <button
                id="deleteBtn"
                onClick={() => {
                  const deleteConfirmed = window.confirm(
                    "Are you sure you want to delete this listing for " +
                      selectedBook.title +
                      "?"
                  );
                  if (deleteConfirmed) {
                    console.log("Confirmed deletion");
                    deleteListing(selectedBook.id);
                  } else {
                    console.log("pressed cancel");
                  }
                }}
              >
                Delete Listing
              </button>
            </div>
          </Modal>
        </div>
      )}

      {/* Saving Modal */}
      {saving && (
        <div className="modalBackground">
          <Modal
            isOpen={saving}
            contentLabel="My dialog"
            className="mymodal"
            overlayClassName="myoverlay"
          >
            <h1>Saving...</h1>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default MyListings;
