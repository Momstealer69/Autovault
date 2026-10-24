import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Eye, EyeOff, Gamepad2 } from 'lucide-react'

type AuthTab = 'signin' | 'join'
type AuthStage = 'form' | 'loading' | 'success' | 'dashboard'
type SocialProvider = 'Google' | 'Apple' | 'X' | 'Discord'
type AuthPrototypeProps = { background: ReactNode; initialTab: AuthTab }

function SocialIcon({ provider }: { provider: SocialProvider }) {
  if (provider === 'Google') return <span className="auth-social-google" aria-hidden="true">G</span>
  if (provider === 'Discord') return <Gamepad2 size={18} strokeWidth={2.4} aria-hidden="true" />
  if (provider === 'Apple') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.4 12.6c0-2 1.6-3 1.7-3.1-.9-1.4-2.3-1.6-2.8-1.6-1.2-.1-2.3.7-2.9.7-.6 0-1.5-.7-2.5-.7-1.3 0-2.6.8-3.3 2-1.4 2.5-.4 6.1 1 8.1.7 1 1.5 2.1 2.5 2 1-.1 1.4-.6 2.7-.6 1.2 0 1.6.6 2.7.6 1.1 0 1.8-1 2.4-2 .8-1.1 1.1-2.2 1.1-2.3-.1 0-2.6-1-2.6-3.9ZM14.4 6.6c.5-.7.9-1.7.8-2.6-.8 0-1.8.5-2.4 1.2-.5.6-.9 1.6-.8 2.5.9.1 1.8-.4 2.4-1.1Z" /></svg>
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2.5h3.3L15 10.7l8.5 11h-6.6L11.7 14l-6 7.7H2.4l7.7-8.8L2 2.5h6.8l4.7 6.8ZM17.8 19.8h1.8L7.4 4.3H5.5z" /></svg>
}

function GlassField({ label, value, onChange, placeholder, type = 'text', autoComplete = 'off', reveal, onToggleReveal }: {
  label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string; autoComplete?: string; reveal?: boolean; onToggleReveal?: () => void
}) {
  const id = `auth-${label.toLowerCase().replace(/\s+/g, '-')}`
  const isPassword = type === 'password' || reveal !== undefined
  return <div className="auth-glass-field"><label htmlFor={id}>{label}</label><span className="auth-glass-input-wrap"><input id={id} type={isPassword && reveal ? 'text' : type} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} autoComplete={autoComplete} spellCheck={false} />{onToggleReveal && <button className="auth-eye-toggle" type="button" onClick={onToggleReveal} aria-label={reveal ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}>{reveal ? <EyeOff size={13} /> : <Eye size={13} />}</button>}</span></div>
}

