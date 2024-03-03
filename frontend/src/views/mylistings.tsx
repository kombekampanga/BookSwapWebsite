import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Axios from "axios";
import Modal from "react-modal";
import "./editListingModal.css";
import { BookDto } from "../models/BookDto";


Modal.setAppElement("#root");

const MyListings = () => {
  const { user, getAccessTokenSilently } = useAuth0();
    const serverUrl = process.env.REACT_APP_SERVER_URL;
    const userId = user?.sub?.split("|")[1];

    const [bookList, setBookList] = useState<BookDto[]>([]);
    const [editIsOpen, setEditIsOpen] = useState(false);

    const [selectedBook, setSelectedBook] = useState<BookDto>();

    const [updatedBookTitle, setUpdatedBookTitle] = useState("");
    const [updatedBookAuthor, setUpdatedBookAuthor] = useState("");
    const [updatedBookGenre, setUpdatedBookGenre] = useState("");

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

    const deleteListing = async (bookId: number) => {
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
          setSelectedBook(undefined);
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
      setUpdatedBookGenre(val.genre);
    };

    const updateListing = async (bookId) => {
      const token = await getAccessTokenSilently();
      console.log(bookId);
      Axios.put(
        serverUrl + "/api/listings/my-listings/update",
        {
          userId: userId,
          bookId: bookId,
          bookTitle: updatedBookTitle,
          bookAuthor: updatedBookAuthor,
          bookGenre: updatedBookGenre,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then(() => {
          alert(updatedBookTitle + " listing updated");
          setUpdatedBookTitle("");
          setUpdatedBookAuthor("");
          setUpdatedBookGenre("");
          setEditIsOpen(false);
          setSelectedBook(undefined);
          window.location.reload();
        })
        .catch((err) => {
          console.log(err.response);
          alert(err.response.data);
        });
    };

    return (
      <div className="myListings">
        {bookList.map((val) => {
          return (
            <div className="card">
              <h1>{val.title}</h1>
              <h4>By {val.author}</h4>
              <p>{val.genres}</p>

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

        {editIsOpen && (
          <div className="modalBackground">
            <Modal
              isOpen={editIsOpen}
              contentLabel="My dialog"
              className="mymodal"
              overlayClassName="myoverlay"
            >
              <div className="xModalBtn">
                <button
                  onClick={() => {
                    setEditIsOpen(false);
                    setSelectedBook(undefined);
                  }}
                >
                  X
                </button>
              </div>

              <div className="modalTitle">
                <h1>Edit Your Listing</h1>
              </div>
              <div className="modalBody">
                <label>Title:</label>
                <input
                  type="text"
                  name="Title"
                  defaultValue={selectedBook?.title}
                  onChange={(e) => {
                    setUpdatedBookTitle(e.target.value);
                  }}
                />
                <label>Author:</label>
                <input
                  type="text"
                  name="Author"
                  defaultValue={selectedBook?.author}
                  onChange={(e) => {
                    setUpdatedBookAuthor(e.target.value);
                  }}
                />
                <label>Genre:</label>
                <input
                  type="text"
                  name="Genre"
                  defaultValue={selectedBook?.genres}
                  onChange={(e) => {
                    setUpdatedBookGenre(e.target.value);
                  }}
                />
              </div>
              <div className="modalFooter">
                <button
                  onClick={() => {
                    setEditIsOpen(false);
                    setSelectedBook(undefined);
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    updateListing(selectedBook?.id);
                  }}
                >
                  Save
                </button>
                <button
                  id="deleteBtn"
                  onClick={() => {
                    const deleteConfirmed = window.confirm(
                      "Are you sure you want to delete this listing for " +
                        selectedBook?.title +
                        "?"
                    );
                    if (deleteConfirmed && selectedBook?.id !== undefined) {
                      console.log("Confirmed deletion");
                      deleteListing(selectedBook?.id);
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
      </div>
    );

};

export {MyListings};
