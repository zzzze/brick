```tsx
import { Engine } from '@brick/engine'

const config = [
  {
    name: 'Text',
    _key: '001',
    data: {
      content: 'hello',
    },
    version: '0.0.1',
  },
  {
    name: 'Text',
    _key: '002',
    data: {
      content: 'world',
    },
    version: '0.0.1',
  },
  {
    name: 'View',
    _key: '003',
    children: [
      {
        name: 'Text',
        _key: '004',
        data: {
          content: 'hello',
        },
        version: '0.0.1',
      },
      {
        name: 'Text',
        _key: '005',
        data: {
          content: 'world',
        },
        version: '0.0.1',
      },
    ],
    version: '0.0.1',
  },
]

ReactDOM.render(<Engine config={config} />, mountNode)
```
