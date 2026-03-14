const UserCard = ({
  person = {},
  onIgnore,
  onInterested,
  ignoreLabel = 'Ignore',
  interestedLabel = 'Interested',
  isActionLoading = false,
  showActions = true,
  actionClassName = '',
  ignoreButtonClassName = '',
  interestedButtonClassName = '',
}) => {
  const fullName = [person.firstName, person.lastName].filter(Boolean).join(' ')
  const subtitle = [person.age, person.gender].filter(Boolean).join(', ')
  const skills = Array.isArray(person.skills) ? person.skills : []

  return (
    <div className="card h-full w-full overflow-hidden rounded-3xl border border-base-300/60 bg-base-100/95 shadow-xl ring-1 ring-black/5 backdrop-blur-sm">
      <figure className="bg-base-200/60 p-3">
        <div className="mx-auto aspect-3/4 w-full max-w-64 overflow-hidden rounded-2xl">
          <img
            src={person.photoUrl || 'https://placehold.co/400x320?text=DevTinder'}
            alt={fullName || 'Profile'}
            className="h-full w-full object-cover object-top"
          />
        </div>
      </figure>
      <div className="card-body flex flex-col gap-1.5 p-4 pt-2">
        <h2 className="card-title text-2xl leading-tight">{fullName || 'Unknown User'}</h2>
        {subtitle ? <p className="text-xs text-base-content/70">{subtitle}</p> : null}
        <p className="line-clamp-4 min-h-16 text-sm leading-5 text-base-content/80">
          {person.about || 'No bio added yet.'}
        </p>

        {skills.length > 0 ? (
          <div className="mt-0 flex flex-wrap gap-2">
            {skills.slice(0, 5).map((skill) => (
              <span key={skill} className="badge badge-outline badge-sm border-base-300 bg-base-100 px-2 py-2 text-[11px]">
                {skill}
              </span>
            ))}
          </div>
        ) : null}

        {showActions ? (
          <div className={`card-actions mt-auto pt-3 justify-end gap-2 ${actionClassName}`.trim()}>
            <button
              type="button"
              className={`btn btn-sm border-sky-300 bg-sky-100 text-sky-900 hover:bg-sky-200 ${ignoreButtonClassName}`.trim()}
              onClick={onIgnore}
              disabled={isActionLoading || !onIgnore}
            >
              {ignoreLabel}
            </button>
            <button
              type="button"
              className={`btn btn-sm border-pink-300 bg-pink-200 text-pink-900 hover:bg-pink-300 ${interestedButtonClassName}`.trim()}
              onClick={onInterested}
              disabled={isActionLoading || !onInterested}
            >
              {interestedLabel}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default UserCard