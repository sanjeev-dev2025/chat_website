/**
 * ConnectionStatus.jsx — Small pill showing WebSocket connection state
 */
import { WS_STATUS } from '../services/websocket.js'

const STATUS_CONFIG = {
  [WS_STATUS.CONNECTED]:    { label: 'Connected',    cssClass: 'connected' },
  [WS_STATUS.CONNECTING]:   { label: 'Connecting…',  cssClass: 'connecting' },
  [WS_STATUS.DISCONNECTED]: { label: 'Disconnected', cssClass: 'disconnected' },
}

export default function ConnectionStatus({ status }) {
  const { label, cssClass } = STATUS_CONFIG[status] ?? STATUS_CONFIG[WS_STATUS.DISCONNECTED]

  return (
    <span
      className={`status-pill ${cssClass}`}
      role="status"
      aria-live="polite"
      aria-label={`Connection status: ${label}`}
    >
      <span className="status-dot" aria-hidden="true" />
      {label}
    </span>
  )
}
