import { useMemo } from 'react'
import { Brick, DataObject, Config } from '@/types'

interface PropsConfigFormProps {
  config: Config
  bricks: Record<string, Brick>
  onPropsChange: (newProps: DataObject) => void
}
const PropsConfigForm = ({ config, bricks, onPropsChange }: PropsConfigFormProps): JSX.Element | null => {
  const brick = useMemo(() => {
    return bricks[config.name]
  }, [bricks, config])
  return brick.renderConfigForm({
    data: config.data || {},
    onChange: onPropsChange,
  })
}

export default PropsConfigForm
