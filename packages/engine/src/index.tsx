import React from 'react'
import { Config, Brick, EngineMode, SetConfigFn } from './types'
import Context, { RenderConfigurationForm } from './context'
import BrickRenderer from './brick-renderer'
import EventEmitter from 'eventemitter3'
import renderConfigurationForm from './render-configuration-form'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Diff from 'deep-diff'
import cloneDeep from 'lodash/cloneDeep'

const ee = new EventEmitter()

enum TransactionState {
  START = 'start',
  END = 'end',
}

export interface EngineProps {
  /**
   * Configuration for engine
   */
  config: Config | Config[] | null
  /**
   * Render configuration form of brick
   */
  renderConfigurationForm?: RenderConfigurationForm
  mode?: EngineMode
}

interface EngineState {
  config: Config | Config[] | null
}

/**
 * Engine render bricks according to the configuration
 */
class Engine extends React.Component<EngineProps, EngineState> {
  /**
   * static properties and methods
   */
  static bricks: Record<string, Brick> = {}
  static registerBrick(brick: Brick): void {
    Engine.bricks[brick.name] = brick
  }

  /**
   * constructor
   */
  constructor(props: EngineProps) {
    super(props)
    this.state = {
      config: props.config,
    }
    this._renderConfigurationForm = props.renderConfigurationForm || renderConfigurationForm
  }

  /**
   * state
   */
  state: EngineState = {
    config: null,
  }

  /**
   * inner properties
   */
  _transaction: TransactionState = TransactionState.END
  _configStage: Config | Config[] | null = null
  _backwardDiffs: Diff.Diff<Config | Config[] | null>[][] = []
  _forwardDiffs: Diff.Diff<Config | Config[] | null>[][] = []
  _isUndoRedo = false

  /**
   * lifecycle
   */
  componentDidMount(): void {
    document.addEventListener('keypress', this._handleKeyPress)
  }
  componentWillUnmount(): void {
    document.removeEventListener('keypress', this._handleKeyPress)
  }
  componentDidUpdate(_: EngineProps, prevState: EngineState): void {
    if (this._isUndoRedo) {
      return
    }
    const diff = Diff.diff(prevState.config, this.state.config)
    if (diff) {
      this._backwardDiffs.push(diff)
    }
  }

  /**
   * exposed methods
   */
  getConfig(): Config | Config[] | null {
    return this.state.config
  }
  undo(): void {
    this._undeOrRedo()
  }
  redo(): void {
    this._undeOrRedo(true)
  }

  /**
   * inner methods
   */
  _renderConfigurationForm: RenderConfigurationForm
  _handleSetConfig = (fn: SetConfigFn): void => {
    if (this._configStage == null) {
      this._configStage = this.state.config
    }
    this._configStage = fn(this._configStage as Config)
    if (this._transaction == TransactionState.END) {
      this._commitConfig()
    }
  }
  _transactionStart = (): void => {
    this._transaction = TransactionState.START
  }
  _transactionEnd = (): void => {
    this._transaction = TransactionState.END
    this._commitConfig()
  }
  _commitConfig = (): void => {
    this.setState(
      (state) => ({
        ...state,
        config: {
          ...(this._configStage as Config),
        },
      }),
      () => {
        this._forwardDiffs = []
        this._configStage = null
      }
    )
  }
  _handleSetConfigForArrayItem = (fn: SetConfigFn, key: string): void => {
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
  _undeOrRedo(redo = false): void {
    this._isUndoRedo = true
    let diffsStackA = this._backwardDiffs
    let diffsStackB = this._forwardDiffs
    if (redo) {
      diffsStackA = this._forwardDiffs
      diffsStackB = this._backwardDiffs
    }
    const diffs = diffsStackA.pop()
    if (diffs) {
      diffsStackB.push(diffs)
    }
    const config = cloneDeep(this.state.config)
    diffs?.forEach((diff) => {
      if (redo) {
        Diff.applyChange<Config | Config[] | null>(config, config, diff)
      } else {
        Diff.revertChange<Config | Config[] | null>(config, config, diff)
      }
    })
    this.setState(
      (state) => ({
        ...state,
        config,
      }),
      () => {
        this._isUndoRedo = false
      }
    )
  }
  _handleKeyPress = (event: KeyboardEvent): void => {
    if (!event.ctrlKey || event.key.toLowerCase() !== 'z') {
      return
    }
    this._undeOrRedo(event.shiftKey)
  }
  _handleRemoveFromParent = (key: string): void => {
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
  _handleAddToOrMoveInParent = (_config: Config, anchorKey: string, action: string): void => {
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

  /**
   * render
   */
  render(): React.ReactNode {
    return (
      <Context.Provider
        value={{
          renderConfigurationForm: this._renderConfigurationForm,
          bricks: Engine.bricks,
          ee,
          mode: this.props.mode || EngineMode.EDIT,
          transactionStart: this._transactionStart,
          transactionEnd: this._transactionEnd,
        }}>
        <DndProvider backend={HTML5Backend}>
          {this.state.config &&
            Array.isArray(this.state.config) &&
            this.state.config.map((item) => (
              <BrickRenderer
                key={item._key}
                onRemoveItemFromParent={this._handleRemoveFromParent}
                onAddToOrMoveInParent={this._handleAddToOrMoveInParent}
                supply={{ data: {}, actions: {} }}
                config={item}
                setConfig={(fn: SetConfigFn) => this._handleSetConfigForArrayItem(fn, item._key)}
              />
            ))}
          {this.state.config && !Array.isArray(this.state.config) && (
            <BrickRenderer
              supply={{ data: {}, actions: {} }}
              config={this.state.config}
              setConfig={this._handleSetConfig}
            />
          )}
        </DndProvider>
      </Context.Provider>
    )
  }
}

export { Engine }
