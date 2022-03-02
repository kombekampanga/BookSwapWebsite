import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Axios from "axios";
import Modal from "react-modal";
import { Checkbox, FormControlLabel } from "@material-ui/core";

const ListABook = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const { name, picture, email } = user;
  const userId = user.sub.split("|")[1];
  const serverUrl = process.env.REACT_APP_SERVER_URL;

  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookGenre, setBookGenre] = useState("");
  const [bookDescription, setBookDescription] = useState("");
  const [bookList, setBookList] = useState([]);
  const [imageSelected, setImageSelected] = useState({});
  const [newListingImageUrl, setNewListingImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [availableForSwap, setAvailableForSwap] = useState(false);
  const [availableToGiveAway, setAvailableToGiveAway] = useState(false);

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

  useEffect(() => {
    getMyListings();
  }, []);

  const addListing = async () => {
    const token = await getAccessTokenSilently();
    console.log(imageSelected.name);
    if (imageSelected.name === undefined) {
      setSubmitting(false);
      alert("Please upload a photo");
      return;
    }
    const formData = new FormData();
    formData.append("file", imageSelected);
    formData.append("upload_preset", "ju4duels");

    // Upload the image to cloudinary
    Axios.post(
      "https://api.cloudinary.com/v1_1/dmxlueraz/image/upload",
      formData
    )
      .then((response) => {
        console.log(response.data.url);
        setNewListingImageUrl(response.data.url);

        // Add to database
        Axios.post(
          serverUrl + "/api/listings/my-listings/insert",
          {
            imageUrl: response.data.url,
            userId: userId,
            userEmail: email,
            bookTitle: bookTitle,
            bookAuthor: bookAuthor,
            bookGenre: bookGenre,
            bookDescription: bookDescription,
            availableForSwap: availableForSwap,
            availableToGiveAway: availableToGiveAway,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).then(() => {
          setSubmitting(false);
          alert("Listing Added");
          window.location.reload();
          // Array.from(document.querySelectorAll("input")).forEach(
          //   (input) => (input.value = "")
          //);
        });
      })
      .catch((err) => {
        setSubmitting(false);
        console.log(err.response);
        alert(err.response.data);
        return;
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

        <label>Description:</label>
        <textarea
          className="description"
          type="text"
          name="Description"
          maxlength="1500"
          onChange={(e) => setBookDescription(e.target.value)}
        />

        <label>Upload an Image:</label>

        <input
          type="file"
          name="Picture"
          onChange={(e) => {
            if (e.target.files.length != 0) {
              setImageSelected(e.target.files[0]);
              document.getElementById("newListingImage").src =
                window.URL.createObjectURL(e.target.files[0]);
            }
          }}
        />
        <img
          id="newListingImage"
          src="https://res.cloudinary.com/dmxlueraz/image/upload/v1637477634/missing-picture-page-for-website_dmujoj.jpg"
          alt="Listing Image"
        />
        <br />

        <label>Swap/ Give away settings:</label>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              checked={availableForSwap}
              onChange={() => {
                setAvailableForSwap(!availableForSwap);
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
              checked={availableToGiveAway}
              onChange={() => {
                setAvailableToGiveAway(!availableToGiveAway);
              }}
              name="availableToGiveAway"
            />
          }
          label="Available to give away"
        />
        <br />

        <button
          onClick={() => {
            setSubmitting(true);
            addListing();
          }}
        >
          Submit
        </button>

        {/* Submitting Modal */}

        {submitting && (
          <div className="modalBackground">
            <Modal
              isOpen={submitting}
              contentLabel="My dialog"
              className="mymodal"
              overlayClassName="myoverlay"
            >
              <h1>Submitting Listing...</h1>
            </Modal>
          </div>
        )}

        <br />
        <br />
        <br />

        <h1>My Listings</h1>
        <br />
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
              <p>{val.genre}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListABook;
