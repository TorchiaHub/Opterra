import styles from './ConfirmModal.module.css'

export function ConfirmModal({
  open,
  title = 'Conferma azione',
  message = 'Sei sicuro di voler procedere?',
  confirmLabel = 'Conferma',
  cancelLabel = 'Annulla',
  icon = '⚠️',
  onConfirm,
  onCancel,
  danger = true,
}) {
  if (!open) return null

  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.icon}>{icon}</div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={onCancel}>{cancelLabel}</button>
          <button className={styles.btnConfirm} onClick={onConfirm}
            style={!danger ? { background: 'var(--color-teal-500)' } : {}}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
