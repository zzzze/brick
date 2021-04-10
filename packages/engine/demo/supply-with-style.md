```tsx
import { Engine } from '@brick/engine'

const blueprint = {
  name: 'View',
  _key: '001',
  id: 'node1',
  data: {
    style: {
      color: 'red',
    },
  },
  supply: {
    data: {
      text: 'foo',
    },
  },
  children: [
    {
      name: 'View',
      _key: '002',
      supply: {
        data: {
          text: 'baz',
        },
      },
      children: [
        {
          name: 'Text',
          _key: '003',
          data: {
            content: '{{$node1.text}}',
          },
          version: '0.0.1',
        },
      ],
      version: '0.0.1',
    },
  ],
  version: '0.0.1',
}

ReactDOM.render(<Engine blueprint={blueprint} />, mountNode)
```
