```tsx
import { Engine } from '@brick/engine'

const config = {
  name: 'View',
  _key: '001',
  supply: {
    data: {
      text: 'foo',
    },
  },
  children: [
    {
      name: 'View',
      _key: '002',
      children: [
        {
          name: 'Text',
          _key: '003',
          data: {
            content: '{{$global.text}}',
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
