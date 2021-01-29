import { useMemo } from 'react'
import { Brick, PropsObject, Config } from '@/types'

interface PropsConfigFormProps {
  config: Config
  bricks: Record<string, Brick>
  onPropsChange: (newProps: PropsObject) => void
}
const PropsConfigForm = ({ config, bricks, onPropsChange }: PropsConfigFormProps): JSX.Element | null => {
  const brick = useMemo(() => {
    return bricks[config.name]
  }, [bricks, config])
  return brick.renderConfigForm({
    value: config.props || {},
    onChange: onPropsChange,
  })
}

export default PropsConfigForm
