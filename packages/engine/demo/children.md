```tsx
import { Engine } from '@brick/engine'

const config = {
  name: 'View',
  _key: '001',
  children: [
    {
      name: 'Text',
      _key: '002',
      data: {
        content: 'hello',
      },
      version: '0.0.1',
    },
    {
      name: 'Text',
      _key: '003',
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
