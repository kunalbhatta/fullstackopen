import React from 'react'

const PersonForm = ({ onSubmit, newName, onNameChange, newNumber, onNumberChange }) => (
  <form onSubmit={onSubmit}>
    <div>name: <input aria-label="name" value={newName} onChange={onNameChange} /></div>
    <div>number: <input aria-label="number" value={newNumber} onChange={onNumberChange} /></div>
    <div><button type="submit">add</button></div>
  </form>
)

export default PersonForm
