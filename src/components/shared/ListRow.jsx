import './ListRow.css'

export default function ListRow({
  leading,
  bareLeading = false,
  title,
  subtitle,
  trailing,
  onClick,
  as,
}) {
  const Component = onClick ? 'button' : as || 'div'

  return (
    <Component
      className="list-row"
      type={onClick ? 'button' : undefined}
      onClick={onClick}
    >
      {leading ? (
        <div
          className={
            'list-row__leading' + (bareLeading ? ' list-row__leading--bare' : '')
          }
        >
          {leading}
        </div>
      ) : null}
      <div className="list-row__main">
        <div className="list-row__title">{title}</div>
        {subtitle ? <div className="list-row__subtitle">{subtitle}</div> : null}
      </div>
      {trailing ? <div className="list-row__trailing">{trailing}</div> : null}
    </Component>
  )
}
