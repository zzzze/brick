import React from 'react'
import { Story, Meta } from '@storybook/react'
import { ObjectKeyValueInput, ObjectKeyValueInputProps } from '../index'
import '../../select/style.css'
import './style.css'
import { InputType } from '../item'

window.__BRICK_INSTANCE_TYPES__ = ''

export default {
  title: 'Components/ObjectKeyValueInput',
  component: ObjectKeyValueInput,
  argTypes: {},
} as Meta

const Template: Story<ObjectKeyValueInputProps> = (args) => (
  <div className="container">
    <ObjectKeyValueInput {...args} />
  </div>
)

export const Default = Template.bind({})
Default.args = {
  value: {
    foo: 'bar',
    onClick:
      "function(instance, name) {\n            instance.setData(function(data) {\n    console.log('000001', data);\n          return Object.assign({}, data, {\n                name: name,\n              })\n            }, {\n              setToBlueprint: true,\n            })\n          }",
  },
}

export const OneType = Template.bind({})
OneType.args = {
  value: {
    onChange: '() => {}',
    onClick:
      "function(instance, name) {\n            instance.setData(function(data) {\n    console.log('000001', data);\n          return Object.assign({}, data, {\n                name: name,\n              })\n            }, {\n              setToBlueprint: true,\n            })\n          }",
  },
  types: [InputType.CODE],
}
