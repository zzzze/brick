import React from 'react'
import { Story, Meta } from '@storybook/react'
import config from './brick.config.json'
import { Engine, EngineProps } from '../src'
import { EngineMode } from '../src/types'
import registerBricks from './register-bricks'
import '../index.css'

export default {
  title: 'Example/Engine',
  component: Engine,
  argTypes: {},
} as Meta

const Template: Story<EngineProps> = (args) => {
  registerBricks()
  return <Engine {...args} />
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

export const WithHandler = Template.bind({})
WithHandler.args = {
  config,
  mode: EngineMode.EDIT,
}

export const PreviewMode = Template.bind({})
PreviewMode.args = {
  config,
  mode: EngineMode.PREVIEW,
}
