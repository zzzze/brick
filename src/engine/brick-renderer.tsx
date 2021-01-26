import React, { useState, useCallback, useMemo } from 'react'
import { Config, Brick, PropsObject, EngineMode } from '@/types'
import ConfigFormWrapper from '@/engine/config-form-wrapper'

interface BrickRenderProps {
  config: Config
  bricks: Record<string, Brick>
  mode: EngineMode
  setState: (config: Config) => void
}

const BrickRenderer: React.FC<BrickRenderProps> = ({ config, bricks, setState, mode }: BrickRenderProps) => {
  const [props, setProps] = useState<PropsObject>(config.props)
  const handleChange = useCallback(
    (newProps: PropsObject) => {
      setProps(newProps)
      setState({
        ...config,
        props: newProps,
      })
    },
    [config]
  )
  const handleSetStateForChildren = useCallback(
    (childConfig: Config, index: number) => {
      if (!config.children.length) {
        return
      }
      const children = config.children.slice()
      children.splice(index, 1, childConfig)
      setState({
        ...config,
        children,
      })
    },
    [config]
  )
  const Component = useMemo(() => bricks[config.name].render, [bricks, config.name])
  return (
    <ConfigFormWrapper config={config} bricks={bricks} onChange={handleChange}>
      <Component value={props}>
        {config.children.map((child, index) => {
          return (
            <BrickRenderer
              mode={mode}
              config={child}
              bricks={bricks}
              setState={(config: Config) => handleSetStateForChildren(config, index)}
            />
          )
        })}
      </Component>
    </ConfigFormWrapper>
  )
}

export default BrickRenderer
