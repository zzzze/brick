```tsx
import { Engine } from '@brick/engine'

const blueprint = {
  name: 'ViewWithCustomRender',
  _key: '001',
  render: `function() {
    return (
      <div>
        <span>foo</span>
        {this.children}
      </div>
    )
  }`,
  children: [
    {
      _key: '002',
      name: 'Text',
      data: {
        content: 'bar',
      },
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
