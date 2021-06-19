import React, { useCallback, useContext, useMemo } from 'react'
import ReactDOM from 'react-dom'
import { RenderConfigurationForm, RenderConfigurationFormOptions } from './context'
import EnginxContext from './context'
import { Transition } from 'react-transition-group'

export default (node: JSX.Element, options: RenderConfigurationFormOptions): ReturnType<RenderConfigurationForm> => {
  const context = useContext(EnginxContext)
  const configFormVisible = useMemo(() => {
    if (context.selectedInstance !== options.blueprint._key) {
      return false
    }
    if (options.blueprint.copy && options.blueprint.copyID !== 0) {
      return false
    }
    return true
  }, [context.selectedInstance, options.blueprint._key, options.blueprint.copy, options.blueprint.copyID])
  const configurationPanelcontainer = context.configurationPanelRef?.current
  const getPopupContainer = useCallback(() => {
    return context.configurationPanelRef?.current
  }, [context.configurationPanelRef?.current])
  return (
    <>
      {!context.configurationPanelContentUseTransition &&
        configFormVisible &&
        configurationPanelcontainer &&
        ReactDOM.createPortal(
          React.cloneElement(React.Children.only(node), {
            getPopupContainer,
          }),
          configurationPanelcontainer
        )}
      {context.configurationPanelContentUseTransition && (
        <Transition in={configFormVisible} timeout={300} unmountOnExit>
          {() =>
            configurationPanelcontainer &&
            ReactDOM.createPortal(
              React.cloneElement(React.Children.only(node), {
                getPopupContainer,
              }),
              configurationPanelcontainer
            )
          }
        </Transition>
      )}
    </>
  )
}
