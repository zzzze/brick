import React, { useState, useCallback } from 'react'
import { Config, Brick, EngineMode } from '@/types'
import Context, { RenderConfigForm } from '@/engine/context'
import BrickRenderer from '@/engine/brick-renderer'

interface EngineProps {
  config: Config | Config[] | null
  renderConfigForm?: RenderConfigForm
  mode?: EngineMode
}

interface EngineState {
  config: Config | Config[] | null
}

class Engine extends React.Component<EngineProps, EngineState> {
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
  getConfig(): Config | Config[] | null {
    return this.state.config
  }
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
  state: EngineState = {
    config: null,
  }
  static bricks: Record<string, Brick> = {}
  static registerBrick(brick: Brick): void {
    Engine.bricks[brick.name] = brick
  }
  handleSetConfig = (fn: (config: Readonly<Config>) => Config): void => {
    this.setState((state) => ({
      ...state,
      config: {
        ...state.config,
        ...fn(state.config as Config),
      },
    }))
  }
  handleSetConfigForArrayItem = (fn: (config: Readonly<Config>) => Config, index: number): void => {
    this.setState((state) => {
      const config = (state.config as Config[]).slice()
      config.splice(index, 1, fn(config[index]))
      return {
        ...state,
        config: config,
      }
    })
  }
  render(): React.ReactNode {
    return (
      <Context.Provider value={{ renderConfigForm: this.renderConfigForm }}>
        {this.state.config &&
          Array.isArray(this.state.config) &&
          this.state.config.map((item, index) => (
            <BrickRenderer
              key={index}
              mode={this.mode}
              config={item}
              bricks={Engine.bricks}
              setConfig={(fn: (config: Readonly<Config>) => Config) => this.handleSetConfigForArrayItem(fn, index)}
            />
          ))}
        {this.state.config && !Array.isArray(this.state.config) && (
          <BrickRenderer
            mode={this.mode}
            config={this.state.config}
            bricks={Engine.bricks}
            setConfig={this.handleSetConfig}
          />
        )}
      </Context.Provider>
    )
  }
}

export default Engine
