'use client'
import { useState, useEffect } from 'react'

function useSessionStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  const setValue = value => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const item = window.sessionStorage.getItem(key)
        setStoredValue(item ? JSON.parse(item) : initialValue)
      } catch (error) {
        console.error(error)
      }
    }

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange)

    // Polling every 500ms to check for changes
    const intervalId = setInterval(handleStorageChange, 500)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(intervalId)
    }
  }, [key, initialValue])

  return [storedValue, setValue]
}

export default useSessionStorage
