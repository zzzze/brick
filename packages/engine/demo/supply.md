```tsx
import { Engine } from '@brick/engine'

const config = {
  name: 'View',
  supply: {
    data: {
      text: 'foo',
    },
  },
  children: [
    {
      name: 'View',
      children: [
        {
          name: 'Text',
          data: {
            content: '{{$supply.text}}',
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
