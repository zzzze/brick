import getEngineRollupConfig from './packages/engine/rollup.config'
import getComponentsRollupConfig from './packages/components/rollup.config'
import getCliRollupConfig from './packages/cli/rollup.config'
import getSharedRollupConfig from './packages/shared/rollup.config'

export default [
  ...getSharedRollupConfig('packages/shared'),
  ...getComponentsRollupConfig('packages/components'),
  ...getEngineRollupConfig('packages/engine'),
  ...getCliRollupConfig('packages/cli'),
]
