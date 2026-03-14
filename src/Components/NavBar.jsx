import axios from 'axios';
import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { removeUser } from '../utils/userSlice';
import { BASE_URL } from '../utils/constants';

const NavBar = () => {
  const user = useSelector((state) => state.user.userInfo);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handlelogout = async () => {
    try {
      await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true });
      dispatch(removeUser());
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }
  return (
    <div>
      <div className="navbar bg-base-300 shadow-sm">
        <div className="flex-1">
          <Link to='/' className="btn btn-ghost text-xl">👨‍💻 DevTinder</Link>
        </div>
        <div className="flex gap-2">
          {user && (
            <div className="dropdown dropdown-end mx-5">
              <div tabIndex={0} role="button" className="btn btn-ghost flex items-center gap-2 px-2">
                <span className="text-sm font-medium">Welcome, {user.firstName}</span>
                <div className="avatar">
                  <div className="w-9 rounded-full">
                    <img alt="User Photo" src={user.photoUrl} />
                  </div>
                </div>
              </div>
              <ul
                tabIndex="-1"
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow mx-5">
                <li><Link to="/feed">Home</Link></li>
                <li>
                  <Link to="/profile" className="justify-between">
                    Profile
                    <span className="badge">New</span>
                  </Link>
                </li>
                <li><Link to="/connections">Connections</Link></li>
                <li><Link to="/requests">Requests</Link></li>
                <li><Link to="/logout" onClick={ handlelogout}>Logout</Link></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NavBar
