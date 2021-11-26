import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Axios from "axios";
import Modal from "react-modal";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import "./editListingModal.css";
import emailjs from "emailjs-com";

const RequestABook = () => {
  const requestedBookId = window.location.search.split("=")[1];
  const { user, getAccessTokenSilently } = useAuth0();
  const { name, picture, email } = user;
  const userId = user.sub.split("|")[1];
  let optionNo = 0;
  let swapSelectionId = "option" + optionNo;
  const serverUrl = process.env.REACT_APP_SERVER_URL;

  const [requestedBook, setRequestedBook] = useState({});
  const [bookList, setBookList] = useState([]);
  const [wantToSwap, setWantToSwap] = useState(false);
  const [wantForFree, setWantForFree] = useState(false);
  const [confirmSubmitIsOpen, setConfirmSubmitIsOpen] = useState(false);
  const [onlyAvailableToSwap, setOnlyAvailableToSwap] = useState(false);
  const [onlyAvailableToGiveAway, setOnlyAvailableToGiveAway] = useState(false);
  const [bookToSwap, setBookToSwap] = useState({});
  const [bookToSwapChosen, setBookToSwapChosen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getRequestedBook = async () => {
    Axios.get(serverUrl + `/api/listings/get/bookId=${requestedBookId}`, {
      bookId: requestedBookId,
    })
      .then((response) => {
        setRequestedBook(response.data[0]);

        // if only offering a swap then make wantToSwap = true
        // else if only offering a swap then make wantToSwap = true
        if (
          !!response.data[0].swap === true &&
          !!response.data[0].giveAway === false
        ) {
          console.log("only availble to swap");
          setOnlyAvailableToSwap(true);
          setWantToSwap(true);
        } else if (
          !!response.data[0].giveAway === true &&
          !!response.data[0].swap === false
        ) {
          console.log("No swap requested");
          setOnlyAvailableToGiveAway(true);
          setWantForFree(true);
        }
      })
      .catch((err) => {
        console.log(err.response);
        alert(err.response.data);
      });
  };

  const submitRequest = async () => {
    console.log(user.email);
    const token = await getAccessTokenSilently();

    const createRequest = Axios.post(
      serverUrl + "/api/my-account/my-requests/insert",
      {
        bookId: requestedBookId,
        listerId: requestedBook.userId,
        requesterId: userId,
        requesterEmail: user.email,
        swap: wantToSwap,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const sendNotification = Axios.post(
      serverUrl + "/api/my-account/notifications/swap-requested/insert",
      {
        userId: requestedBook.userId,
        message: "Someone wants your book",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    Axios.all([createRequest, sendNotification])
      .then(
        Axios.spread((requestResponse, notificationResponse) => {
          console.log({ requestResponse, notificationResponse });
          setSubmitting(false);
          alert("Book requested");
          window.open("http://localhost:4040/myaccount", "_self");
        })
      )
      .catch((err) => {
        setSubmitting(false);
        console.log(err.response);
        alert(err.response.data);
        return;
      });

    //send email
    console.log("sending email");
    emailjs
      .send(
        "service_39oqr2j",
        "template_z8c1tf8",
        {
          userEmail: requestedBook.userEmail,
          bookTitle: requestedBook.Title,
          requesterEmail: user.email,
        },
        "user_YEtRXLga6A6g1bNvKKVwb"
      )
      .then(
        function (response) {
          console.log("SUCCESS!", response.status, response.text);
        },
        function (error) {
          console.log("FAILED...", error);
        }
      );
  };

  useEffect(() => {
    getRequestedBook();
  }, []);

  return (
    <div className="requestAbook">
      <h1>Request a Book</h1>
      <div className="card">
        <h2>You are requesting:</h2>
        <h3>{requestedBook.title}</h3>
        <h6>By {requestedBook.author}</h6>
        {requestedBook.image === "" ? (
          <img
            src="https://res.cloudinary.com/dmxlueraz/image/upload/v1637477634/missing-picture-page-for-website_dmujoj.jpg"
            alt="Listing Image"
          />
        ) : (
          <img src={requestedBook.image} alt="Listing Image" />
        )}

        <p>{requestedBook.genre}</p>
        <h6>Listed By: {requestedBook.userEmail}</h6>
      </div>
      <br />
      <br />

      {onlyAvailableToGiveAway === false && onlyAvailableToSwap === false && (
        <div>
          <div>
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  checked={wantToSwap}
                  onChange={() => {
                    setWantToSwap(!wantToSwap);
                  }}
                  name="wantToSwap"
                />
              }
              label="I want to offer a swap for this book"
            />
          </div>
        </div>
      )}

      <br />
      {onlyAvailableToSwap && <h2>This book is swap only</h2>}
      {!!requestedBook.giveAway && <h4>You can get this book for free</h4>}
      <br />

      {wantToSwap && (
        <>
          <h4>
            You are{" "}
            {onlyAvailableToGiveAway === false &&
              onlyAvailableToSwap === false &&
              "also "}
            offering a swap
          </h4>
          <h6>
            Your listings will be shown to {requestedBook.userEmail} for them to
            select for swap
          </h6>
        </>
      )}
      <br />

      <button
        onClick={() => {
          setConfirmSubmitIsOpen(true);
        }}
      >
        Submit
      </button>
      <br />

      {/* Submit request Modal */}
      {confirmSubmitIsOpen && (
        <div className="modalBackground">
          <Modal
            isOpen={confirmSubmitIsOpen}
            contentLabel="My dialog"
            className="mymodal"
            overlayClassName="myoverlay"
          >
            <div className="xModalBtn">
              <button onClick={() => setConfirmSubmitIsOpen(false)}>X</button>
            </div>

            <div className="modalTitle">
              <h1>Confirm your request</h1>
            </div>
            <br />
            <div className="modalBody">
              <div>
                <h2>You are requesting:</h2>
                <br />
                <h3>{requestedBook.title}</h3>
                <h6>By {requestedBook.author}</h6>
                {requestedBook.image === "" ? (
                  <img
                    src="https://res.cloudinary.com/dmxlueraz/image/upload/v1637477634/missing-picture-page-for-website_dmujoj.jpg"
                    alt="Listing Image"
                  />
                ) : (
                  <img src={requestedBook.image} alt="Listing Image" />
                )}

                <p>{requestedBook.genre}</p>
                <h6>Listed By: {requestedBook.userEmail}</h6>
              </div>
              <br />
              <div>
                {!!requestedBook.giveAway && (
                  <h3>You are requesting this book for free</h3>
                )}
                {wantToSwap && (
                  <h3>
                    You are{" "}
                    {onlyAvailableToGiveAway === false &&
                      onlyAvailableToSwap === false &&
                      "also "}
                    offering a swap
                  </h3>
                )}
                {onlyAvailableToSwap && <p>(This book is swap only)</p>}
              </div>
            </div>
            <div className="modalFooter">
              <button onClick={() => setConfirmSubmitIsOpen(false)}>
                Cancel
              </button>
              <button
                onClick={() => {
                  setSubmitting(true);
                  submitRequest();
                }}
              >
                Submit Request
              </button>
            </div>
          </Modal>
        </div>
      )}
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
    </div>
  );
};

export default RequestABook;
