import { Link2, LockKeyhole, Phone, ShieldCheck, WifiOff } from 'lucide-react'

export function PhoneView() {
  return (
    <div className="reference-secondary-page phone-page">
      <header><span><Phone size={16} /> Device bridge</span><h1>Phone</h1><p>Pair a future mobile companion without pretending a device is already connected.</p></header>
      <div className="phone-pairing-layout">
        <section className="phone-silhouette">
          <div className="phone-speaker" />
          <div className="phone-screen">
            <div className="pairing-rings"><span /><span /><Link2 size={25} /></div>
            <strong>NO DEVICE PAIRED</strong>
            <small>Mobile bridge is a roadmap adapter</small>
          </div>
        </section>
        <section className="pairing-details">
          <div className="pairing-status"><WifiOff size={16} /><div><strong>Bridge offline</strong><span>No mobile connector is running.</span></div></div>
          <h2>Secure pairing requirements</h2>
          <ul>
            <li><ShieldCheck size={14} /> One-time pairing code displayed on both devices</li>
            <li><LockKeyhole size={14} /> End-to-end encrypted session keys</li>
            <li><Phone size={14} /> Per-capability permissions and instant revocation</li>
          </ul>
          <button type="button" disabled>PAIRING NOT YET AVAILABLE</button>
        </section>
      </div>
    </div>
  )
}
