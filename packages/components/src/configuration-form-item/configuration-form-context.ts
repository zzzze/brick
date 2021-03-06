import React from 'react'
import EventEmitter from 'eventemitter3'

type DataObject = Record<string, unknown>

export interface RenderConfigurationForm {
  (node: JSX.Element, ee: EventEmitter): JSX.Element | null
}

interface ContextType {
  data: DataObject
  autoCommit: boolean
  onChange: (newProps: DataObject) => void
}

const ConfigurationFormContext = React.createContext<ContextType>({
  data: {},
  autoCommit: false,
  onChange: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
})

export default ConfigurationFormContext
