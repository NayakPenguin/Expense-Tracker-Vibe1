import { useState } from 'react'
import { User } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import './ProfileHeader.css'

export default function ProfileHeader() {
  const { user, updateUserName } = useAppData()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(user.name)

  const startEdit = () => {
    setValue(user.name)
    setEditing(true)
  }

  const save = () => {
    const trimmed = value.trim()
    if (trimmed) {
      updateUserName(trimmed)
    }
    setEditing(false)
  }

  return (
    <header className="profile-header">
      <div className="profile-header__avatar" aria-hidden="true">
        <User size={36} strokeWidth={1.75} />
      </div>

      {editing ? (
        <input
          className="profile-header__name-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save()
          }}
          autoFocus
        />
      ) : (
        <>
          <h1 className="profile-header__name">{user.name}</h1>
          <button type="button" className="profile-header__edit" onClick={startEdit}>
            Edit name →
          </button>
        </>
      )}
    </header>
  )
}
