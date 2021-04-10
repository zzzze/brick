import React, { ReactElement } from 'react'
import BrickWrapper from './brick-wrapper'
import BrickRenderer, { BrickRenderProps } from './brick-renderer'
import { Blueprint, SetBlueprint } from './types'

interface IErrorBoundaryProps {
  children: ReactElement<typeof BrickRenderer>
}

interface IErrorBoundaryState {
  error: Error | null
}

class ErrorBoundary extends React.Component<IErrorBoundaryProps, IErrorBoundaryState> {
  constructor(props: IErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  hasShowError = false

  componentDidCatch(error: Error): void {
    this.setState(
      {
        error: error,
      },
      () => {
        this.hasShowError = true
      }
    )
  }

  componentDidUpdate(): void {
    if (this.hasShowError) {
      this.hasShowError = false
      this.setState({
        error: null,
      })
    }
  }

  get blueprint(): Blueprint {
    return (this.props.children.props as BrickRenderProps).blueprint
  }

  get parentBlueprint(): Blueprint | undefined {
    return (this.props.children.props as BrickRenderProps).parentBlueprint
  }

  get isRoot(): boolean | undefined {
    return (this.props.children.props as BrickRenderProps).isRoot
  }

  get onRemoveItemFromParent(): ((key: string) => void) | undefined {
    return (this.props.children.props as BrickRenderProps).onRemoveItemFromParent
  }

  get onAddToOrMoveInParent(): ((blueprint: Blueprint, key: string, action: string) => void) | undefined {
    return (this.props.children.props as BrickRenderProps).onAddToOrMoveInParent
  }

  get setBlueprint(): SetBlueprint {
    return (this.props.children.props as BrickRenderProps).setBlueprint
  }

  render(): React.ReactNode {
    if (this.state.error) {
      return (
        <BrickWrapper
          key={this.blueprint._key}
          onRemoveItemFormParent={this.onRemoveItemFromParent}
          onAddToOrMoveInParent={this.onAddToOrMoveInParent}
          blueprint={this.blueprint}
          isRoot={this.isRoot}
          parentBlueprint={this.parentBlueprint}
          onBlueprintChange={this.setBlueprint}>
          <div className="error-boundary">{String(this.state.error)}</div>
        </BrickWrapper>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
