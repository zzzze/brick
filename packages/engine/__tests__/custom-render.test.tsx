import React from 'react'
import { mount } from 'enzyme'
import 'jest-enzyme'
import { Engine } from '../src/index'
import { Config } from '../src/types'
import './register-bricks'

React.useLayoutEffect = React.useEffect

describe('custom-render', () => {
  test('', () => {
    const config: Config = {
      name: 'ViewWithCustomRender',
      _key: '001',
      render: `instance => {
        return (
          <div>
            <span>foo</span>
            {instance.children}
          </div>
        )
      }`,
      version: '0.0.1',
    }
    const wrapper = mount(<Engine config={config} />)
    expect(wrapper.html()).toContain('foo')
  })
})
