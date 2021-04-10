import React, { ReactElement } from 'react'
import BrickWrapper from './brick-wrapper'
import BrickRenderer, { BrickRenderProps } from './brick-renderer'
import { Config, SetConfig } from './types'

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

  get config(): Config {
    return (this.props.children.props as BrickRenderProps).config
  }

  get parentConfig(): Config | undefined {
    return (this.props.children.props as BrickRenderProps).parentConfig
  }

  get isRoot(): boolean | undefined {
    return (this.props.children.props as BrickRenderProps).isRoot
  }

  get onRemoveItemFromParent(): ((key: string) => void) | undefined {
    return (this.props.children.props as BrickRenderProps).onRemoveItemFromParent
  }

  get onAddToOrMoveInParent(): ((config: Config, key: string, action: string) => void) | undefined {
    return (this.props.children.props as BrickRenderProps).onAddToOrMoveInParent
  }

  get setConfig(): SetConfig {
    return (this.props.children.props as BrickRenderProps).setConfig
  }

  render(): React.ReactNode {
    if (this.state.error) {
      return (
        <BrickWrapper
          key={this.config._key}
          onRemoveItemFormParent={this.onRemoveItemFromParent}
          onAddToOrMoveInParent={this.onAddToOrMoveInParent}
          config={this.config}
          isRoot={this.isRoot}
          parentConfig={this.parentConfig}
          onConfigChange={this.setConfig}>
          <pre>{String(this.state.error)}</pre>
        </BrickWrapper>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
