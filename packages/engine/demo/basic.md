```tsx
import { Engine } from '@brick/engine'

const blueprint = {
  name: 'Text',
  _key: '001',
  data: {
    content: 'hello world',
  },
  version: '0.0.1',
}

const generateID = (rule, sheet) => {
  return `${sheet?.options.classNamePrefix ?? ''}${rule.key}`
}

ReactDOM.render(<Engine blueprint={blueprint} generateJssID={generateID} />, mountNode)
```
