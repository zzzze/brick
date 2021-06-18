import React, { useCallback, useRef } from 'react'
import { Story, Meta } from '@storybook/react'
import itemConfig from './item-root.config.json'
import githubStylePageConfig from './github-style-page.config.json'
import todosConfig from './todos.config.json'
import { Engine, EngineProps } from '../src/engine'
import registerBricks from './register-bricks'
import '@brick/components/lib/tooltip.css'
import './style.css'
import '../index.css'
import { Blueprint } from '../src/types'
import { Rule, StyleSheet } from 'jss'

export default {
  title: 'Example/Engine',
  component: Engine,
  argTypes: {},
} as Meta

const generateID = (rule: Rule, sheet?: StyleSheet) => {
  return `${sheet?.options.classNamePrefix ?? ''}${rule.key}`
}

const Template: Story<EngineProps> = (args) => {
  registerBricks()
  const ref = useRef<Engine>(null)
  const handleUndo = useCallback(() => {
    ref.current?.undo()
  }, [])
  const handleRedo = useCallback(() => {
    ref.current?.redo()
  }, [])
  const handleGetBlueprint = useCallback(() => {
    console.log(JSON.stringify(ref.current?.getBlueprint(), null, 2))
  }, [])
  const menuBarRef = useRef<HTMLDivElement>(null)
  const configurationPanelRef = useRef<HTMLDivElement>(null)
  const configurationPanelContentRef = useRef<HTMLDivElement>(null)
  return (
    <div key={JSON.stringify(args.blueprint)}>
      <button onClick={handleUndo}>undo</button>
      <button onClick={handleRedo}>redo</button>
      <button onClick={handleGetBlueprint}>blueprint</button>
      <div ref={menuBarRef}></div>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <Engine
            debug
            generateJssID={generateID}
            ref={ref}
            menuBarRef={menuBarRef}
            configurationPanelRef={configurationPanelContentRef}
            {...args}
          />
        </div>
        <div style={{ width: 400 }} ref={configurationPanelRef}>
          <div style={{ position: 'relative' }} ref={configurationPanelContentRef}></div>
        </div>
      </div>
    </div>
  )
}

export const Default = Template.bind({})
Default.args = {
  configurationPanelContentUseTransition: true,
  blueprint: {
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
  configurationPanelContentUseTransition: false,
  blueprint: itemConfig as Blueprint,
}

export const WebPage = Template.bind({})
WebPage.args = {
  configurationPanelContentUseTransition: true,
  blueprint: githubStylePageConfig as Blueprint,
}

export const Todos = Template.bind({})
Todos.args = {
  configurationPanelContentUseTransition: true,
  blueprint: todosConfig as Blueprint,
}
