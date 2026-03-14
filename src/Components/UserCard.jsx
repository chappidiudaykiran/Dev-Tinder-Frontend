const UserCard = ({ person }) => {
  const fullName = [person.firstName, person.lastName].filter(Boolean).join(' ')
  const subtitle = [person.age, person.gender].filter(Boolean).join(', ')
  const skills = Array.isArray(person.skills) ? person.skills : []

  return (
    <div className="card overflow-hidden border border-base-300 bg-base-400 shadow-md">
      <figure className="bg-base-200 px-4 pt-4">
        <img
          src={person.photoUrl || 'https://placehold.co/400x320?text=DevTinder'}
          alt={fullName || 'Profile'}
          className="h-56 w-full rounded-xl object-cover"
        />
      </figure>
      <div className="card-body p-4">
        <h2 className="card-title text-xl">{fullName || 'Unknown User'}</h2>
        {subtitle ? <p className="text-xs text-base-content/70">{subtitle}</p> : null}
        <p className="line-clamp-3 text-sm leading-5 text-base-content/80">
          {person.about || 'No bio added yet.'}
        </p>

        {skills.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {skills.slice(0, 5).map((skill) => (
              <span key={skill} className="badge badge-outline badge-secondary badge-sm">
                {skill}
              </span>
            ))}
          </div>
        ) : null}

        <div className="card-actions mt-3 justify-end gap-2">
          <button type="button" className="btn btn-sm border-sky-300 bg-sky-200 text-sky-900 hover:bg-sky-300">
            Ignore
          </button>
          <button type="button" className="btn btn-sm border-pink-300 bg-pink-200 text-pink-900 hover:bg-pink-300">
            Interested
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserCard