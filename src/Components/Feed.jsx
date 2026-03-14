import React, { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { BASE_URL } from '../utils/constants'
import { useDispatch } from 'react-redux'
import { addFeed } from '../utils/feedSlice'
import { useSelector } from 'react-redux'
import UserCard from './UserCard'

const SWIPE_THRESHOLD = 45
const SWIPE_VELOCITY_THRESHOLD = 0.2
const FEED_EXCLUDED_KEY_BASE = 'devtinder_excluded_feed_ids'

const Feed = () => {
  const feed = useSelector((state) => state.feed)
  const loggedInUserId = useSelector((state) => state.user.userInfo?._id)
  const dispatch = useDispatch()
  const [actionLoadingUserId, setActionLoadingUserId] = useState('')
  const [actionError, setActionError] = useState('')
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)
  const [excludedUserIds, setExcludedUserIds] = useState([])
  const startXRef = useRef(0)
  const activePointerIdRef = useRef(null)
  const pointerLastXRef = useRef(0)
  const pointerLastTimeRef = useRef(0)
  const swipeVelocityRef = useRef(0)
  const fetchedForUserRef = useRef(null)
  const userExcludedKey = loggedInUserId
    ? `${FEED_EXCLUDED_KEY_BASE}_${loggedInUserId}`
    : `${FEED_EXCLUDED_KEY_BASE}_guest`
  const excludedUserIdSet = useMemo(
    () => new Set(excludedUserIds.map((id) => String(id))),
    [excludedUserIds]
  )

  useEffect(() => {
    try {
      const stored = localStorage.getItem(userExcludedKey)
      const parsed = stored ? JSON.parse(stored) : []
      setExcludedUserIds(Array.isArray(parsed) ? parsed : [])
    } catch {
      setExcludedUserIds([])
    }
  }, [userExcludedKey])

  useEffect(() => {
    try {
      localStorage.setItem(userExcludedKey, JSON.stringify(excludedUserIds))
    } catch {
      // Ignore storage failures.
    }
  }, [excludedUserIds, userExcludedKey])

  useEffect(() => {
    const getFeed = async () => {
      if (!loggedInUserId) {
        return
      }

      if (fetchedForUserRef.current === loggedInUserId && feed?.length > 0) {
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

        const filteredFeedData = (Array.isArray(feedData) ? feedData : []).filter(
          (person) => person?._id && !excludedUserIdSet.has(String(person._id))
        )

        dispatch(addFeed(filteredFeedData))
        fetchedForUserRef.current = loggedInUserId
      } catch (err) {
        console.error('Failed to fetch feed:', err)
      }
    }

    getFeed()
  }, [dispatch, excludedUserIdSet, feed, loggedInUserId])

  const feedItems = (Array.isArray(feed) ? feed : []).filter(
    (person) => person?._id && !excludedUserIdSet.has(String(person._id))
  )
  const currentUser = feedItems[0]
  const nextUser = feedItems[1]

  useEffect(() => {
    if (!Array.isArray(feed) || feed.length === 0) {
      return
    }

    const filteredFeed = feed.filter(
      (person) => person?._id && !excludedUserIdSet.has(String(person._id))
    )

    if (filteredFeed.length !== feed.length) {
      dispatch(addFeed(filteredFeed))
    }
  }, [dispatch, excludedUserIdSet, feed])

  const rememberExcludedUser = (userId) => {
    const normalizedUserId = String(userId)
    setExcludedUserIds((prev) => {
      if (prev.includes(normalizedUserId)) {
        return prev
      }
      return [...prev, normalizedUserId]
    })
  }

  const removeUserFromFeed = (userId) => {
    rememberExcludedUser(userId)
    const updatedFeed = feedItems.filter((person) => person?._id !== userId)
    dispatch(addFeed(updatedFeed))
  }

  const sendRequest = async (status, userId) => {
    if (!userId) {
      return false
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
      return true
    } catch (err) {
      const serverMessage = err?.response?.data?.message
      setActionError(serverMessage || 'Failed to process this action. Please try again.')
      return false
    } finally {
      setActionLoadingUserId('')
    }
  }

  const resetCardPosition = () => {
    setDragX(0)
    setIsDragging(false)
    setIsAnimatingOut(false)
    activePointerIdRef.current = null
    startXRef.current = 0
    pointerLastXRef.current = 0
    pointerLastTimeRef.current = 0
    swipeVelocityRef.current = 0
  }

  const completeSwipe = async (direction) => {
    if (!currentUser?._id || isAnimatingOut) {
      return
    }

    setIsAnimatingOut(true)
    setIsDragging(false)
    setDragX(direction === 'right' ? 500 : -500)

    await new Promise((resolve) => setTimeout(resolve, 280))

    const actionStatus = direction === 'right' ? 'interested' : 'ignored'
    const success = await sendRequest(actionStatus, currentUser._id)

    if (!success) {
      setDragX(0)
      setIsAnimatingOut(false)
      return
    }

    resetCardPosition()
  }

  const onPointerDown = (event) => {
    if (!currentUser || isAnimatingOut) {
      return
    }
    activePointerIdRef.current = event.pointerId
    startXRef.current = event.clientX
    pointerLastXRef.current = event.clientX
    pointerLastTimeRef.current = performance.now()
    swipeVelocityRef.current = 0
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event) => {
    if (!isDragging || activePointerIdRef.current !== event.pointerId) {
      return
    }

    const now = performance.now()
    const deltaTime = Math.max(now - pointerLastTimeRef.current, 1)
    const deltaX = event.clientX - pointerLastXRef.current
    swipeVelocityRef.current = deltaX / deltaTime
    pointerLastXRef.current = event.clientX
    pointerLastTimeRef.current = now

    // Slight amplification makes swipe feel more responsive without changing final API behavior.
    setDragX((event.clientX - startXRef.current) * 1.04)
  }

  const onPointerEnd = async (event) => {
    if (activePointerIdRef.current !== event.pointerId) {
      return
    }

    event.currentTarget.releasePointerCapture(event.pointerId)
    activePointerIdRef.current = null
    setIsDragging(false)

    const hasFlickRight = swipeVelocityRef.current >= SWIPE_VELOCITY_THRESHOLD
    const hasFlickLeft = swipeVelocityRef.current <= -SWIPE_VELOCITY_THRESHOLD

    if (dragX >= SWIPE_THRESHOLD || hasFlickRight) {
      await completeSwipe('right')
      return
    }

    if (dragX <= -SWIPE_THRESHOLD || hasFlickLeft) {
      await completeSwipe('left')
      return
    }

    setDragX(0)
  }

  const positiveRatio = Math.min(Math.max(dragX / SWIPE_THRESHOLD, 0), 1)
  const negativeRatio = Math.min(Math.max(-dragX / SWIPE_THRESHOLD, 0), 1)
  const cardRotation = dragX * 0.05
  const cardTransition = isDragging ? 'none' : 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)'

  useEffect(() => {
    resetCardPosition()
  }, [feedItems.length])

  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden bg-linear-to-b from-base-100 via-base-200 to-base-300 px-4 pt-2 pb-8 sm:pt-3 sm:pb-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-56 w-56 -translate-x-72 rounded-full bg-rose-200/35 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 translate-x-24 rounded-full bg-cyan-200/35 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6">
        {actionError ? <p className="text-sm text-error">{actionError}</p> : null}

        {feedItems.length === 0 ? (
          <div className="mx-auto w-full max-w-xl rounded-3xl border border-base-300 bg-base-100/90 p-10 text-center shadow-lg backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-base-content">No profiles available</h2>
            <p className="mt-2 text-sm text-base-content/70">
              Your feed is empty right now. Please check back later.
            </p>
          </div>
        ) : (
          <div className="mx-auto mt-1 mb-14 flex w-full max-w-lg flex-col items-center gap-2 sm:mt-2">
            <div className="relative flex w-full items-center justify-center">
              <div className="relative h-128 w-72 shrink-0">
              {nextUser ? (
                <div className="absolute inset-0 translate-y-3 scale-[0.965] opacity-75 saturate-75">
                  <UserCard person={nextUser} showActions={false} />
                </div>
              ) : null}

              {currentUser ? (
                <div
                  className="absolute inset-0 touch-none select-none cursor-grab active:cursor-grabbing"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerEnd}
                  onPointerCancel={onPointerEnd}
                  style={{
                    transform: `translateX(${dragX}px) rotate(${cardRotation}deg)`,
                    transition: cardTransition,
                  }}
                >
                  <div
                    className="pointer-events-none absolute left-4 top-6 z-10 rounded-full border border-rose-300 bg-rose-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-rose-700"
                    style={{ opacity: negativeRatio }}
                  >
                    Ignored
                  </div>
                  <div
                    className="pointer-events-none absolute right-4 top-6 z-10 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-700"
                    style={{ opacity: positiveRatio }}
                  >
                    Interested
                  </div>

                  <UserCard
                    person={currentUser}
                    showActions={false}
                    isActionLoading={actionLoadingUserId === currentUser._id}
                  />
                </div>
              ) : null}

              </div>
            </div>

            <div className="mt-2 flex items-center gap-5 text-xs font-medium text-base-content/60">
              <span className="inline-flex items-center gap-1.5">
                <span className="text-sm">←</span>
                <span>Ignore</span>
              </span>
              <span className="h-1 w-1 rounded-full bg-base-content/35" />
              <span className="inline-flex items-center gap-1.5">
                <span>Interested</span>
                <span className="text-sm">→</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Feed