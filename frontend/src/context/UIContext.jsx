import { createContext, useState, useCallback } from 'react'

export const UIContext = createContext(null)

export function UIProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [chatbotOpen, setChatbotOpen] = useState(false)
  const [toasts, setToasts] = useState([])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev)
  }, [])

  const toggleChatbot = useCallback(() => {
    setChatbotOpen(prev => !prev)
  }, [])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <UIContext.Provider value={{
      sidebarCollapsed,
      chatbotOpen,
      toasts,
      toggleSidebar,
      toggleChatbot,
      addToast,
      removeToast,
    }}>
      {children}
    </UIContext.Provider>
  )
}
