```tsx
import { Engine } from '@brick/engine'

const config = {
  name: 'ViewWithCustomRender',
  _key: '001',
  render: `instance => {
    return (
      <div>
        <span>foo</span>
        {instance.children}
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

ReactDOM.render(<Engine config={config} />, mountNode)
```
