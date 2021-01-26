import React from 'react'
import Config from '@/interfaces/config'
import Brick from '@/interfaces/brick'
import { EngineMode } from '@/interfaces/engine'
import Context, { RenderConfigForm } from '@/engine/context'
import BrickRenderer from '@/engine/brick-renderer'

interface EngineProps {
  config: Config | null
  renderConfigForm?: (element: JSX.Element) => JSX.Element | null
  mode?: EngineMode
}

interface EnginState {
  config: Config | null
}

class Engine extends React.Component<EngineProps, EnginState> {
  constructor(props: EngineProps) {
    super(props)
    this.state = {
      config: props.config,
    }
    if (props.mode) {
      this.mode = props.mode
    }
    if (props.renderConfigForm) {
      this.renderConfigForm = props.renderConfigForm
    }
  }
  mode = EngineMode.EDIT
  renderConfigForm: RenderConfigForm = (element: JSX.Element) => element
  state: EnginState = {
    config: null,
  }
  bricks: Record<string, Brick> = {}
  registerBrick(brick: Brick): void {
    this.bricks[brick.name] = brick
  }
  handleSetState = (config: Config): void => {
    this.setState(state => ({
      ...state,
      config,
    }))
  }
  render(): JSX.Element {
    return (
      <Context.Provider value={{ renderConfigForm: this.renderConfigForm }}>
        {this.state.config && (
          <BrickRenderer mode={this.mode} config={this.state.config} bricks={this.bricks} setState={this.handleSetState} />
        )}
      </Context.Provider>
    )
  }
}

export default Engine
