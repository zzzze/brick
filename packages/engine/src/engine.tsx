import React, { ReactElement } from 'react'
import { Blueprint, Brick, SetBlueprintFn } from './types'
import EnginxContext, { RenderConfigurationForm } from './context'
import BrickRenderer from './brick-renderer'
import EventEmitter from 'eventemitter3'
import renderConfigurationForm from './render-configuration-form'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Diff from 'deep-diff'
import cloneDeep from 'lodash/cloneDeep'
import { DataType } from './data/data-type'
import ErrorBoundary from './error-boundary'
import {BackendFactory} from 'dnd-core'

const ee = new EventEmitter()

enum TransactionState {
  START = 'start',
  END = 'end',
}

export interface EngineProps {
  /**
   * Configuration for engine
   */
  blueprint: Blueprint | null
  /**
   * Render configuration form of brick
   */
  renderConfigurationForm?: RenderConfigurationForm
  previewMode?: boolean
  autoCommitMode?: boolean
  dndBackend?: BackendFactory
}

interface EngineState {
  blueprint: Blueprint | null
}

/**
 * Engine render bricks according to the blueprint.
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
  static registerFormItem(type: string, formItem: () => ReactElement): void {
    const dataType = Engine.dataTypes[type]
    if (!dataType) {
      throw Error(`data type (${type}) not found`)
    }
    dataType.formItem = formItem
  }

  /**
   * constructor
   */
  constructor(props: EngineProps) {
    super(props)
    this.state = {
      blueprint: props.blueprint,
    }
    this._renderConfigurationForm = props.renderConfigurationForm || renderConfigurationForm
  }

  /**
   * state
   */
  state: EngineState = {
    blueprint: null,
  }

  /**
   * inner properties
   */
  _transaction: TransactionState = TransactionState.END
  _stagingBlueprint: Blueprint | null = null
  _backwardDiffs: Diff.Diff<Blueprint | null>[][] = []
  _forwardDiffs: Diff.Diff<Blueprint | null>[][] = []
  _isUndoRedo = false
  get _dndBackend(): BackendFactory {
    if (!this.props.dndBackend) {
      return HTML5Backend
    }
    return this.props.dndBackend
  }

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
    const diff = Diff.diff(prevState.blueprint, this.state.blueprint)
    if (diff) {
      this._backwardDiffs.push(diff)
    }
  }

  /**
   * exposed methods
   */
  getBlueprint(): Blueprint | null {
    return this.state.blueprint
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
  _handleSetBlueprint = (fn: SetBlueprintFn): void => {
    if (this._stagingBlueprint == null) {
      this._stagingBlueprint = this.state.blueprint
    }
    this._stagingBlueprint = fn(this._stagingBlueprint as Blueprint)
    if (this._transaction == TransactionState.END) {
      this._commitBlueprint()
    }
  }
  _transactionBegin = (): void => {
    this._commitBlueprint()
    this._transaction = TransactionState.START
  }
  _transactionCommit = (): void => {
    this._transaction = TransactionState.END
    this._commitBlueprint()
  }
  _transactionRollback = (): void => {
    this._stagingBlueprint = null
  }
  _commitBlueprint = (): void => {
    if (!this._stagingBlueprint) {
      return
    }
    const stagingBlueprint = this._stagingBlueprint
    this.setState(
      (state) => {
        return {
          ...state,
          blueprint: {
            ...stagingBlueprint,
          },
        }
      },
      () => {
        this._forwardDiffs = []
        this._stagingBlueprint = null
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
    const blueprint = cloneDeep(this.state.blueprint)
    diffs?.forEach((diff) => {
      if (redo) {
        Diff.applyChange<Blueprint | null>(blueprint, blueprint, diff)
      } else {
        Diff.revertChange<Blueprint | null>(blueprint, blueprint, diff)
      }
    })
    this.setState(
      (state) => ({
        ...state,
        blueprint,
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
        <DndProvider backend={this._dndBackend} key="dnd-provider">
          {this.state.blueprint && (
            <ErrorBoundary key={this.state.blueprint._key}>
              <BrickRenderer
                isRoot
                context={{ data: {}, actions: { $global: {} } }}
                blueprint={this.state.blueprint}
                setBlueprint={this._handleSetBlueprint}
              />
            </ErrorBoundary>
          )}
        </DndProvider>
      </EnginxContext.Provider>
    )
  }
}

export { Engine }
