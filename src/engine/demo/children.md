```tsx
import Engine from '@/engine'

const config = {
  name: 'View',
  children: [
    {
      name: 'Text',
      data: {
        content: 'hello',
      },
      version: '0.0.1',
    },
    {
      name: 'Text',
      data: {
        content: 'world',
      },
      version: '0.0.1',
    },
  ],
  version: '0.0.1',
}

ReactDOM.render(<Engine config={config} />, mountNode)
```
