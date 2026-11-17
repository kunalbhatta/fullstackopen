import React from 'react'

const Persons = ({ persons, onDelete }) => (
  <div>
    {persons.map(person => (
      <div key={person.id}>
        {person.name} {person.number}{' '}
        <button onClick={() => onDelete(person)} type="button">delete</button>
      </div>
    ))}
  </div>
)

export default Persons
