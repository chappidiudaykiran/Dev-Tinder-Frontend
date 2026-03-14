import { useEffect, useState } from 'react'
import axios from 'axios'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Body from './Components/Body'
import Login from './Components/Login'
import Profile from './Components/Profile'
import Connections from './Components/Connections'
import Requests from './Components/Requests'
import { useDispatch, useSelector } from 'react-redux'
import Feed from './Components/Feed'
import { BASE_URL } from './utils/constants'
import { addUser, removeUser } from './utils/userSlice'

function App() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.userInfo)
  const [isAuthChecking, setIsAuthChecking] = useState(true)

  useEffect(() => {
    let isMounted = true

    const verifyUser = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/profile/view`, {
          withCredentials: true,
        })
        const authUser = response?.data?.user || response?.data?.data || response?.data

        if (isMounted) {
          dispatch(addUser(authUser))
        }
      } catch {
        if (isMounted) {
          dispatch(removeUser())
        }
      } finally {
        if (isMounted) {
          setIsAuthChecking(false)
        }
      }
    }

    verifyUser()

    return () => {
      isMounted = false
    }
  }, [dispatch])

  if (isAuthChecking) {
    return null
  }

  return (
    <BrowserRouter basename='/'>
      <Routes>
        <Route
          path='/'
          element={<Navigate to={user ? '/feed' : '/login'} replace />}
        />
        <Route
          path='/login'
          element={user ? <Navigate to='/feed' replace /> : <Login />}
        />
        <Route
          path='/'
          element={user ? <Body /> : <Navigate to='/login' replace />}
        >
          <Route path='feed' element={<Feed />} />
          <Route path='profile' element={<Profile />} />
          <Route path='connections' element={<Connections />} />
          <Route path='requests' element={<Requests />} />
        </Route>
        <Route
          path='*'
          element={<Navigate to={user ? '/feed' : '/login'} replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
