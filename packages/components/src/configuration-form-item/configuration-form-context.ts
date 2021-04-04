import React from 'react'
import EventEmitter from 'eventemitter3'

type DataObject = Record<string, unknown>

export interface RenderConfigurationForm {
  (node: JSX.Element, ee: EventEmitter): JSX.Element | null
}

interface ContextType {
  data: DataObject
  autoCommit: boolean
  commit: () => void
  onChange: (newProps: DataObject) => void
}

const ConfigurationFormContext = React.createContext<ContextType>({
  data: {},
  autoCommit: false,
  commit: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  onChange: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
})

export default ConfigurationFormContext
