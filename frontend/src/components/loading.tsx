import React from "react";
const loadingImg = "../../../images/loading.gif";

const Loading = () => (
  <div className="spinner">
    <img src={loadingImg} alt="Loading..." />
  </div>
);

export default Loading;
