```tsx
import Engine from '@/engine'

const config = [
  {
    name: 'Text',
    props: {
      content: 'hello',
    },
    version: '0.0.1',
  },
  {
    name: 'Text',
    props: {
      content: 'world',
    },
    version: '0.0.1',
  },
  {
    name: 'View',
    children: [
      {
        name: 'Text',
        props: {
          content: 'hello',
        },
        version: '0.0.1',
      },
      {
        name: 'Text',
        props: {
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
