```tsx
import { Engine } from '@brick/engine'

const config = {
  name: 'ViewWithCustomRender',
  _key: '001',
  render: `args => {
    const BrickContainer = require('@brick/components').BrickContainer
    return (
      <BrickContainer tag="div">
        <span>foo</span>
        {args.children}
      </BrickContainer>
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
