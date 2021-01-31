```tsx
import Engine from '@/engine'

const config = {
  name: 'View',
  data: {
    name: 'bar',
  },
  supply: {
    data: {
      text: '{{$this.name}}',
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
