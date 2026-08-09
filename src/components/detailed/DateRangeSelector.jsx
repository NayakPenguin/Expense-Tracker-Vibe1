import Chip from '../shared/Chip'
import { RANGE_PRESETS } from '../../utils/dateRanges'
import './DateRangeSelector.css'

export default function DateRangeSelector({
  selected,
  onSelect,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
}) {
  return (
    <div className="date-range-selector">
      <div className="date-range-selector__chips">
        {RANGE_PRESETS.map((preset) => (
          <Chip
            key={preset.id}
            label={preset.label}
            active={selected === preset.id}
            onClick={() => onSelect(preset.id)}
          />
        ))}
      </div>

      {selected === 'custom' ? (
        <div className="date-range-selector__custom">
          <label className="date-range-selector__field">
            <span>Start</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => onCustomStartChange(e.target.value)}
            />
          </label>
          <label className="date-range-selector__field">
            <span>End</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => onCustomEndChange(e.target.value)}
            />
          </label>
        </div>
      ) : null}
    </div>
  )
}
