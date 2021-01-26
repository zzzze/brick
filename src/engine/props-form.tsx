import React, { useContext, useMemo } from 'react'
import Brick, {PropsObject} from '@/interfaces/brick'
import Context from '@/engine/context'
import Config from '@/interfaces/config'

interface PropsFormProps {
  config: Config
  bricks: Record<string, Brick>
  onChange: (newProps: PropsObject) => void
  configFormVisible: boolean
  hideConfigForm: () => void
}
const PropsForm: React.FC<PropsFormProps> = ({ config, bricks, onChange, configFormVisible, hideConfigForm }: PropsFormProps) => {
  const context = useContext(Context)
  const brick = useMemo(() => {
    return bricks[config.name]
  }, [bricks, config])
  const keys = useMemo(() => {
    return Object.keys(brick.propTypes)
  }, [brick])
  const initialValues = useMemo(() => {
    const values: PropsObject = {}
    keys.forEach((key) => {
      values[key] = typeof brick.propTypes[key] === 'undefined' ? brick.defaultProps[key] : brick.propTypes[key]
    })
    return values
  }, [keys])
  return context.renderConfigForm(<brick.renderConfigForm value={initialValues} onChange={onChange} />, {
    visible: configFormVisible,
    hide: hideConfigForm,
  })
}

export default PropsForm