export default function AuthPrototype({ background, initialTab }: AuthPrototypeProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [tab, setTab] = useState<AuthTab>(initialTab)
  const [stage, setStage] = useState<AuthStage>('form')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [displayName, setDisplayName] = useState('Driver')
  const [closing, setClosing] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => { setTab(location.pathname === '/signup' ? 'join' : initialTab) }, [initialTab, location.pathname])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  function simulateDemo(successMessage: string, userName: string) {
    setError('')
    setPassword('')
    setConfirm('')
    setDisplayName(userName || 'Driver')
    setMessage(successMessage)
    setStage('loading')
    timers.current.push(setTimeout(() => {
      setStage('success')
      timers.current.push(setTimeout(() => setStage('dashboard'), 650))
    }, 850))
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!email.trim() || !password) { setError('Enter your email and password to continue.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Enter a valid email address.'); return }
    if (tab === 'join') {
      if (!name.trim()) { setError('Enter your name to create a demo account.'); return }
      if (!confirm) { setError('Confirm your password to continue.'); return }
      if (password !== confirm) { setError('Those passwords don’t match.'); return }
    }
    const userName = tab === 'join' ? name.trim() : email.split('@')[0].replace(/[._-]/g, ' ')
    const success = tab === 'join' ? 'Account created — Demo Mode' : 'Welcome back!'
    setPassword('')
    setConfirm('')
    simulateDemo(success, userName)
  }

  function switchTab(next: AuthTab) { setTab(next); setError(''); setStage('form') }
  function closeModal() { setClosing(true); timers.current.push(setTimeout(() => navigate('/discover'), 280)) }
  function logout() {
    setStage('form'); setTab('signin'); setName(''); setEmail(''); setPassword(''); setConfirm(''); setError(''); setMessage('')
    navigate('/login', { replace: true })
  }

  return <main className={`auth-screen${closing ? ' auth-screen-closing' : ''}`}>
    <div className="auth-site-preview" aria-hidden="true" inert>{background}</div>
    <div className="auth-screen-shade" />
    <div className="auth-car-scene" aria-hidden="true"><span className="auth-car-light-sweep" /></div>
    <div className="auth-screen-grain" aria-hidden="true" />
    <section className={`auth-glass-card auth-card-${tab} auth-stage-${stage}${closing ? ' is-closing' : ''}`} aria-label="Prototype authentication">
      <div className="auth-card-inner-glow" />
      {stage === 'dashboard' ? <div className="auth-demo-dashboard"><span className="auth-demo-kicker"><i /> PROTOTYPE MODE</span><div className="auth-dashboard-icon"><Check size={22} /></div><h1>Welcome back, <em>{displayName}</em></h1><p>You’re signed in to the AutoVault demo experience.</p><button className="auth-primary-button" onClick={() => navigate('/garage')}>Explore your garage <ArrowRight size={15} /></button><button className="auth-logout-button" onClick={logout}>Log out</button><small>Prototype • Demo Authentication</small></div> : <>
        <header className="auth-card-header"><nav className="auth-tabs" aria-label="Authentication"><button className={tab === 'signin' ? 'active' : ''} onClick={() => switchTab('signin')} aria-current={tab === 'signin' ? 'page' : undefined}>Sign In</button><button className={tab === 'join' ? 'active' : ''} onClick={() => switchTab('join')} aria-current={tab === 'join' ? 'page' : undefined}>Join</button></nav><button className="auth-close-button" type="button" onClick={closeModal} aria-label="Close authentication">×</button></header>
        {stage === 'form' ? <div className={`auth-form-area auth-form-area-${tab}`} key={tab}><form className="auth-demo-form" onSubmit={submitForm} noValidate>{tab === 'join' && <GlassField label="Name" value={name} onChange={setName} placeholder="Your name" />}<GlassField label="Email" value={email} onChange={setEmail} placeholder="hey@vincosta" type="email" autoComplete="off" /><GlassField label="Password" value={password} onChange={setPassword} placeholder="At least 12 symbols..." type="password" reveal={passwordVisible} onToggleReveal={() => setPasswordVisible(value => !value)} />{tab === 'join' && <GlassField label="Confirm Password" value={confirm} onChange={setConfirm} placeholder="Repeat your password" type="password" reveal={confirmVisible} onToggleReveal={() => setConfirmVisible(value => !value)} />}{error && <p className="auth-validation-message" role="alert">{error}</p>}<button className="auth-primary-button" type="submit">{tab === 'join' ? 'Create Account' : 'Sign In'} <ArrowRight size={15} /></button></form><div className="auth-social-section"><span className="auth-social-divider"><i />or continue with<i /></span><div className="auth-social-buttons">{(['Google', 'Apple', 'X', 'Discord'] as SocialProvider[]).map(provider => <button key={provider} type="button" className={`auth-social-button auth-social-${provider.toLowerCase()}`} onClick={() => simulateDemo('Demo login successful', provider === 'Google' ? 'Alex Driver' : 'AutoVault Driver')} aria-label={`Demo sign in with ${provider}`} title={`${provider} demo sign in`}><SocialIcon provider={provider} /></button>)}</div></div><small className="auth-demo-caption">Prototype • Demo Authentication</small></div> : <div className={`auth-progress-state auth-progress-${stage}`} aria-live="polite" role="status">{stage === 'loading' ? <span className="auth-loading-ring" /> : <span className="auth-success-icon"><Check size={19} /></span>}<strong>{stage === 'loading' ? (tab === 'join' ? 'Creating account...' : message.includes('Demo login') ? 'Connecting in demo mode...' : 'Signing in...') : message}</strong><small>{stage === 'loading' ? 'Prototype preview · nothing is sent or saved' : 'Opening your prototype...'}</small></div>}
      </>}
    </section>
  </main>
}
