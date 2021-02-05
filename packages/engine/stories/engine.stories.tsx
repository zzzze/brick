import React from 'react'
import { Story, Meta } from '@storybook/react'
import config from './brick.config.json'
import { Engine, EngineProps } from '../src'
import './register-bricks'

export default {
  title: 'Example/Engine',
  component: Engine,
  argTypes: {},
} as Meta

const Template: Story<EngineProps> = (args) => <Engine {...args} />

export const Default = Template.bind({})
Default.args = {
  config: {
    name: 'Text',
    data: {
      content: 'hello world',
    },
    version: '0.0.1',
  },
}

export const WithHandler = Template.bind({})
WithHandler.args = {
  config,
}
