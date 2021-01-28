import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { Config, Brick, PropsObject, EngineMode } from '@/types'
import BrickWrapper from '@/engine/brick-wrapper'

interface BrickRenderProps {
  config: Config
  bricks: Record<string, Brick>
  mode: EngineMode
  setState: (config: Config) => void
}

const BrickRenderer: React.FC<BrickRenderProps> = ({ config, bricks, setState, mode }: BrickRenderProps) => {
  const [props, setProps] = useState<PropsObject>(config.props)
  const brick = useMemo(() => {
    return bricks[config.name]
  }, [bricks, config])
  const keys = useMemo(() => {
    return Object.keys(brick.propTypes)
  }, [brick])
  useEffect(() => {
    const values: PropsObject = {}
    keys.forEach((key) => {
      values[key] = typeof config.props[key] === 'undefined' ? brick.defaultProps[key] : config.props[key]
    })
    setProps(values)
    setState({
      ...config,
      props: values,
    })
  }, [])
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
      if (!config.children || !config.children.length) {
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
  return (
    <BrickWrapper config={config} bricks={bricks} onChange={handleChange}>
      {bricks[config.name].render({
        value: props,
        children:
          Array.isArray(config.children) &&
          config.children.map((child, index) => {
            return (
              <BrickRenderer
                key={index}
                mode={mode}
                config={child}
                bricks={bricks}
                setState={(config: Config) => handleSetStateForChildren(config, index)}
              />
            )
          }),
      })}
    </BrickWrapper>
  )
}

export default BrickRenderer
