import { Link } from 'react-router-dom'

/**
 * Button — the only button style in the app.
 * Props: variant ('primary' | 'secondary' | 'danger' | 'ghost'),
 *        size ('sm' | 'md' | 'lg'), to (renders a router link instead of a <button>),
 *        className, children. Any other prop (onClick, disabled...) is passed through.
 */
const VARIANTS = {
  primary: 'bg-primary text-space hover:shadow-glow',
  secondary: 'border border-white/15 bg-white/5 text-ink hover:bg-white/10',
  danger: 'bg-emergency text-white hover:shadow-glow-emergency',
  ghost: 'text-ink-muted hover:bg-white/5 hover:text-ink',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({ variant = 'primary', size = 'md', to, className = '', children, ...rest }) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`

  if (to) {
    return <Link to={to} className={classes} {...rest}>{children}</Link>
  }
  return <button type="button" className={classes} {...rest}>{children}</button>
}
