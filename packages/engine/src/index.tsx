import React from 'react'
import { Config, Brick, EngineMode, SetConfigFn } from './types'
import Context, { RenderConfigForm } from './context'
import BrickRenderer from './brick-renderer'
import EventEmitter from 'eventemitter3'
import renderConfigForm from './render-config-form'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

const ee = new EventEmitter()

export interface EngineProps {
  /**
   * Configuration for engine
   */
  config: Config | Config[] | null
  /**
   * Render configuration form of brick
   */
  renderConfigForm?: RenderConfigForm
  mode?: EngineMode
}

interface EngineState {
  config: Config | Config[] | null
}

/**
 * Engine render bricks according to the configuration
 */
class Engine extends React.Component<EngineProps, EngineState> {
  constructor(props: EngineProps) {
    super(props)
    this.state = {
      config: props.config,
    }
    this.renderConfigForm = props.renderConfigForm || renderConfigForm
  }
  getConfig(): Config | Config[] | null {
    return this.state.config
  }
  renderConfigForm: RenderConfigForm
  state: EngineState = {
    config: null,
  }
  static bricks: Record<string, Brick> = {}
  static registerBrick(brick: Brick): void {
    Engine.bricks[brick.name] = brick
  }
  handleSetConfig = (fn: SetConfigFn, cb?: () => void): void => {
    this.setState((state) => {
      if (!state.config || Array.isArray(state.config)) {
        return state
      }
      const newState = {
        ...state,
        config: {
          ...fn(state.config),
        },
      }
      return newState
    }, cb)
  }
  handleSetConfigForArrayItem = (fn: SetConfigFn, key: string): void => {
    this.setState((state) => {
      if (!Array.isArray(state.config)) {
        return state
      }
      const config = state.config.map((child) => {
        if (child._key !== key) {
          return child
        } else {
          return fn({ ...child })
        }
      })
      return {
        ...state,
        config: config,
      }
    })
  }
  handleRemoveFromParent = (key: string): void => {
    this.setState((state) => {
      if (!state.config || !Array.isArray(state.config)) {
        return state
      }
      return {
        ...state,
        config: state.config.filter((item) => item._key !== key),
      }
    })
  }
  handleAddToOrMoveInParent = (_config: Config, anchorKey: string, action: string): void => {
    this.setState((state) => {
      if (!state.config || !Array.isArray(state.config)) {
        return state
      }
      const config = state.config.filter((c) => c._key !== _config._key)
      let anchorIndex = -1
      for (let i = 0; i < config.length; i++) {
        if (config[i]._key === anchorKey) {
          anchorIndex = i
          break
        }
      }
      if (anchorIndex === -1) {
        throw Error(`anchor node not found (key: ${anchorKey})`)
      }
      const insertIndex = action === 'forward' ? anchorIndex : anchorIndex + 1
      config.splice(insertIndex, 0, _config)
      return {
        ...state,
        config,
      }
    })
  }
  render(): React.ReactNode {
    return (
      <Context.Provider
        value={{
          renderConfigForm: this.renderConfigForm,
          bricks: Engine.bricks,
          ee,
          mode: this.props.mode || EngineMode.EDIT,
        }}>
        <DndProvider backend={HTML5Backend}>
          {this.state.config &&
            Array.isArray(this.state.config) &&
            this.state.config.map((item) => (
              <BrickRenderer
                key={item._key}
                onRemoveItemFromParent={this.handleRemoveFromParent}
                onAddToOrMoveInParent={this.handleAddToOrMoveInParent}
                supply={{ data: {}, actions: {} }}
                config={item}
                setConfig={(fn: SetConfigFn) => this.handleSetConfigForArrayItem(fn, item._key)}
              />
            ))}
          {this.state.config && !Array.isArray(this.state.config) && (
            <BrickRenderer
              supply={{ data: {}, actions: {} }}
              config={this.state.config}
              setConfig={this.handleSetConfig}
            />
          )}
        </DndProvider>
      </Context.Provider>
    )
  }
}

export { Engine }
