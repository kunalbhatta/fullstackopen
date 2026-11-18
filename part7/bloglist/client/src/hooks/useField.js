import { useState } from 'react'

export default function useField(type) {
  const [value, setValue] = useState('')
  return {
    inputProps: {
      type,
      value,
      onChange: (event) => setValue(event.target.value),
    },
    reset: () => setValue(''),
  }
}
