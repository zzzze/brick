import React from 'react'
import { mount } from 'enzyme'
import 'jest-enzyme'
import Engine from '@/engine'
import { Config } from '@/types'
import './register-bricks'

describe('custom-render', () => {
  test('', () => {
    const config: Config = {
      name: 'ViewWithCustomRender',
      render: {
        modules: {
          brickContainer: '@/engine/brick-containter',
        },
        func: `args => {
          const BrickContainer = modules.brickContainer.default
          return (
            <BrickContainer tag="div">
              <span>foo</span>
              {args.children}
            </BrickContainer>
          )
        }`,
      },
      version: '0.0.1',
    }
    const wrapper = mount(<Engine config={config} />)
    expect(wrapper.html()).toContain('foo')
  })
})
