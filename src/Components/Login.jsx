import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const Login = () => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleLogin = async (event) => { 
    event.preventDefault();
    setError("");

    if (!emailId || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/login`,
        {
          emailId,
          password,
        },
        { withCredentials: true }
      );

      let loggedInUser = response?.data?.user || response?.data?.data;
      if (!loggedInUser) {
        const profileResponse = await axios.get(`${API_BASE_URL}/profile/view`, {
          withCredentials: true,
        });
        loggedInUser =
          profileResponse?.data?.user ||
          profileResponse?.data?.data ||
          profileResponse?.data;
      }

      console.log("Logged-in user full data:", loggedInUser);
      dispatch(addUser(loggedInUser));
      navigate("/feed");
    } catch (error) {
      console.error("Login failed:", error?.response?.data || error.message);
      const serverMessage = error?.response?.data?.message;
      setError(serverMessage || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="justify-items-center my-10">
      <div className="card bg-base-200 w-96 shadow-sm">
        <form className="card-body" onSubmit={handleLogin}>
          <h2 className="card-title justify-center">Login</h2>
          <div>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Email ID</legend>
              <input
                type="email"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                className="input"
                placeholder="Type here"
                autoComplete="email"
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Password</legend>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Type here"
                autoComplete="current-password"
              />
            </fieldset>
            {error ? <p className="mt-2 text-sm text-error">{error}</p> : null}
          </div>
          <div className="card-actions justify-center">
            <button className="btn btn-primary" type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
