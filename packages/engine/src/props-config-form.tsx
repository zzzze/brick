import { useMemo, useContext } from 'react'
import { DataObject, Config } from '@/types'
import Context from '@/context'

interface PropsConfigFormProps {
  config: Config
  onPropsChange: (newProps: DataObject) => void
}
const PropsConfigForm = ({ config, onPropsChange }: PropsConfigFormProps): JSX.Element | null => {
  const context = useContext(Context)
  const brick = useMemo(() => {
    return context.bricks[config.name]
  }, [context.bricks, config])
  return brick.renderConfigForm({
    data: config.data || {},
    onChange: onPropsChange,
  })
}

export default PropsConfigForm
