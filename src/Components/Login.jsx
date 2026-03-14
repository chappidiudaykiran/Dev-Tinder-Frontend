import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";

const Login = () => {
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [about, setAbout] = useState("");
  const [skills, setSkills] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    setIsSignupMode(location.pathname === "/signup");
  }, [location.pathname]);

  const switchMode = (signupMode) => {
    setError("");
    setSuccess("");
    setIsSignupMode(signupMode);
    navigate(signupMode ? "/signup" : "/login");
  };

  const handleLogin = async (event) => { 
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!emailId || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/login`,
        {
          emailId,
          password,
        },
        { withCredentials: true }
      );

      let loggedInUser = response?.data?.user || response?.data?.data;
      if (!loggedInUser) {
        const profileResponse = await axios.get(`${BASE_URL}/profile/view`, {
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

  const handleSignup = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!firstName || !lastName || !emailId || !password) {
      setError("Please fill first name, last name, email and password.");
      return;
    }

    const normalizedGender = (() => {
      const value = (gender || "").trim().toLowerCase();
      if (!value) {
        return undefined;
      }
      const genderMap = {
        male: "Male",
        female: "Female",
        other: "Other",
        others: "Other",
      };
      return genderMap[value] || undefined;
    })();

    if (gender && !normalizedGender) {
      setError("Please select a valid gender.");
      return;
    }

    const payload = {
      firstName,
      lastName,
      emailId,
      password,
      age: age ? Number(age) : undefined,
      gender: normalizedGender,
      photoUrl: photoUrl || undefined,
      about: about || undefined,
      skills: skills
        ? skills.split(",").map((skill) => skill.trim()).filter(Boolean)
        : undefined,
    };

    setIsLoading(true);
    try {
      await axios.post(`${BASE_URL}/signup`, payload, {
        withCredentials: true,
      });

      setSuccess("Signup successful! Please sign in now.");
      setPassword("");
      switchMode(false);
    } catch (signupError) {
      const serverMessage = signupError?.response?.data?.message || signupError?.response?.data;
      setError(serverMessage || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="justify-items-center my-10">
      <div className="card bg-base-200 w-96 shadow-sm">
        <form className="card-body" onSubmit={isSignupMode ? handleSignup : handleLogin}>
          <h2 className="card-title justify-center">{isSignupMode ? "Create Account" : "Login"}</h2>

          <div>
            {isSignupMode ? (
              <>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">First Name</legend>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input"
                    placeholder="First name"
                    autoComplete="given-name"
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Last Name</legend>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input"
                    placeholder="Last name"
                    autoComplete="family-name"
                  />
                </fieldset>
              </>
            ) : null}

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

            {isSignupMode ? (
              <>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Age</legend>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="input"
                    placeholder="Your age"
                    min="18"
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Gender</legend>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="select"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Photo URL</legend>
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="input"
                    placeholder="https://..."
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">About</legend>
                  <textarea
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className="textarea"
                    placeholder="Tell about yourself"
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Skills</legend>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="input"
                    placeholder="React, Node.js, MongoDB"
                  />
                </fieldset>
              </>
            ) : null}
          </div>
          <p className="text-red-500">{error}</p>
          {success ? <p className="text-green-600">{success}</p> : null}
          <div className="card-actions justify-center">
            <button className="btn btn-primary" type="submit" disabled={isLoading}>
              {isLoading
                ? (isSignupMode ? "Signing up..." : "Logging in...")
                : (isSignupMode ? "Sign Up" : "Login")}
            </button>
          </div>
          <p className="text-center text-sm text-base-content/70">
            {isSignupMode ? "Already have an account?" : "Don\'t have an account?"}{" "}
            <button
              type="button"
              className="link link-primary font-medium"
              onClick={() => switchMode(!isSignupMode)}
            >
              {isSignupMode ? "Login" : "Create it"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
