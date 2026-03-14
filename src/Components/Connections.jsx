import axios from 'axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import UserCard from './UserCard'
import { addConnections } from '../utils/connectionSlice'
import { BASE_URL } from '../utils/constants'

const Connections = () => {
  const dispatch = useDispatch()
  const connections = useSelector((state) => state.connections)
  const loggedInUserId = useSelector((state) => state.user.userInfo?._id)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchConnections = async () => {
      setIsLoading(true)
      setError('')

      try {
        const res = await axios.get(`${BASE_URL}/user/connections`, {
          withCredentials: true,
        })

        const list =
          res?.data?.connections ||
          res?.data?.data ||
          res?.data?.users ||
          res?.data ||
          []

        dispatch(addConnections(Array.isArray(list) ? list : []))
      } catch (err) {
        const serverMessage = err?.response?.data?.message
        setError(serverMessage || 'Failed to load connections.')
        dispatch(addConnections([]))
      } finally {
        setIsLoading(false)
      }
    }

    fetchConnections()
  }, [dispatch])

  const connectionList = Array.isArray(connections) ? connections : []

  const normalizePerson = (item) => {
    if (!item || typeof item !== 'object') {
      return null
    }

    if (item.firstName || item.lastName || item.photoUrl || item.emailId) {
      return item
    }

    const fromUser = item.fromUserId && typeof item.fromUserId === 'object' ? item.fromUserId : null
    const toUser = item.toUserId && typeof item.toUserId === 'object' ? item.toUserId : null

    // If both users are present, pick the other user relative to current login.
    if (fromUser && toUser) {
      if (loggedInUserId && fromUser._id === loggedInUserId) {
        return { ...toUser, _id: toUser._id || item._id }
      }
      if (loggedInUserId && toUser._id === loggedInUserId) {
        return { ...fromUser, _id: fromUser._id || item._id }
      }
      return { ...fromUser, _id: fromUser._id || item._id }
    }

    const candidates = [
      item.user,
      item.userId,
      item.fromUser,
      item.toUser,
      item.requester,
      item.recipient,
      item.sender,
      item.receiver,
      item.senderId,
      item.receiverId,
      fromUser,
      toUser,
    ]

    const person = candidates.find(
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        (candidate.firstName || candidate.lastName || candidate.photoUrl || candidate.emailId)
    )

    return person ? { ...person, _id: person._id || item._id } : null
  }

  const people = connectionList.map(normalizePerson).filter(Boolean)

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-bold">Connections</h1>
      <p className="mt-2 text-sm text-base-content/70">Your accepted connections will appear here.</p>

      {isLoading ? <p className="mt-6 text-sm">Loading connections...</p> : null}
      {error ? <p className="mt-6 text-sm text-error">{error}</p> : null}

      {!isLoading && !error && people.length === 0 ? (
        <p className="mt-6 text-sm text-base-content/70">No connections found.</p>
      ) : null}

      {!isLoading && !error && people.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {people.map((person) => (
            <UserCard
              key={person._id || person.emailId || [person.firstName, person.lastName].filter(Boolean).join(' ')}
              person={person}
              showActions={false}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default Connections
