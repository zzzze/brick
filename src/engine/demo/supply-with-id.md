```tsx
import Engine from '@/engine'

const config = {
  name: 'View',
  id: 'node1',
  supply: {
    data: {
      text: 'foo',
    },
  },
  children: [
    {
      name: 'View',
      supply: {
        text: 'baz',
      },
      children: [
        {
          name: 'Text',
          data: {
            content: '{{node1.text}}',
          },
          version: '0.0.1',
        },
      ],
      version: '0.0.1',
    },
  ],
  version: '0.0.1',
}

ReactDOM.render(<Engine config={config} />, mountNode)
```
