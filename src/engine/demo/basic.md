```tsx
import Engine from '@/engine'

const config = {
  name: 'Text',
  data: {
    content: 'hello world',
  },
  version: '0.0.1',
}

ReactDOM.render(<Engine config={config} />, mountNode)
```