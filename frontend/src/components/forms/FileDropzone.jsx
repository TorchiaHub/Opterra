import { useState, useRef } from 'react'
import styles from './FileDropzone.module.css'

export function FileDropzone({ onFileSelect, accept, multiple = false }) {
  const [active, setActive] = useState(false)
  const inputRef = useRef(null)

  function handleDragOver(e) {
    e.preventDefault()
    setActive(true)
  }

  function handleDragLeave() {
    setActive(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setActive(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0 && onFileSelect) {
      onFileSelect(multiple ? files : files[0])
    }
  }

  function handleClick() {
    inputRef.current?.click()
  }

  function handleChange(e) {
    const files = Array.from(e.target.files)
    if (files.length > 0 && onFileSelect) {
      onFileSelect(multiple ? files : files[0])
    }
  }

  return (
    <div
      className={`${styles.dropzone} ${active ? styles.active : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <div className={styles.icon}>📄</div>
      <div className={styles.title}>Trascina file qui o clicca per caricare</div>
      <div className={styles.subtitle}>PDF, DOC, XLS, ZIP — Max 20MB</div>
      <input
        ref={inputRef}
        type="file"
        className={styles.hidden}
        onChange={handleChange}
        accept={accept}
        multiple={multiple}
      />
    </div>
  )
}
