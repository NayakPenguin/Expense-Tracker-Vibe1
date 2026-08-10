import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProfileHeader from './ProfileHeader'

const authState = vi.hoisted(() => ({ user: null }))
vi.mock('../../context/AuthContext', () => ({ useAuth: () => authState }))

describe('ProfileHeader', () => {
  beforeEach(() => {
    authState.user = {
      displayName: 'Asha Singh',
      email: 'asha@example.com',
      photoURL: 'https://example.com/avatar.png',
    }
  })

  it('renders identity from the Google account', () => {
    render(<ProfileHeader />)
    expect(screen.getByRole('heading', { name: 'Asha Singh' })).toBeInTheDocument()
    expect(screen.getByText('asha@example.com')).toBeInTheDocument()
    expect(document.querySelector('img')).toHaveAttribute('src', authState.user.photoURL)
  })

  it('falls back when the Google photo cannot load', () => {
    render(<ProfileHeader />)
    fireEvent.error(document.querySelector('img'))
    expect(document.querySelector('img')).not.toBeInTheDocument()
  })
})
