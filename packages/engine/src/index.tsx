import React from 'react'
import { Config, Brick, SetConfigFn } from './types'
import EnginxContext, { RenderConfigurationForm } from './context'
import BrickRenderer from './brick-renderer'
import EventEmitter from 'eventemitter3'
import renderConfigurationForm from './render-configuration-form'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Diff from 'deep-diff'
import cloneDeep from 'lodash/cloneDeep'
import { DataType } from './data/data-type'

const ee = new EventEmitter()

enum TransactionState {
  START = 'start',
  END = 'end',
}

export interface EngineProps {
  /**
   * Configuration for engine
   */
  config: Config | null
  /**
   * Render configuration form of brick
   */
  renderConfigurationForm?: RenderConfigurationForm
  previewMode?: boolean
  autoCommitMode?: boolean
}

interface EngineState {
  config: Config | null
}

/**
 * Engine render bricks according to the configuration
 */
class Engine extends React.Component<EngineProps, EngineState> {
  /**
   * static properties and methods
   */
  static bricks: Record<string, Brick> = {}
  static dataTypes: Record<string, DataType> = {}
  static registerBrick(brick: Brick): void {
    Engine.bricks[brick.name] = brick
  }
  static registerDataType(dataType: DataType): void {
    Engine.dataTypes[dataType.type] = dataType
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
  _stagingConfig: Config | null = null
  _backwardDiffs: Diff.Diff<Config | null>[][] = []
  _forwardDiffs: Diff.Diff<Config | null>[][] = []
  _isUndoRedo = false

  /**
   * lifecycle
   */
  componentDidMount(): void {
    document.onkeydown = this._handleKeyPress
  }
  componentWillUnmount(): void {
    document.onkeydown = null
  }
  componentDidUpdate(_: EngineProps, prevState: EngineState): void {
    if (this.props.autoCommitMode) {
      this._transactionCommit()
    }
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
  getConfig(): Config | null {
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
    if (this._stagingConfig == null) {
      this._stagingConfig = this.state.config
    }
    this._stagingConfig = fn(this._stagingConfig as Config)
    if (this._transaction == TransactionState.END) {
      this._commitConfig()
    }
  }
  _transactionBegin = (): void => {
    this._commitConfig()
    this._transaction = TransactionState.START
  }
  _transactionCommit = (): void => {
    this._transaction = TransactionState.END
    this._commitConfig()
  }
  _transactionRollback = (): void => {
    this._stagingConfig = null
  }
  _commitConfig = (): void => {
    if (!this._stagingConfig) {
      return
    }
    const stagingConfig = this._stagingConfig
    this.setState(
      (state) => {
        return {
          ...state,
          config: {
            ...stagingConfig,
          },
        }
      },
      () => {
        this._forwardDiffs = []
        this._stagingConfig = null
      }
    )
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
        Diff.applyChange<Config | null>(config, config, diff)
      } else {
        Diff.revertChange<Config | null>(config, config, diff)
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
  _handleKeyPress = (event: KeyboardEvent): boolean => {
    if (!event.ctrlKey || event.key.toLowerCase() !== 'z') {
      return true
    }
    this._undeOrRedo(event.shiftKey)
    return false
  }

  /**
   * render
   */
  render(): React.ReactNode {
    if (!this.props.autoCommitMode) {
      this._transaction = TransactionState.START
    }
    return (
      <EnginxContext.Provider
        value={{
          renderConfigurationForm: this._renderConfigurationForm,
          bricks: Engine.bricks,
          dataTypes: Engine.dataTypes,
          ee,
          previewMode: !!this.props.previewMode,
          transactionBegin: this._transactionBegin,
          transactionCommit: this._transactionCommit,
          transactionRollback: this._transactionRollback,
          autoCommit: !!this.props.autoCommitMode,
        }}>
        <DndProvider backend={HTML5Backend}>
          {this.state.config && (
            <BrickRenderer
              isRoot
              context={{ data: {}, actions: { $global: {} } }}
              config={this.state.config}
              setConfig={this._handleSetConfig}
            />
          )}
        </DndProvider>
      </EnginxContext.Provider>
    )
  }
}

export { Engine }
