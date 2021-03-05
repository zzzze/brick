```tsx
import { BrickContainer } from '@brick/components'

const Element = ({ children }) => {
  return (
    <div>
      <div>element</div>
      <div>{children}</div>
    </div>
  )
}

ReactDOM.render(<BrickContainer tag={Element}>hello world</BrickContainer>, mountNode)
```
