import { Config } from '../types'

export const copyConfig = (config: Config): Config => {
  const newConfig: Config = {
    ...config,
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
  if (config.data) {
    newConfig.data = {
      ...config.data,
    }
  }
  if (config.actions) {
    newConfig.actions = {
      ...config.actions,
    }
  }
  if (config.handlers) {
    newConfig.handlers = {
      ...config.handlers,
    }
  }
  if (config.listeners) {
    newConfig.listeners = {
      ...config.listeners,
    }
  }
  if (config.render) {
    newConfig.render = config.render || ''
  }
  return newConfig
}
