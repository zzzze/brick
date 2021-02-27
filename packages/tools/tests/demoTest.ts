import React from 'react'
import glob from 'glob'
import { render } from 'enzyme'
import 'jest-enzyme'

React.useLayoutEffect = React.useEffect

export default function demoTest(component: string): void {
  const files = glob.sync(`./packages/${component}/demo/**/*.md`)
  files.forEach((file) => {
    test(`renders ${file} correctly`, () => {
      const demo = require(`../../.${file}`).default // eslint-disable-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const wrapper = render(demo)
      expect(wrapper).toMatchSnapshot()
    })
  })
}
