import React, { useContext, useMemo } from 'react'
import { Brick, PropsObject, Config } from '@/types'
import Context from '@/engine/context'

interface PropsFormProps {
  config: Config
  bricks: Record<string, Brick>
  onChange: (newProps: PropsObject) => void
}
const PropsForm = ({ config, bricks, onChange }: PropsFormProps): JSX.Element | null => {
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
      values[key] = typeof config.props[key] === 'undefined' ? brick.defaultProps[key] : config.props[key]
    })
    return values
  }, [keys])
  return context.renderConfigForm(<brick.renderConfigForm value={initialValues} onChange={onChange} />)
}

export default PropsForm
