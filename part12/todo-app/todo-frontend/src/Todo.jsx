export default function Todo({ todo, onToggle, onDelete }) {
  return <li>
    <label><input type="checkbox" checked={todo.done} onChange={() => onToggle(todo)} /> {todo.text}</label>
    <button type="button" aria-label={`Delete ${todo.text}`} onClick={() => onDelete(todo)}>Delete</button>
  </li>
}
