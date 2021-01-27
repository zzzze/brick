import React, { useState, useCallback } from 'react'
import { Config, Brick, EngineMode } from '@/types'
import Context, { RenderConfigForm } from '@/engine/context'
import BrickRenderer from '@/engine/brick-renderer'

interface EngineProps {
  config: Config | Config[] | null
  renderConfigForm?: RenderConfigForm
  mode?: EngineMode
}

interface EnginState {
  config: Config | Config[] | null
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
  renderConfigForm: RenderConfigForm = (node: JSX.Element) => {
    const [configFormVisible, setConfigFormVisible] = useState(false)
    const handleShowConfigForm = useCallback(() => {
      setConfigFormVisible(true)
    }, [])
    const handleHideConfigForm = useCallback(() => {
      setConfigFormVisible(false)
    }, [])
    return (
      <div>
        {configFormVisible ? (
          <button onClick={handleHideConfigForm}>close</button>
        ) : (
          <button onClick={handleShowConfigForm}>edit</button>
        )}
        {configFormVisible && node}
      </div>
    )
  }
  state: EnginState = {
    config: null,
  }
  static bricks: Record<string, Brick> = {}
  static registerBrick(brick: Brick): void {
    Engine.bricks[brick.name] = brick
  }
  handleSetState = (config: Config): void => {
    this.setState((state) => ({
      ...state,
      config,
    }))
  }
  render(): React.ReactNode {
    return (
      <Context.Provider value={{ renderConfigForm: this.renderConfigForm }}>
        {this.state.config &&
          Array.isArray(this.state.config) &&
          this.state.config.map((item) => (
            <BrickRenderer mode={this.mode} config={item} bricks={Engine.bricks} setState={this.handleSetState} />
          ))}
        {this.state.config && !Array.isArray(this.state.config) && (
          <BrickRenderer
            mode={this.mode}
            config={this.state.config}
            bricks={Engine.bricks}
            setState={this.handleSetState}
          />
        )}
      </Context.Provider>
    )
  }
}

export default Engine
