import React, { useCallback, useRef } from 'react'
import { Story, Meta } from '@storybook/react'
import itemConfig from './item-root.config.json'
import { Engine, EngineProps } from '../src'
import { EngineMode } from '../src/types'
import registerBricks from './register-bricks'
import './style.css'
import '../index.css'

export default {
  title: 'Example/Engine',
  component: Engine,
  argTypes: {},
} as Meta

const Template: Story<EngineProps> = (args) => {
  registerBricks()
  const ref = useRef<Engine>(null)
  const handleUndo = useCallback(() => {
    ref.current?.undo()
  }, [])
  const handleRedo = useCallback(() => {
    ref.current?.redo()
  }, [])
  return (
    <div>
      <button onClick={handleUndo}>撤销</button>
      <button onClick={handleRedo}>重做</button>
      <Engine ref={ref} {...args} />
    </div>
  )
}

export const Default = Template.bind({})
Default.args = {
  config: {
    name: 'Text',
    _key: '001',
    data: {
      content: 'hello world',
    },
    version: '0.0.1',
  },
}

export const ItemRootWithHandler = Template.bind({})
ItemRootWithHandler.args = {
  config: itemConfig,
  mode: EngineMode.EDIT,
}

export const WithHandler = Template.bind({})
WithHandler.args = {
  config: itemConfig,
  mode: EngineMode.EDIT,
}

export const PreviewMode = Template.bind({})
PreviewMode.args = {
  config: itemConfig,
  mode: EngineMode.PREVIEW,
}
