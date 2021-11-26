import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Axios from "axios";
import Modal from "react-modal";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import "./editListingModal.css";
import emailjs from "emailjs-com";

const RespondToBookRequest = () => {
  const requestedBookId = window.location.search.split("?")[1].split("=")[1];
  const requestId = window.location.search.split("?")[2].split("=")[1];

  const { user, getAccessTokenSilently } = useAuth0();
  const { name, picture, email } = user;
  const userId = user.sub.split("|")[1];
  let optionNo = 0;
  let swapSelectionId = "option" + optionNo;
  const serverUrl = process.env.REACT_APP_SERVER_URL;

  const [requestedBook, setRequestedBook] = useState({});
  const [requestInfo, setRequestInfo] = useState({});
  const [bookList, setBookList] = useState([]);
  const [wantToSwap, setWantToSwap] = useState(false);
  const [giveAway, setGiveAway] = useState(false);
  const [confirmSubmitIsOpen, setConfirmSubmitIsOpen] = useState(false);
  const [onlyAvailableToSwap, setOnlyAvailableToSwap] = useState(false);
  const [onlyAvailableToGiveAway, setOnlyAvailableToGiveAway] = useState(false);
  const [onlyRequestingToSwap, setOnlyRequestingToSwap] = useState(false);
  const [onlyRequestingGiveAway, setOnlyRequestingGiveAway] = useState(false);
  const [bookToSwap, setBookToSwap] = useState({});
  const [bookToSwapChosen, setBookToSwapChosen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getRequestedBook = async () => {
    Axios.get(serverUrl + `/api/listings/get/bookId=${requestedBookId}`, {
      bookId: requestedBookId,
    })
      .then((response) => {
        console.log(response.data);
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
          setGiveAway(true);
        }
      })
      .catch((err) => {
        console.log(err.response);
        alert(err.response.data);
      });
  };

  const getRequestInfo = async () => {
    const token = await getAccessTokenSilently();

    // Get request record
    Axios.get(serverUrl + `/api/my-account/others-requests/get/${requestId}`, {
      params: { userId: userId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log(response.data);
        setRequestInfo(response.data[0]);

        // Get requesters listings
        Axios.get(
          serverUrl +
            `/api/listings/get/userId=${response.data[0].requesterId}`,
          {}
        ).then((response) => {
          console.log(response.data);
          setBookList(response.data);
        });
      })
      .catch((err) => {
        console.log(err.response);
        alert(err.response.data);
      });
  };

  const tickBookToSwap = (swapSelectionId) => {
    // if deselecting
    if (document.getElementById(swapSelectionId).checked === false) {
      setBookToSwap({});
      setBookToSwapChosen(false);
    } else {
      for (var i = 1; i <= bookList.length; i++) {
        document.getElementById("option" + i).checked = false;
      }
      document.getElementById(swapSelectionId).checked = true;
      setBookToSwapChosen(true);
    }
  };

  const acceptRequest = async () => {
    const token = await getAccessTokenSilently();
    const status = wantToSwap ? "swapped" : "given away";

    const updateRequest = Axios.put(
      serverUrl + "/api/my-account/my-requests/update/accepted",
      {
        requestId: requestId,
        status: status,
        swappedBookId: bookToSwap.id,
        listerId: userId,
        bookId: requestedBookId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const makeListingInactive = Axios.put(
      serverUrl + "/api/listings/my-listings/update/request-approved",
      {
        userId: userId,
        bookId: requestedBookId,
        status: status,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Send notification to requester
    const sendNotification = Axios.post(
      serverUrl + "/api/my-account/notifications/swap-confirmed/insert",
      {
        requesterId: requestInfo.requesterId,
        message:
          "Woohoo! Your request for " +
          requestedBook.title +
          " has been accepted! Please email " +
          requestedBook.userEmail +
          " to get your book :D",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    Axios.all([updateRequest, makeListingInactive, sendNotification])
      .then(
        Axios.spread(
          (requestResponse, inactiveResponse, notificationResponse) => {
            console.log({
              requestResponse,
              inactiveResponse,
              notificationResponse,
            });

            // if a book was swapped then make the swapped book inactive too
            if (wantToSwap) {
              Axios.put(
                serverUrl + "/api/listings/my-listings/update/request-approved",
                {
                  userId: bookToSwap.userId,
                  bookId: bookToSwap.id,
                  status: status,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
            }

            setSubmitting(false);
            alert("Book request accepted");
            window.open("http://localhost:4040/myaccount", "_self");
          }
        )
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
        "template_p97f7y7",
        {
          userEmail: requestInfo.requesterEmail,
          bookTitle: requestedBook.Title,
          listerEmail: requestedBook.userEmail,
          message: `Your request for ${requestedBook.Title} has been accepted! View your request`,
          listerContactMessage: `Please contact ${requestedBook.userEmail} to organise the swap.`,
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

  const declineRequest = async () => {
    const token = await getAccessTokenSilently();

    emailjs.send("service_39oqr2j", "template_p97f7y7", {
      subject: "declined",
      userEmail: requestInfo.requesterEmail,
      message: `Your request for ${requestedBook.Title} has been declined. View your request`,
      listerContactMessage: "",
    });

    // update request
    const updateRequest = Axios.put(
      serverUrl + "/api/my-account/my-requests/update/declined",
      {
        requestId: requestId,
        status: "closed",
        swappedBookId: bookToSwap.id,
        listerId: userId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Send notification to requester
    const sendNotification = Axios.post(
      serverUrl + "/api/my-account/notifications/swap-confirmed/insert",
      {
        requesterId: requestInfo.requesterId,
        message: "Your request for " + requestedBook.title + " was declined :(",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    Axios.all([updateRequest, sendNotification])
      .then(
        Axios.spread(
          (requestResponse, inactiveResponse, notificationResponse) => {
            console.log({
              requestResponse,
              inactiveResponse,
              notificationResponse,
            });
            setSubmitting(false);
            alert("Book request declined");
            window.open("http://localhost:4040/myaccount", "_self");
          }
        )
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
        "template_p97f7y7",
        {
          subject: "approved",
          userEmail: requestInfo.requesterEmail,
          message: `Woohoo! Your request for ${requestedBook.Title} has been accepted! View your request`,
          listerContactMessage: `Please contact ${requestedBook.userEmail} to arrange the swap.`,
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
    getRequestInfo();
    getRequestedBook();
  }, []);

  return (
    <div className="requestAbook">
      <h1>Respond to Book Request</h1>
      <div className="card">
        <h2>Book requested:</h2>
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
      </div>
      <br />
      <br />

      {onlyAvailableToGiveAway === false && onlyAvailableToSwap === false && (
        <h1>Please choose an option for trade</h1>
      )}

      {onlyAvailableToGiveAway === false && !!requestedBook.giveAway === true && (
        <div>
          <FormControlLabel
            control={
              <Checkbox
                id="giveAway"
                color="primary"
                checked={giveAway}
                onChange={() => {
                  setGiveAway(!giveAway);
                  if (!onlyAvailableToGiveAway) {
                    document.getElementById("wantToSwap").checked = false;
                    setWantToSwap(false);
                  }
                }}
                name="giveAway"
              />
            }
            label="Give this book away for free (no swap)"
          />
        </div>
      )}
      {onlyAvailableToSwap === false && !!requestedBook.swap === true && (
        <div>
          <FormControlLabel
            control={
              <Checkbox
                id="wantToSwap"
                color="primary"
                checked={wantToSwap}
                onChange={() => {
                  setWantToSwap(!wantToSwap);
                  if (!onlyAvailableToSwap) {
                    document.getElementById("giveAway").checked = false;
                    setGiveAway(false);
                  }
                }}
                name="wantToSwap"
              />
            }
            label="I want to offer a swap for this book"
          />
        </div>
      )}
      <br />
      {giveAway && <h1>Giving this book away for free</h1>}
      <br />
      {wantToSwap && <h1>Select a book you want for the swap</h1>}

      {wantToSwap &&
        bookList.map((val, index) => {
          return (
            <div className="card">
              <div className="selectBookToSwap">
                <input
                  type="checkbox"
                  id={"option" + (index + 1)}
                  onChange={() => {
                    tickBookToSwap("option" + (index + 1));
                    setBookToSwap(val);
                  }}
                  name="availableToGiveAway"
                />
              </div>
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
      <div className="requestFooter">
        <button
          onClick={() => {
            //if no book to swap is chosen and a book to swap is required then alert them
            if (!bookToSwapChosen && (wantToSwap || onlyAvailableToSwap)) {
              alert("Please select a book to swap");
            } else if (!giveAway && !wantToSwap) {
              alert(
                "Please select if you want to give the book away for free or if you require a swap"
              );
            } else {
              const status = wantToSwap ? "swapped" : "given away";
              console.log(status);
              setConfirmSubmitIsOpen(true);
            }
          }}
        >
          Accept Request
        </button>
        <button
          onClick={() => {
            const declineConfirmed = window.confirm(
              "Are you sure you want to decline this request?"
            );
            if (declineConfirmed) {
              console.log("Request Declined");
              declineRequest();
            } else {
              console.log("pressed cancel");
            }
          }}
        >
          Decline Request
        </button>
      </div>
      <br />

      {/* Confirm Submit Modal */}
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
                <h2>You are swapping:</h2>
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
              </div>
              <br />
              <div>
                {giveAway && (
                  <h2>You are offering this book for free (no swap)</h2>
                )}
                {wantToSwap && (
                  <div>
                    <h2>
                      And have offered to swap your book for{" "}
                      {bookToSwap.userEmail}'s book
                    </h2>
                    <br />
                    <h3>{bookToSwap.title}</h3>
                    <h6>By {bookToSwap.author}</h6>
                    {bookToSwap.image === "" ? (
                      <img
                        src="https://res.cloudinary.com/dmxlueraz/image/upload/v1637477634/missing-picture-page-for-website_dmujoj.jpg"
                        alt="Listing Image"
                      />
                    ) : (
                      <img src={bookToSwap.image} alt="Listing Image" />
                    )}

                    <p>{bookToSwap.genre}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modalFooter">
              <button onClick={() => setConfirmSubmitIsOpen(false)}>
                Cancel
              </button>
              <button
                onClick={() => {
                  setSubmitting(true);
                  acceptRequest();
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

export default RespondToBookRequest;
