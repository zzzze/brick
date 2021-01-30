import React, { useState, useCallback } from 'react'
import { Config, Brick, EngineMode, SetConfigFn } from '@/types'
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
          <button data-testid="close-btn" onClick={handleHideConfigForm}>
            close
          </button>
        ) : (
          <button data-testid="edit-btn" onClick={handleShowConfigForm}>
            edit
          </button>
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
  handleSetConfig = (fn: SetConfigFn): void => {
    this.setState((state) => {
      if (!state.config || Array.isArray(state.config)) {
        return state
      }
      return {
        ...state,
        config: {
          ...state.config,
          ...fn(state.config),
        },
      }
    })
  }
  handleSetConfigForArrayItem = (fn: SetConfigFn, index: number): void => {
    this.setState((state) => {
      if (!Array.isArray(state.config)) {
        return state
      }
      const config = state.config.slice()
      config.splice(index, 1, fn(config[index]))
      return {
        ...state,
        config: config,
      }
    })
  }
  render(): React.ReactNode {
    return (
      <Context.Provider
        value={{
          renderConfigForm: this.renderConfigForm,
          bricks: Engine.bricks,
        }}>
        {this.state.config &&
          Array.isArray(this.state.config) &&
          this.state.config.map((item, index) => (
            <BrickRenderer
              key={index}
              supply={{ data: {}, actions: {} }}
              mode={this.mode}
              config={item}
              setConfig={(fn: SetConfigFn) => this.handleSetConfigForArrayItem(fn, index)}
            />
          ))}
        {this.state.config && !Array.isArray(this.state.config) && (
          <BrickRenderer
            mode={this.mode}
            supply={{ data: {}, actions: {} }}
            config={this.state.config}
            setConfig={this.handleSetConfig}
          />
        )}
      </Context.Provider>
    )
  }
}

export default Engine
