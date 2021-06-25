import React, { createRef, ReactElement } from 'react'
import { Blueprint, Brick, SetBlueprintFn } from './types'
import EnginxContext, { ContextPassthrouthProps, RenderConfigurationForm } from './context'
import BrickRenderer from './brick-renderer'
import EventEmitter from 'eventemitter3'
import renderConfigurationForm from './render-configuration-form'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Diff from 'deep-diff'
import cloneDeep from 'lodash/cloneDeep'
import { DataType } from './data/data-type'
import ErrorBoundary from './error-boundary'
import { BackendFactory } from 'dnd-core'
import BrickMenu from './brick-menu'
import { JssProvider, ThemeProvider, createGenerateId } from 'react-jss'
import ConfigurationPanel from './configuration-panel'
import { types, theme } from '@brick/shared'
import merge from 'lodash/merge'

const ee = new EventEmitter()

const generateId = createGenerateId()

// #region type definitions
export interface EngineOptions {
  delimiters: [string, string]
  identifiers: {
    forItem: string
    forIndex: string
    idPrefix: string
  }
}

export interface EngineProps extends ContextPassthrouthProps {
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
  menuBarRef?: React.RefObject<HTMLElement>
  configurationPanelRef?: React.RefObject<HTMLElement>
  theme?: types.DeepPartial<theme.Theme>
  generateJssID?: ReturnType<typeof createGenerateId>
  options?: types.DeepPartial<EngineOptions>
  moveOnDropOnly?: boolean
  debug?: boolean
}

interface EngineState {
  blueprint: Blueprint | null
  selectedInstance: string | null
}
// #endregion

/**
 * Engine render bricks according to the blueprint.
 */
class Engine extends React.Component<EngineProps, EngineState> {
  // #region static properties and methods
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
  // #endregion

  // #region constructor
  constructor(props: EngineProps) {
    super(props)
    this.state = {
      ...this.state,
      blueprint: props.blueprint,
    }
    if (props.options) {
      this.options = merge(this.options, props.options)
    }
    if (props.configurationPanelRef) {
      this._configurationPanelRef = props.configurationPanelRef
    }
    this._renderConfigurationForm = props.renderConfigurationForm || renderConfigurationForm
  }
  // #endregion

  // #region properties
  state: EngineState = {
    blueprint: null,
    selectedInstance: null,
  }
  options: EngineOptions = {
    delimiters: ['{{', '}}'],
    identifiers: {
      forItem: 'item',
      forIndex: 'index',
      idPrefix: '$',
    },
  }
  // #endregion

  // #region inner properties
  private _isInTransaction = false
  private _stagingBlueprint: Blueprint | null = null
  private _backwardDiffs: Diff.Diff<Blueprint | null>[][] = []
  private _forwardDiffs: Diff.Diff<Blueprint | null>[][] = []
  private _isUndoRedo = false
  private get _dndBackend(): BackendFactory {
    if (!this.props.dndBackend) {
      return HTML5Backend
    }
    return this.props.dndBackend
  }
  private _registerBrick = (brick: Brick): void => {
    Engine.bricks[brick.name] = brick
    this.forceUpdate()
  }
  private _configurationPanelRef = createRef<HTMLElement>()
  private _overlayRef = createRef<HTMLDivElement>()
  // #endregion

  // #region lifecycle
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
      if (this.props.debug) {
        console.log(diff)
      }
      this._backwardDiffs.push(diff)
    }
  }
  // #endregion

  // #region exposed methods
  getBlueprint(): Blueprint | null {
    return this.state.blueprint
  }
  undo(): void {
    this._undeOrRedo()
  }
  redo(): void {
    this._undeOrRedo(true)
  }
  // #endregion

  // #region inner methods
  private _renderConfigurationForm: RenderConfigurationForm
  private _handleSetBlueprint = (fn: SetBlueprintFn): void => {
    if (this._stagingBlueprint == null) {
      this._stagingBlueprint = this.state.blueprint
    }
    this._stagingBlueprint = fn(this._stagingBlueprint as Blueprint)
    if (!this._isInTransaction) {
      this._commitBlueprint()
    }
  }
  private _transactionBegin = (): void => {
    this._commitBlueprint()
    this._isInTransaction = true
  }
  private _transactionCommit = (): void => {
    this._isInTransaction = false
    this._commitBlueprint()
  }
  private _transactionRollback = (): void => {
    this._stagingBlueprint = null
  }
  private _commitBlueprint = (): void => {
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
  private _undeOrRedo(redo = false): void {
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
  private _handleKeyPress = (event: KeyboardEvent): boolean => {
    if (!event.ctrlKey || event.key.toLowerCase() !== 'z') {
      return true
    }
    this._undeOrRedo(event.shiftKey)
    return false
  }
  private _selectInstance = (key: string | null): void => {
    this.setState({
      selectedInstance: key,
    })
  }
  // #endregion

  // #region render
  render(): React.ReactNode {
    if (!this.props.autoCommitMode) {
      this._isInTransaction = true
    }
    return (
      <>
        <JssProvider generateId={this.props.generateJssID ?? generateId}>
          <ThemeProvider theme={merge(theme.defaultTheme, this.props.theme)}>
            <EnginxContext.Provider
              value={{
                options: this.options,
                renderConfigurationForm: this._renderConfigurationForm,
                configurationFormContainerRef: createRef(),
                bricks: Engine.bricks,
                dataTypes: Engine.dataTypes,
                ee,
                previewMode: !!this.props.previewMode,
                transactionBegin: this._transactionBegin,
                transactionCommit: this._transactionCommit,
                transactionRollback: this._transactionRollback,
                autoCommit: !!this.props.autoCommitMode,
                registerBrick: this._registerBrick,
                selectInstance: this._selectInstance,
                selectedInstance: this.state.selectedInstance,
                configurationPanelRef: this._configurationPanelRef,
                configurationPanelContentUseTransition: !!this.props.configurationPanelContentUseTransition,
                overlayRef: this._overlayRef,
                moveOnDropOnly: !!this.props.moveOnDropOnly,
              }}>
              <DndProvider backend={this._dndBackend} key="dnd-provider">
                <BrickMenu getContainer={this.props.menuBarRef} bricks={Object.values(Engine.bricks)} />
                <div style={{ position: 'fixed', top: 0, left: 0 }} ref={this._overlayRef}></div>
                {!this.props.configurationPanelRef && <ConfigurationPanel ref={this._configurationPanelRef} />}
                {this.state.blueprint && (
                  <ErrorBoundary key={this.state.blueprint._key}>
                    <BrickRenderer
                      isRoot
                      context={{ data: { $parent: {} }, actions: { $parent: {} } }}
                      blueprint={this.state.blueprint}
                      setBlueprint={this._handleSetBlueprint}
                    />
                  </ErrorBoundary>
                )}
              </DndProvider>
            </EnginxContext.Provider>
          </ThemeProvider>
        </JssProvider>
      </>
    )
  }
  // #endregion
}
export { Engine }
