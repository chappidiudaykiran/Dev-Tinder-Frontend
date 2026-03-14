import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from '../utils/userSlice';
import UserCard from './UserCard';
import { BASE_URL } from '../utils/constants';

const EditProfile = () => {
  const user = useSelector((state) => state.user.userInfo);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [about, setAbout] = useState("");
  const [skills, setSkills] = useState("");
  const [error, setError] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) {
      return;
    }

    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setPhotoUrl(user.photoUrl || "");
    setAbout(user.about || "");
    setSkills(Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ""));
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const existingSkills = Array.isArray(user?.skills)
      ? user.skills.join(', ')
      : (user?.skills || "");

    const payload = {
      firstName: firstName || user?.firstName || "",
      lastName: lastName || user?.lastName || "",
      photoUrl: photoUrl || user?.photoUrl || "",
      about: about || user?.about || "",
      skills: skills || existingSkills,
    };

    try {
      const res = await axios.patch(`${BASE_URL}/profile/edit`, payload, {
        withCredentials: true
      });

      let updatedUser = res?.data?.user || res?.data?.data || res?.data?.updatedUser;

      // Some backends return only status/message on edit; fetch profile to keep auth state intact.
      if (!updatedUser) {
        const profileRes = await axios.get(`${BASE_URL}/profile/view`, {
          withCredentials: true,
        });
        updatedUser = profileRes?.data?.user || profileRes?.data?.data || profileRes?.data;
      }

      if (updatedUser) {
        dispatch(addUser(updatedUser));
      }

      if (res.status === 200) {
        setShowSuccessToast(true);
        setTimeout(() => {
          setShowSuccessToast(false);
        }, 1200);
      }
    } catch (error) {
      const serverMessage = error?.response?.data?.message;
      setError(serverMessage || "Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const previewSkills = skills || (Array.isArray(user?.skills) ? user.skills.join(', ') : (user?.skills || ""));

  const previewPerson = {
    firstName: firstName || user?.firstName || "",
    lastName: lastName || user?.lastName || "",
    photoUrl: photoUrl || user?.photoUrl || "",
    about: about || user?.about || "",
    age: user?.age,
    gender: user?.gender,
    skills: previewSkills.split(',').map((s) => s.trim()).filter(Boolean),
  };

  return (
    <div className="flex justify-center items-start gap-9 w-full mt-3 mb-10 pb-10" style={{ minHeight: '80vh' }}>
      {showSuccessToast ? (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success">
            <span>Profile updated successfully!</span>
          </div>
        </div>
      ) : null}
      <div className="justify-items-center my-0">
        <div className="card bg-base-200 w-96 shadow-sm p-1">
          <form className="card-body p-1" onSubmit={handleSubmit}>
            <h2 className="card-title justify-center">Edit Profile</h2>
            <div className="space-y-2">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">First Name</legend>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input input-sm"
                  placeholder="First name"
                  autoComplete="given-name"
                  style={{ height: 28 }}
                />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Last Name</legend>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input input-sm"
                  placeholder="Last name"
                  autoComplete="family-name"
                  style={{ height: 28 }}
                />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Photo URL</legend>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="input input-sm"
                  placeholder="Link to your photo"
                  autoComplete="off"
                  style={{ height: 28 }}
                />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">About</legend>
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="input input-sm"
                  placeholder="Tell us about yourself"
                  autoComplete="off"
                  rows={2}
                  style={{ minHeight: 40, maxHeight: 60 }}
                />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Skills</legend>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="input input-sm"
                  placeholder="Your skills (comma separated)"
                  autoComplete="off"
                  style={{ height: 28 }}
                />
              </fieldset>
            </div>
            {error ? <p className="mt-2 text-sm text-error">{error}</p> : null}
            <div className="card-actions justify-center">
              <button className="btn btn-primary" type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div style={{ maxWidth: 288, marginTop: '2.9em' }}>
        <UserCard person={previewPerson} />
      </div>
    </div>
  );
}

export default EditProfile