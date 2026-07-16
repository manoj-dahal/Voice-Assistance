interface LogoProps {
  compact?: boolean
}

export function Logo({ compact = false }: LogoProps) {
  return (
    <div className="brand" aria-label="ERA, powered by Persona Voice AI OS">
      <div className="brand-mark" aria-hidden="true">
        <img src="/brand/era-vision-core.webp" alt="" />
      </div>
      {!compact && (
        <div className="brand-copy">
          <strong>ERA</strong>
          <span>powered by Persona OS</span>
        </div>
      )}
    </div>
  )
}
