import { useEffect, useState } from 'react'
import { User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './ProfileHeader.css'

export default function ProfileHeader() {
  const { user } = useAuth()
  const [photoFailed, setPhotoFailed] = useState(false)

  useEffect(() => setPhotoFailed(false), [user?.photoURL])

  return (
    <header className="profile-header">
      <div className="profile-header__avatar">
        {user?.photoURL && !photoFailed ? (
          <img
            src={user.photoURL}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          <User size={36} strokeWidth={1.75} aria-hidden="true" />
        )}
      </div>
      <h1 className="profile-header__name">{user?.displayName || 'Google user'}</h1>
      {user?.email ? <p className="profile-header__email">{user.email}</p> : null}
    </header>
  )
}
