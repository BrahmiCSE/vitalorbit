import { useEffect, useState } from 'react'

// useNow — returns the current time in ms and re-renders every `intervalMs`.
// Used for clocks and "5 min ago" labels so they stay fresh without new data.
export default function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
