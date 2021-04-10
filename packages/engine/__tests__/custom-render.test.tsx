import React from 'react'
import { mount } from 'enzyme'
import 'jest-enzyme'
import { Engine } from '../src/engine'
import { Blueprint } from '../src/types'
import './register-bricks'

React.useLayoutEffect = React.useEffect

describe('custom-render', () => {
  test('', () => {
    const blueprint: Blueprint = {
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
    const wrapper = mount(<Engine blueprint={blueprint} />)
    expect(wrapper.html()).toContain('foo')
  })
})
