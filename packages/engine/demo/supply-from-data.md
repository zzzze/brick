```tsx
import { Engine } from '@brick/engine'

const blueprint = {
  name: 'View',
  _key: '001',
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

const generateID = (rule, sheet) => {
  return `${sheet?.options.classNamePrefix ?? ''}${rule.key}`
}

ReactDOM.render(<Engine blueprint={blueprint} generateJssID={generateID} />, mountNode)
```
