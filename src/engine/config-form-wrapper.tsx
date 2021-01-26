import React, { useState, useCallback } from 'react'
import Brick, {PropsObject} from '@/interfaces/brick'
import Config, { NodeName } from '@/interfaces/config'
import PropsForm from '@/engine/props-form'

interface ConfigFormWrapperProps {
  children: JSX.Element
  config: Config
  bricks: Record<string, Brick>
  onChange: (newProps: PropsObject) => void
}

const ConfigFormWrapper:React.FC<ConfigFormWrapperProps> = ({ children, config, bricks, onChange }: ConfigFormWrapperProps) => {
  const [configFormVisible, setConfigFormVisible] = useState(false)
  const handleShowConfigForm = useCallback(() => {
    setConfigFormVisible(true)
  }, [])
  const handleHideConfigForm = useCallback(() => {
    setConfigFormVisible(false)
  }, [])
  return (
    <div>
      {config.name !== NodeName.ROOT && (
        <>
          <button onClick={handleShowConfigForm}>编辑</button>
          <PropsForm config={config} bricks={bricks} onChange={onChange} configFormVisible={configFormVisible} hideConfigForm={handleHideConfigForm} />
        </>
      )}
      {children}
    </div>
  )
}

export default ConfigFormWrapper
