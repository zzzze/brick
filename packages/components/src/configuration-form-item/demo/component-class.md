```tsx
import { BrickContainer } from '@brick/components'

class Element extends React.Component {
  render() {
    return (
      <div>
        <div>element</div>
        <span>{this.props.children}</span>
      </div>
    )
  }
}

ReactDOM.render(<BrickContainer tag={Element}>hello world</BrickContainer>, mountNode)
```
