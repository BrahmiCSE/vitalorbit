import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * useAsyncData — load data from a service function, optionally refreshing on a timer.
 *
 *   const { data, error, loading, updatedAt, refresh, mutate } = useAsyncData(fn, [dep], { intervalMs })
 *
 * - `fn` is called on mount, whenever a value in `deps` changes, and every `intervalMs`
 *   (polling pauses while the tab is hidden and resumes when it is shown again).
 * - `loading` is true only until the first result arrives (or after deps change).
 *   Later refreshes keep the previous `data` on screen.
 * - If a refresh fails but old data exists, both `data` and `error` are set so the UI can
 *   keep showing the last known values with a warning.
 * - `refresh()` forces a new request now and ignores any older request still in flight.
 * - `mutate(fn)` changes the current data locally (for example after an acknowledge click).
 * - `enabled: false` keeps the hook idle (data stays undefined, loading false).
 */
export default function useAsyncData(fetcher, deps = [], { intervalMs = 0, enabled = true } = {}) {
  const [state, setState] = useState({ data: undefined, error: null, loading: enabled, updatedAt: null })
  const fetcherRef = useRef(fetcher)
  const loadRef = useRef(null)

  useEffect(() => {
    fetcherRef.current = fetcher
  })

  useEffect(() => {
    if (!enabled) {
      loadRef.current = null
      setState({ data: undefined, error: null, loading: false, updatedAt: null })
      return undefined
    }

    let cancelled = false
    let inFlight = false
    let latest = 0
    setState({ data: undefined, error: null, loading: true, updatedAt: null })

    const load = async ({ force = false } = {}) => {
      if (inFlight && !force) return
      const mine = ++latest
      inFlight = true
      // A retry after a failed first load shows the loading state again.
      setState((prev) => (prev.data === undefined && !prev.loading ? { ...prev, loading: true, error: null } : prev))
      try {
        const data = await fetcherRef.current()
        if (!cancelled && mine === latest) setState({ data, error: null, loading: false, updatedAt: Date.now() })
      } catch (error) {
        if (!cancelled && mine === latest) setState((prev) => ({ ...prev, error, loading: false }))
      } finally {
        if (mine === latest) inFlight = false
      }
    }
    loadRef.current = load

    load()
    const timer = intervalMs > 0 ? setInterval(() => { if (!document.hidden) load() }, intervalMs) : null
    const onVisible = () => { if (!document.hidden) load() }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      if (timer) clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, intervalMs, enabled])

  const refresh = useCallback(() => loadRef.current?.({ force: true }), [])
  const mutate = useCallback((update) => {
    setState((prev) => (prev.data === undefined ? prev : { ...prev, data: update(prev.data) }))
  }, [])

  return { ...state, refresh, mutate }
}
