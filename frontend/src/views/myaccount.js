import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Axios from "axios";

const MyAccount = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const userId = user.sub.split("|")[1];

  const serverUrl = process.env.REACT_APP_SERVER_URL;
  const [swapConfirmedNotificationsList, setSwapConfirmedNotificationsList] =
    useState([]);
  const [swapRequestedNotificationsList, setSwapRequestedNotificationsList] =
    useState([]);
  const [booksIRequestedList, setBooksIRequestedList] = useState([]);
  const [booksOthersRequestedList, setBooksOthersRequestedList] = useState([]);
  const [closedListings, setClosedListings] = useState([]);
  const [wonBooks, setWonBooks] = useState([]);
  const [lostBooks, setLostBooks] = useState([]);

  //console.log(user);

  const getMyAccountDetails = async () => {
    const token = await getAccessTokenSilently();

    // Populate notifications
    Axios.get(serverUrl + "/api/my-account/notifications/swap-confirmed/get", {
      params: { userId: userId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log(response.data);
        setSwapConfirmedNotificationsList(response.data);
      })
      .catch((err) => {
        console.log(err.response);
        alert(err.response.data);
      });

    Axios.get(serverUrl + "/api/my-account/notifications/swap-requested/get", {
      params: { userId: userId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log(response.data);
        setSwapRequestedNotificationsList(response.data);
      })
      .catch((err) => {
        console.log(err.response);
        alert(err.response.data);
      });

    // Populate books I've requested
    Axios.get(serverUrl + "/api/my-account/my-requests/get", {
      params: { userId: userId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log(response.data);
        setBooksIRequestedList(response.data);
      })
      .catch((err) => {
        console.log(err.response);
        alert(err.response.data);
      });

    // Populate books others have requested from me
    Axios.get(serverUrl + "/api/my-account/others-requests/get", {
      params: { userId: userId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log(response.data);
        setBooksOthersRequestedList(response.data);
      })
      .catch((err) => {
        console.log(err.response);
        alert(err.response.data);
      });

    // // Populate closed listings
    // Axios.get(serverUrl + "/api/my-account/closed-listings/get")
    //   .then((response) => {
    //     setClosedListings(response.data);
    //   })
    //   .catch((err) => {
    //     console.log(err.response);
    //     alert(err.response.data);
    //   });

    // // Populate books I won
    // Axios.get(serverUrl + "/api/my-account/won/get")
    //   .then((response) => {
    //     setWonBooks(response.data);
    //   })
    //   .catch((err) => {
    //     console.log(err.response);
    //     alert(err.response.data);
    //   });

    // // Populate books I lost
    // Axios.get(serverUrl + "/api/my-account/lost/get")
    //   .then((response) => {
    //     setLostBooks(response.data);
    //   })
    //   .catch((err) => {
    //     console.log(err.response);
    //     alert(err.response.data);
    //   });
  };

  useEffect(() => {
    getMyAccountDetails();
  }, []);

  return (
    <div className="myAccount">
      <h1>{user.email}</h1>
      <br />
      {/* {JSON.stringify(user, null, 2)} */}
      <h2>Notifications</h2>
      <div className="notifications">
        {swapRequestedNotificationsList.map((val) => {
          return (
            <div className="card">
              <h4>Swap Requested Notifications</h4>
              <p>{val.message}</p>
            </div>
          );
        })}
        {swapConfirmedNotificationsList.map((val) => {
          return (
            <div className="card">
              <h4>Swap Confirmed Notifications</h4>
              <p>{val.message}</p>
            </div>
          );
        })}
      </div>
      <br />
      <h2>Books I've Requested</h2>
      {booksIRequestedList.length === 0 ? (
        <div className="booksIRequested">
          <div className="card">
            <p>You haven't requested any books</p>
          </div>
        </div>
      ) : (
        <div className="booksIRequested">
          {booksIRequestedList.map((val) => {
            return (
              <div className="card">
                <h2>{val.title}</h2>
                {val.image === "" ? (
                  <img
                    src="https://res.cloudinary.com/dmxlueraz/image/upload/v1637478934/missing-picture-page-for-website_dmujoj.jpg"
                    alt="No Image"
                  />
                ) : (
                  <img src={val.image} alt="Listing Image" />
                )}
                <h4>By {val.author}</h4>
                <h5>{val.genre}</h5>
                <p>Listed by {val.listerEmail}</p>
                <p>Requested on: {val.createdOn}</p>
                <br />
                {!!val.swap == true && (
                  <>
                    <h2>Swapping with my book: </h2>
                    <br />
                    <h4>{val.bookImSwappingTitle}</h4>
                    {val.bookImSwappingImage === "" ? (
                      <img
                        src="https://res.cloudinary.com/dmxlueraz/image/upload/v1637478934/missing-picture-page-for-website_dmujoj.jpg"
                        alt="No Image"
                      />
                    ) : (
                      <img src={val.bookImSwappingImage} alt="Listing Image" />
                    )}
                    <h4>By {val.bookImSwappingAuthor}</h4>
                    <h5>{val.bookImSwappingGenre}</h5>
                  </>
                )}
                {!!val.giveAway == true && (
                  <h4>Requesting this book for free (no swap)</h4>
                )}
              </div>
            );
          })}
        </div>
      )}
      <br />
      <h2>Books Others Are Requesting From Me</h2>
      {booksOthersRequestedList.length === 0 ? (
        <div className="booksOthersRequested">
          <div className="card">
            <p>No one has requested your books yet :( Maybe list some more?</p>
          </div>
        </div>
      ) : (
        <div className="booksOthersRequested">
          {booksOthersRequestedList.map((val) => {
            return (
              <div className="card">
                <h2>{val.title}</h2>
                {val.image === "" ? (
                  <img
                    src="https://res.cloudinary.com/dmxlueraz/image/upload/v1637478934/missing-picture-page-for-website_dmujoj.jpg"
                    alt="No Image"
                  />
                ) : (
                  <img src={val.image} alt="Listing Image" />
                )}
                <h4>By {val.author}</h4>
                <h5>{val.genre}</h5>
                <h6>Requested by {val.requestedBy}</h6>
                <p>Requested on: {val.createdOn}</p>
                <br />
                {!!val.swap == true && (
                  <>
                    <h2>Book offered for swap: </h2>
                    <br />
                    <h4>{val.bookOfferedForSwappingTitle}</h4>
                    {val.bookOfferedForSwappingImage === "" ? (
                      <img
                        src="https://res.cloudinary.com/dmxlueraz/image/upload/v1637478934/missing-picture-page-for-website_dmujoj.jpg"
                        alt="No Image"
                      />
                    ) : (
                      <img
                        src={val.bookOfferedForSwappingImage}
                        alt="Listing Image"
                      />
                    )}
                    <h4>By {val.bookOfferedForSwappingAuthor}</h4>
                    <h5>{val.bookOfferedForSwappingGenre}</h5>
                  </>
                )}
                {!!val.giveAway == true && (
                  <h4>
                    {val.requestedBy} is requesting this book for free (no swap)
                  </h4>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/*<div className="closedBooks">
          {closedListings.map((val) => {
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
                <h5>{val.genre}</h5>
                <p>Listed by {val.userEmail}</p>
              </div>
            );
          })}
        </div>
        <div className="wonBooks">
          {wonBooks.map((val) => {
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
                <h5>{val.genre}</h5>
                <p>Listed by {val.userEmail}</p>
              </div>
            );
          })}
        </div>
        <div className="lostBooks">
          {lostBooks.map((val) => {
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
                <h5>{val.genre}</h5>
                <p>Listed by {val.userEmail}</p>
              </div>
            );
          })}
        </div> */}
    </div>
  );
};

export default MyAccount;
