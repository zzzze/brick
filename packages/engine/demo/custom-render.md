```tsx
import { Engine } from '@brick/engine'

const config = {
  name: 'ViewWithCustomRender',
  render: {
    modules: {
      brickContainer: '@brick/engine/brick-containter',
    },
    func: `args => {
      const BrickContainer = modules.brickContainer.default
      return (
        <BrickContainer tag="div">
          <span>foo</span>
          {args.children}
        </BrickContainer>
      )
    }`,
  },
  children: [
    {
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
