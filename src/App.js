import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("loggedIn"));
  const [registerMode, setRegisterMode] = useState(false);

  return (
    <div className="container mt-5">
      {!loggedIn ? (
        registerMode ? (
          <Register setRegisterMode={setRegisterMode} />
        ) : (
          <Login setLoggedIn={setLoggedIn} setRegisterMode={setRegisterMode} />
        )
      ) : (
        <Dashboard setLoggedIn={setLoggedIn} />
      )}
    </div>
  );
};

export default App;
