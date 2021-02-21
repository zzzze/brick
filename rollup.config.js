import getEngineRollupConfig from './packages/engine/rollup.config'
import getComponentsRollupConfig from './packages/components/rollup.config'
import getCliRollupConfig from './packages/cli/rollup.config'

export default [
  ...getComponentsRollupConfig('packages/components'),
  ...getEngineRollupConfig('packages/engine'),
  ...getCliRollupConfig('packages/cli'),
]
