import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";
import styles from "./Login3D.module.css";

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
    <div className={styles.login3dContainer}>
      <div className={styles.login3dCard}>
        <form onSubmit={isSignupMode ? handleSignup : handleLogin}>
          <h2 className={styles.login3dTitle}>{isSignupMode ? "Create Account" : "Login"}</h2>
          <div>
            {isSignupMode && (
              <>
                <fieldset className={styles.login3dFieldset}>
                  <label className={styles.login3dLabel}>First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={styles.login3dInput}
                    placeholder="First name"
                    autoComplete="given-name"
                  />
                </fieldset>
                <fieldset className={styles.login3dFieldset}>
                  <label className={styles.login3dLabel}>Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={styles.login3dInput}
                    placeholder="Last name"
                    autoComplete="family-name"
                  />
                </fieldset>
              </>
            )}
            <fieldset className={styles.login3dFieldset}>
              <label className={styles.login3dLabel}>Email ID</label>
              <input
                type="email"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                className={styles.login3dInput}
                placeholder="Type here"
                autoComplete="email"
              />
            </fieldset>
            <fieldset className={styles.login3dFieldset}>
              <label className={styles.login3dLabel}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.login3dInput}
                placeholder="Type here"
                autoComplete="current-password"
              />
            </fieldset>
            {isSignupMode && (
              <>
                <fieldset className={styles.login3dFieldset}>
                  <label className={styles.login3dLabel}>Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className={styles.login3dInput}
                    placeholder="Your age"
                    min="18"
                  />
                </fieldset>
                <fieldset className={styles.login3dFieldset}>
                  <label className={styles.login3dLabel}>Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className={styles.login3dSelect}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </fieldset>
                <fieldset className={styles.login3dFieldset}>
                  <label className={styles.login3dLabel}>Photo URL</label>
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className={styles.login3dInput}
                    placeholder="https://..."
                  />
                </fieldset>
                <fieldset className={styles.login3dFieldset}>
                  <label className={styles.login3dLabel}>About</label>
                  <textarea
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className={styles.login3dTextarea}
                    placeholder="Tell about yourself"
                  />
                </fieldset>
                <fieldset className={styles.login3dFieldset}>
                  <label className={styles.login3dLabel}>Skills</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className={styles.login3dInput}
                    placeholder="React, Node.js, MongoDB"
                  />
                </fieldset>
              </>
            )}
          </div>
          {error && <p className={styles.login3dError}>{error}</p>}
          {success && <p className={styles.login3dSuccess}>{success}</p>}
          <button className={styles.login3dBtn} type="submit" disabled={isLoading}>
            {isLoading
              ? (isSignupMode ? "Signing up..." : "Logging in...")
              : (isSignupMode ? "Sign Up" : "Login")}
          </button>
          <span className={styles.login3dLink} onClick={() => switchMode(!isSignupMode)}>
            {isSignupMode ? "Already have an account? Login" : "Don't have an account? Create it"}
          </span>
        </form>
      </div>
    </div>
  );
};

export default Login;
