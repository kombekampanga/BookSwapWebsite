import React from "react";
import { Route, Switch } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Axios from "axios";

import { NavBar, Footer } from "./components";
import {
  Home,
  Profile,
  //ExternalApi,
  Listings,
  ListABook,
  MyListings,
} from "./views";

import "./app.css";
import ProtectedRoute from "./auth/protected-route";

const App = () => {
  //check if the logged in user is in the database. If they aren't then add them
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const serverUrl = process.env.REACT_APP_SERVER_URL;

  const addUserToDb = async () => {
    const token = await getAccessTokenSilently();
    const userId = user?.sub?.split("|")[1];
    const userEmail = user?.email;

    Axios.post(
      serverUrl + "/api/users/insert",
      {
        userId: userId,
        userEmail: userEmail,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => {
        if (response.data.affectedRows !== 0) {
          alert("User Added");
        }
      })
      .catch((err) => {
        console.log(err);
        alert(err.response.data);
      });
  };

  if (isAuthenticated) {
    addUserToDb();
  }

  return (
    <div id="app" className="d-flex flex-column h-100">
      <NavBar />
      <div className="container flex-grow-1">
        <div className="mt-5">
          <Switch>
            <Route path="/" exact component={Home} />
            <ProtectedRoute path="/profile" component={Profile} />
            <Route path="/listings" component={Listings} />
            <ProtectedRoute path="/listabook" component={ListABook} />
            <ProtectedRoute path="/mylistings" component={MyListings} />
            {/* <ProtectedRoute path="/external-api" component={ExternalApi} /> */}
          </Switch>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default App;
