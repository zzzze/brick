```tsx
import { Engine } from '@brick/engine'

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
        data: {
          text: 'baz',
        },
      },
      children: [
        {
          name: 'Text',
          data: {
            content: '{{$supply.$node1.text}}',
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
