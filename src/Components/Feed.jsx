import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { BASE_URL } from '../utils/constants'
import { useDispatch } from 'react-redux'
import { addFeed } from '../utils/feedSlice'
import { useSelector } from 'react-redux'
import UserCard from './UserCard'

const Feed = () => {
  const feed = useSelector((state) => state.feed)
  const dispatch = useDispatch()
  const [actionLoadingUserId, setActionLoadingUserId] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    const getFeed = async () => {
      if (feed?.length > 0) {
        return
      }

      try {
        const res = await axios.get(`${BASE_URL}/feed`, { withCredentials: true })
        const feedData =
          res?.data?.users ||
          res?.data?.feed ||
          res?.data?.data ||
          res?.data ||
          []

        dispatch(addFeed(Array.isArray(feedData) ? feedData : []))
      } catch (err) {
        console.error('Failed to fetch feed:', err)
      }
    }

    getFeed()
  }, [dispatch, feed])

  const feedItems = Array.isArray(feed) ? feed : []

  const removeUserFromFeed = (userId) => {
    const updatedFeed = feedItems.filter((person) => person?._id !== userId)
    dispatch(addFeed(updatedFeed))
  }

  const sendRequest = async (status, userId) => {
    if (!userId) {
      return
    }

    setActionError('')
    setActionLoadingUserId(userId)

    try {
      const statusesToTry = status === 'ignored'
        ? ['ignored', 'ignore', 'rejected']
        : [status]

      let sent = false
      let lastError = null

      for (const currentStatus of statusesToTry) {
        try {
          await axios.post(`${BASE_URL}/request/send/${currentStatus}/${userId}`, {}, {
            withCredentials: true,
          })
          sent = true
          break
        } catch (err) {
          lastError = err
        }
      }

      if (!sent) {
        throw lastError || new Error('Failed to send request')
      }

      removeUserFromFeed(userId)
    } catch (err) {
      const serverMessage = err?.response?.data?.message
      setActionError(serverMessage || 'Failed to process this action. Please try again.')
    } finally {
      setActionLoadingUserId('')
    }
  }

  return (
    <div className="min-h-[50vh] bg-linear-to-b from-base-100 to-base-200 px-4 py-2">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-base-content">Discover People</h1>
          <p className="mt-2 text-sm text-base-content/70">
            Browse your DevTinder feed and explore developer profiles.
          </p>
          {actionError ? <p className="mt-2 text-sm text-error">{actionError}</p> : null}
        </div>

        {feedItems.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-base-300 bg-base-100 p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-base-content">No profiles available</h2>
            <p className="mt-2 text-sm text-base-content/70">
              Your feed is empty right now. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {feedItems.map((person) => (
              <UserCard
                key={person._id || person.emailId || [person.firstName, person.lastName].filter(Boolean).join(' ')}
                person={person}
                onIgnore={() => sendRequest('ignored', person._id)}
                onInterested={() => sendRequest('interested', person._id)}
                isActionLoading={actionLoadingUserId === person._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Feed