import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import Todo from './Todo'

test('the todo shows its state and invokes its controls', () => {
  const todo = { _id: '1', text: 'Verify the container', done: false }
  const onToggle = vi.fn()
  const onDelete = vi.fn()
  render(<Todo todo={todo} onToggle={onToggle} onDelete={onDelete} />)
  const toggle = screen.getByRole('checkbox', { name: todo.text })
  expect(toggle.checked).toBe(false)
  fireEvent.click(toggle)
  fireEvent.click(screen.getByRole('button', { name: 'Delete Verify the container' }))
  expect(onToggle).toHaveBeenCalledWith(todo)
  expect(onDelete).toHaveBeenCalledWith(todo)
})
