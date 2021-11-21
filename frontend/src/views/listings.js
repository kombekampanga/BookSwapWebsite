import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Axios from "axios";

const Listings = () => {
  const { user } = useAuth0();
  const serverUrl = process.env.REACT_APP_SERVER_URL;
  //const { name, picture, email } = user;
  const [bookList, setBookList] = useState([]);

  useEffect(() => {
    Axios.get(serverUrl + "/api/listings/get").then((response) => {
      setBookList(response.data);
    });
  }, []);

  return (
    <div>
      {/* {JSON.stringify(user, null, 2)} */}
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
            <h5>{val.genre}</h5>
            <p>Listed by {val.userEmail}</p>
          </div>
        );
      })}
    </div>
  );
};

export default Listings;
