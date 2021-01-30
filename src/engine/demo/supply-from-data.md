```tsx
import Engine from '@/engine'

const config = {
  name: 'View',
  data: {
    name: 'bar',
  },
  supply: {
    text: '{{data.name}}',
  },
  children: [
    {
      name: 'View',
      children: [
        {
          name: 'Text',
          data: {
            content: '{{text}}',
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
