import styles from './Select.module.css'

export function Select({ label, name, value, onChange, options = [], placeholder, required = false }) {
  return (
    <div className={styles.group}>
      {label && (
        <label className={styles.label} htmlFor={name}>
          {label}
          {required && <span style={{ color: 'var(--color-danger)', marginLeft: 2 }}>*</span>}
        </label>
      )}
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
    </div>
  )
}
