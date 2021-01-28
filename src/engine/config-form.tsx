import { useContext, useMemo } from 'react'
import { Brick, PropsObject, Config } from '@/types'
import Context from '@/engine/context'

interface ConfigFormProps {
  config: Config
  bricks: Record<string, Brick>
  onChange: (newProps: PropsObject) => void
}
const ConfigForm = ({ config, bricks, onChange }: ConfigFormProps): JSX.Element | null => {
  const context = useContext(Context)
  const brick = useMemo(() => {
    return bricks[config.name]
  }, [bricks, config])
  return context.renderConfigForm(
    brick.renderConfigForm({
      value: config.props,
      onChange,
    })
  )
}

export default ConfigForm
