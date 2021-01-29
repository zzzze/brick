```tsx
import ObjectStringInput from '@/components/object-string-input'

const value = {
  foo: 'bar',
  baz: 123,
}

const handleChange = () => {}

ReactDOM.render(<ObjectStringInput name="obj" value={value} onChange={handleChange} />, mountNode)
```
