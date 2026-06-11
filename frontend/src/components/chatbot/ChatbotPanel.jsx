import { useContext, useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { UIContext } from '../../context/UIContext'
import { getChatSessions, createChatSession, getChatMessages, sendChatMessage } from '../../api/chat.api'
import Icon from '../Icon'
import styles from './ChatbotPanel.module.css'

export function ChatbotPanel() {
  const { t } = useTranslation()
  const { chatbotOpen, toggleChatbot } = useContext(UIContext)
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)

  const initSession = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      let sessions = await getChatSessions()
      if (!Array.isArray(sessions) || sessions.length === 0) {
        sessions = await createChatSession({ title: 'Nuova chat' })
      }
      const current = Array.isArray(sessions) ? sessions[0] : null
      if (!current) throw new Error(t('chatbot.loadError'))
      setSessionId(current.id)
      const msgs = await getChatMessages(current.id)
      setMessages(Array.isArray(msgs) ? msgs : [])
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message)
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (chatbotOpen && !sessionId) {
      initSession()
    }
  }, [chatbotOpen, sessionId, initSession])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || !sessionId || sending) return
    setInput('')
    setSending(true)
    setError(null)
    setMessages(prev => [...prev, { id: `tmp-${Date.now()}`, sender_type: 'user', message_text: text }])
    try {
      const result = await sendChatMessage(sessionId, { text })
      if (Array.isArray(result?.messages)) {
        setMessages(result.messages)
      }
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message)
    } finally {
      setSending(false)
    }
  }

  if (!chatbotOpen) return null

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <span className={styles.headerIcon}>
            <Icon name="sparkles" size={18} />
          </span>
          <div>
            <div className={styles.title}>{t('chatbot.title')}</div>
            <div className={styles.subtitle}>{t('chatbot.subtitle')}</div>
          </div>
        </div>
        <button className={styles.closeBtn} onClick={toggleChatbot} aria-label={t('chatbot.close')}>
          <Icon name="x" size={18} />
        </button>
      </div>

      <div className={styles.messages}>
        {loading && <div className={styles.info}>{t('common.loading')}</div>}
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`${styles.message} ${msg.sender_type === 'user' ? styles.messageUser : styles.messageBot}`}
          >
            {msg.message_text}
          </div>
        ))}
        {sending && <div className={styles.info}>{t('chatbot.thinking')}</div>}
        {error && <div className={styles.error}>{error}</div>}
        <div ref={bottomRef} />
      </div>

      <form className={styles.inputBar} onSubmit={handleSend}>
        <input
          type="text"
          className={styles.input}
          placeholder={t('chatbot.placeholder')}
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading || !!error && !sessionId}
        />
        <button type="submit" className={styles.sendBtn} disabled={sending || !input.trim()} aria-label={t('chatbot.send')}>
          <Icon name="send" size={16} />
        </button>
      </form>
    </div>
  )
}
