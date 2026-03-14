import axios from 'axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import UserCard from './UserCard'
import { addRequest } from '../utils/requestSlice'
import { BASE_URL } from '../utils/constants'

const extractRequestArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  const candidateKeys = [
    'connectionRequests',
    'requests',
    'request',
    'receivedRequests',
    'pendingRequests',
    'users',
    'data',
    'results',
  ]

  for (const key of candidateKeys) {
    const value = payload[key]
    if (Array.isArray(value)) {
      return value
    }
  }

  for (const key of candidateKeys) {
    const value = payload[key]
    if (value && typeof value === 'object') {
      const nested = extractRequestArray(value)
      if (nested.length > 0) {
        return nested
      }
    }
  }

  return []
}

const getRequesterId = (item) => {
  if (!item || typeof item !== 'object') {
    return null
  }

  if (typeof item.fromUserId === 'string') {
    return item.fromUserId
  }

  if (typeof item.requestedBy === 'string') {
    return item.requestedBy
  }

  if (typeof item.senderId === 'string') {
    return item.senderId
  }

  return null
}

const fetchUserById = async (userId) => {
  const endpoints = [
    `${BASE_URL}/profile/view/${userId}`,
    `${BASE_URL}/profile/${userId}`,
    `${BASE_URL}/user/${userId}`,
  ]

  for (const endpoint of endpoints) {
    try {
      const res = await axios.get(endpoint, { withCredentials: true })
      const user = res?.data?.user || res?.data?.data || res?.data
      if (user && typeof user === 'object') {
        return user
      }
    } catch {
      // Try next endpoint variant.
    }
  }

  return null
}

const Requests = () => {
  const dispatch = useDispatch()
  const loggedInUserId = useSelector((state) => state.user.userInfo?._id)
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true)
      setError('')

      try {
        const endpoints = [
          `${BASE_URL}/user/requests/received`,
          `${BASE_URL}/user/requests/recieved`,
          `${BASE_URL}/user/request/received`,
          `${BASE_URL}/requests/received`,
        ]

        let responseData = null
        let lastError = null

        for (const endpoint of endpoints) {
          try {
            const res = await axios.get(endpoint, {
              withCredentials: true,
            })
            responseData = res?.data
            break
          } catch (err) {
            lastError = err
          }
        }

        if (!responseData) {
          throw lastError || new Error('Unable to fetch requests')
        }

        const list = extractRequestArray(responseData)

        const safeList = Array.isArray(list) ? list : []

        // Hydrate requester details when backend returns only requester IDs.
        const hydratedList = await Promise.all(
          safeList.map(async (item) => {
            const requesterId = getRequesterId(item)
            if (!requesterId) {
              return item
            }

            const hasEmbeddedDetails =
              (item?.fromUserId && typeof item.fromUserId === 'object') ||
              (item?.requestedBy && typeof item.requestedBy === 'object')

            if (hasEmbeddedDetails) {
              return item
            }

            const user = await fetchUserById(requesterId)
            if (!user) {
              return item
            }

            return {
              ...item,
              fromUserId: typeof item.fromUserId === 'object' ? item.fromUserId : user,
              requestedBy: typeof item.requestedBy === 'object' ? item.requestedBy : user,
            }
          })
        )

        setRequests(hydratedList)
        dispatch(addRequest(hydratedList))
      } catch (err) {
        const serverMessage = err?.response?.data?.message
        setError(serverMessage || 'Failed to load requests.')
        setRequests([])
        dispatch(addRequest([]))
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()
  }, [dispatch])

  const requestList = Array.isArray(requests) ? requests : []

  const normalizeRequester = (item) => {
    if (!item || typeof item !== 'object') {
      return null
    }

    if (item.firstName || item.lastName || item.photoUrl || item.emailId) {
      return item
    }

    const fromUser = item.fromUserId && typeof item.fromUserId === 'object' ? item.fromUserId : null
    const toUser = item.toUserId && typeof item.toUserId === 'object' ? item.toUserId : null
    const requesterObject = item.requestedBy && typeof item.requestedBy === 'object' ? item.requestedBy : null
    const requestedToObject = item.requestedTo && typeof item.requestedTo === 'object' ? item.requestedTo : null

    if (fromUser) {
      return { ...fromUser, _id: fromUser._id || item._id }
    }

    if (toUser && toUser._id !== loggedInUserId) {
      return { ...toUser, _id: toUser._id || item._id }
    }

    const candidates = [
      item.user,
      item.userId,
      item.requester,
      item.requestedBy,
      item.requestedTo,
      item.sender,
      item.senderId,
      item.fromUser,
      fromUser,
      toUser,
      requesterObject,
      requestedToObject,
    ]

    const person = candidates.find(
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        (candidate.firstName || candidate.lastName || candidate.photoUrl || candidate.emailId)
    )

    return person ? { ...person, _id: person._id || item._id } : null
  }

  const people = requestList.map(normalizeRequester).filter(Boolean)

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-bold">Requests</h1>
      <p className="mt-2 text-sm text-base-content/70">Users who requested to connect with you.</p>

      {isLoading ? <p className="mt-6 text-sm">Loading requests...</p> : null}
      {error ? <p className="mt-6 text-sm text-error">{error}</p> : null}

      {!isLoading && !error && people.length === 0 ? (
        <p className="mt-6 text-sm text-base-content/70">No requests found.</p>
      ) : null}

      {!isLoading && !error && people.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {people.map((person) => (
            <UserCard
              key={person._id || person.emailId || [person.firstName, person.lastName].filter(Boolean).join(' ')}
              person={person}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default Requests
