```tsx
import { Engine } from '@brick/engine'

const config = {
  name: 'View',
  _key: '001',
  id: 'node1',
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
