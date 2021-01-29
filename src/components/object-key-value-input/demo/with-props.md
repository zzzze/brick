```tsx
import ObjectKeyValueInput from '@/components/object-key-value-input'

const value = {
  foo: 'bar',
  baz: 123,
}

const handleChange = () => {}

ReactDOM.render(<ObjectKeyValueInput name="obj" value={value} onChange={handleChange} />, mountNode)
```
