import React, { useEffect, useRef, useState } from 'react'
import personService from './services/persons'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import Notification from './components/Notification'
import './styles.css'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [message, setMessage] = useState(null)
  const messageTimer = useRef(null)

  const notify = (text, kind = 'success') => {
    setMessage({ text, kind })
    if (messageTimer.current) window.clearTimeout(messageTimer.current)
    messageTimer.current = window.setTimeout(() => setMessage(null), 5000)
  }

  useEffect(() => {
    personService.getAll()
      .then(initialPersons => setPersons(initialPersons))
      .catch(() => notify('Failed to load the phonebook', 'error'))
    return () => {
      if (messageTimer.current) window.clearTimeout(messageTimer.current)
    }
  }, [])

  const addPerson = async event => {
    event.preventDefault()
    const name = newName.trim()
    const number = newNumber.trim()
    if (!name || !number) return

    const existing = persons.find(person => person.name.toLowerCase() === name.toLowerCase())
    if (existing) {
      if (!window.confirm(`${existing.name} is already added to phonebook, replace the old number with a new one?`)) return
      try {
        const updated = await personService.update(existing.id, { ...existing, number })
        setPersons(current => current.map(person => person.id === existing.id ? updated : person))
        setNewName('')
        setNewNumber('')
        notify(`Updated ${existing.name}'s number`)
      } catch (error) {
        if (error.response?.status === 404) {
          setPersons(current => current.filter(person => person.id !== existing.id))
          notify(`Information of ${existing.name} has already been removed from server`, 'error')
        } else {
          notify(error.response?.data?.error || `Could not update ${existing.name}`, 'error')
        }
      }
      return
    }

    try {
      const created = await personService.create({ name, number })
      setPersons(current => current.concat(created))
      setNewName('')
      setNewNumber('')
      notify(`Added ${name}`)
    } catch (error) {
      notify(error.response?.data?.error || `Could not add ${name}`, 'error')
    }
  }

  const deletePerson = async person => {
    if (!window.confirm(`Delete ${person.name}?`)) return
    try {
      await personService.remove(person.id)
      setPersons(current => current.filter(p => p.id !== person.id))
      notify(`Deleted ${person.name}`)
    } catch (error) {
      if (error.response?.status === 404) {
        setPersons(current => current.filter(p => p.id !== person.id))
        notify(`Information of ${person.name} has already been removed from server`, 'error')
      } else {
        notify(`Could not delete ${person.name}`, 'error')
      }
    }
  }

  const shownPersons = persons.filter(person => person.name.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} />
      <Filter value={filter} onChange={event => setFilter(event.target.value)} />
      <h3>Add a new</h3>
      <PersonForm
        onSubmit={addPerson}
        newName={newName}
        onNameChange={event => setNewName(event.target.value)}
        newNumber={newNumber}
        onNumberChange={event => setNewNumber(event.target.value)}
      />
      <h3>Numbers</h3>
      <Persons persons={shownPersons} onDelete={deletePerson} />
    </div>
  )
}

export default App
