import Icon from '../Icon'
import styles from './Select.module.css'

export function Select({ label, name, value, onChange, options = [], placeholder, required = false }) {
  return (
    <div className={styles.group}>
      {label && (
        <label className={styles.label} htmlFor={name}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.selectWrapper}>
        <select
          id={name}
          name={name}
          className={styles.select}
          value={value}
          onChange={onChange}
          required={required}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className={styles.chevron}>
          <Icon name="chevronDown" size={16} />
        </span>
      </div>
    </div>
  )
}
