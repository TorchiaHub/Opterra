import Icon from '../Icon'
import styles from './FilterBar.module.css'

export function FilterBar({
  searchValue = '',
  onSearchChange,
  filters = [],
  onClear,
  searchPlaceholder = 'Cerca...',
}) {
  return (
    <div className={styles.bar}>
      <div className={styles.search}>
        <span className={styles.searchIcon}>
          <Icon name="search" size={16} />
        </span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      {filters.map((filter, i) => (
        <select
          key={i}
          className={styles.select}
          value={filter.value}
          onChange={e => filter.onChange(e.target.value)}
        >
          <option value="">{filter.placeholder}</option>
          {filter.options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ))}
      {onClear && (
        <button className={styles.clearBtn} onClick={onClear}>
          <Icon name="close" size={14} />
          <span>Azzera filtri</span>
        </button>
      )}
    </div>
  )
}
