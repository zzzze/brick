import React from 'react'
import { mount } from 'enzyme'
import 'jest-enzyme'
import { Engine } from '@/index'
import { Config } from '@/types'
import './register-bricks'

React.useLayoutEffect = React.useEffect

describe('custom-render', () => {
  test('', () => {
    const config: Config = {
      name: 'ViewWithCustomRender',
      _key: '001',
      render: `args => {
        const BrickContainer = require('@brick/components').BrickContainer
        return (
          <BrickContainer tag="div">
            <span>foo</span>
            {args.children}
          </BrickContainer>
        )
      }`,
      version: '0.0.1',
    }
    const wrapper = mount(<Engine config={config} />)
    expect(wrapper.html()).toContain('foo')
  })
})
