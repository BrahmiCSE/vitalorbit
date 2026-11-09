// Single source of truth for health status. Matches docs/API_CONTRACT.md.
export const STATUS = {
  HEALTHY: 'healthy',
  WARNING: 'warning',
  EMERGENCY: 'emergency',
}

export const STATUS_STYLES = {
  healthy:   { label: 'Healthy',   text: 'text-healthy',   bg: 'bg-healthy-soft',   ring: 'ring-healthy/40',   glow: 'shadow-glow-healthy' },
  warning:   { label: 'Warning',   text: 'text-warning',   bg: 'bg-warning-soft',   ring: 'ring-warning/40',   glow: '' },
  emergency: { label: 'Emergency', text: 'text-emergency', bg: 'bg-emergency-soft', ring: 'ring-emergency/50', glow: 'shadow-glow-emergency' },
}
