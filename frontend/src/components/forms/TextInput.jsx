import styles from './TextInput.module.css'

export function TextInput({
  label, name, type = 'text', value, onChange, error,
  placeholder, required = false, disabled = false,
}) {
  return (
    <div className={styles.group}>
      {label && (
        <label className={styles.label} htmlFor={name}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={4}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
      )}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
