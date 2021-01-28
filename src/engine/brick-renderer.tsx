import React, { useCallback, useMemo, useEffect } from 'react'
import { Config, Brick, PropsObject, EngineMode } from '@/types'
import BrickWrapper from '@/engine/brick-wrapper'

interface BrickRenderProps {
  config: Config
  bricks: Record<string, Brick>
  mode: EngineMode
  setConfig: (fn: (config: Readonly<Config>) => Config) => void
}

const BrickRenderer: React.FC<BrickRenderProps> = ({ config, bricks, setConfig: setState, mode }: BrickRenderProps) => {
  const brick = useMemo(() => {
    return bricks[config.name]
  }, [bricks, config])
  const keys = useMemo(() => {
    return Object.keys(brick.propTypes)
  }, [brick])
  useEffect(() => {
    const values: PropsObject = {}
    keys.forEach((key) => {
      values[key] =
        !config.props || typeof config?.props[key] === 'undefined' ? brick.defaultProps[key] : config.props[key]
    })
    setState((config) => ({
      ...config,
      props: values,
    }))
  }, [])
  const handleChange = useCallback((newProps: PropsObject) => {
    setState((config) => ({
      ...config,
      props: newProps,
    }))
  }, [])
  const handleSetStateForChildren = useCallback(
    (fn: (config: Readonly<Config>) => Config, index: number) => {
      if (!config.children || !config.children.length) {
        return
      }
      const children = config.children.slice()
      children.splice(index, 1, fn(config.children[index]))
      setState((config) => ({
        ...config,
        children,
      }))
    },
    [config]
  )
  return (
    <BrickWrapper config={config} bricks={bricks} onChange={handleChange}>
      {bricks[config.name].render({
        value: config.props || {},
        children:
          Array.isArray(config.children) &&
          config.children.map((child, index) => {
            return (
              <BrickRenderer
                key={index}
                mode={mode}
                config={child}
                bricks={bricks}
                setConfig={(fn: (config: Readonly<Config>) => Config) => handleSetStateForChildren(fn, index)}
              />
            )
          }),
      })}
    </BrickWrapper>
  )
}

export default BrickRenderer
