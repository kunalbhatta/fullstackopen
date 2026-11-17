import React from 'react'

const Notification = ({ message }) => {
  if (!message) return null
  return <div className={message.kind === 'error' ? 'error' : 'success'} role="status">{message.text}</div>
}

export default Notification
