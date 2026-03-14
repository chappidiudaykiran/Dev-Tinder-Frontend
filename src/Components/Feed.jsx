import React, { useEffect } from 'react'
import axios from 'axios'
import { BASE_URL } from '../utils/constants'
import { useDispatch } from 'react-redux'
import { addFeed } from '../utils/feedSlice'
import { useSelector } from 'react-redux'
import UserCard from './UserCard'

const Feed = () => {
  const feed = useSelector((state) => state.feed)
  const dispatch = useDispatch()

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

  return (
    <div className="min-h-[50vh] bg-linear-to-b from-base-100 to-base-200 px-4 py-2">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-base-content">Discover People</h1>
          <p className="mt-2 text-sm text-base-content/70">
            Browse your DevTinder feed and explore developer profiles.
          </p>
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Feed