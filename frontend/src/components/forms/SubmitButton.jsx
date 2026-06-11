import styles from './SubmitButton.module.css'

export function SubmitButton({
  children, loading = false, disabled = false,
  variant = 'primary', type = 'submit', onClick,
}) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[variant] || styles.primary}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <span className={styles.spinner} />}
      {children}
    </button>
  )
}
