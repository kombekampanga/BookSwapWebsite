import { NavLink } from "react-router-dom";
import React from "react";

const MainNav = () => (
  <div className="navbar-nav mr-auto">
    <NavLink
      to="/"
      exact
      className="nav-link"
      activeClassName="router-link-exact-active"
    >
      Home
    </NavLink>
    <NavLink
      to="/myAccount"
      exact
      className="nav-link"
      activeClassName="router-link-exact-active"
    >
      My Account
    </NavLink>
    <NavLink
      to="/listings"
      exact
      className="nav-link"
      activeClassName="router-link-exact-active"
    >
      All Listings
    </NavLink>
    <NavLink
      to="/mylistings"
      exact
      className="nav-link"
      activeClassName="router-link-exact-active"
    >
      My Listings
    </NavLink>
    <NavLink
      to="/listabook"
      exact
      className="nav-link"
      activeClassName="router-link-exact-active"
    >
      List a Book
    </NavLink>
    <NavLink
      to="/external-api"
      exact
      className="nav-link"
      activeClassName="router-link-exact-active"
    >
      External API
    </NavLink>
  </div>
);

export default MainNav;
