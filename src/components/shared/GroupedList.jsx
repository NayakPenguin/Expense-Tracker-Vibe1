import './GroupedList.css'

/**
 * One card surface holding multiple rows, separated by hairline dividers
 * instead of each row being its own floating box. Rows inside should be
 * ListRow (or similarly-shaped markup) — this component only supplies the
 * outer surface and divider styling via descendant selectors.
 */
export default function GroupedList({ children, className }) {
  return (
    <div className={'grouped-list' + (className ? ` ${className}` : '')}>
      {children}
    </div>
  )
}
