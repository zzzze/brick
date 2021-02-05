import { Config } from '../types'

export const copyConfig = (config: Config): Config => {
  const newConfig: Config = {
    name: config.name,
    version: config.version,
  }
  if (config.supply) {
    newConfig.supply = {
      data: {
        ...config.supply?.data,
      },
      actions: {
        ...config.supply?.actions,
      },
    }
  }
  if (config.actions) {
    newConfig.actions = {
      ...config.actions,
    }
  }
  if (config.render) {
    newConfig.render = config.render || ''
  }
  return newConfig
}
