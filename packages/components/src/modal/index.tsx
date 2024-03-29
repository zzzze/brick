import React, {
  FC,
  MouseEvent as ReactMouseEvent,
  PropsWithChildren,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { createUseStyles, useTheme } from 'react-jss'
import clx from 'classnames'
import { theme } from '@brick/shared'
import { Transition } from 'react-transition-group'
import { EXITED, ENTERING, ENTERED, EXITING } from 'react-transition-group/Transition'
import { AiFillCloseCircle } from 'react-icons/ai'

let mousePosition: { x: number; y: number } | null = null

const getClickPosition = (e: MouseEvent) => {
  mousePosition = {
    x: e.pageX,
    y: e.pageY,
  }
  setTimeout(() => {
    mousePosition = null
  }, 100)
}

if (typeof window !== 'undefined' && window.document && window.document.createElement) {
  document.documentElement.addEventListener('click', getClickPosition, true)
}

interface StyleProps {
  duration: number
}

const useStyles = createUseStyles(
  (theme: theme.Theme) => {
    return {
      mask: {
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.palette.mask.main,
        zIndex: theme.zIndex.modal,
        opacity: 0,
        transition: ({ duration }: StyleProps) => `all ${duration}ms ease-in-out`,
      },
      maskEntering: {
        opacity: 0,
      },
      maskEntered: {
        opacity: 1,
      },
      maskExiting: {
        opacity: 0,
      },
      maskExited: {
        opacity: 0,
      },
      modalWrapper: {
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.modal,
        transform: 'scale(0.1)',
        opacity: 0,
        transition: ({ duration }: StyleProps) => `all ${duration}ms ease-in-out`,
        overflowY: 'auto',
      },
      modalWrapperEntering: {
        transform: 'scale(0.1)',
        opacity: 0,
      },
      modalWrapperEntered: {
        transform: 'scale(1)',
        opacity: 1,
      },
      modalWrapperExiting: {
        transform: 'scale(0.1)',
        opacity: 0,
      },
      modalWrapperExited: {
        transform: 'scale(0.1)',
        opacity: 0,
      },
      modal: {
        margin: `${theme.spacing.Lg * 4}px auto`,
        width: 600,
        padding: theme.spacing.Lg,
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.background.default,
      },
      header: {
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.text.primary,
        fontWeight: theme.typography.fontWeightMedium,
        marginBottom: theme.spacing.Sm,
      },
      title: {
        flex: 1,
      },
      closeBtn: {
        fontSize: 20,
      },
    }
  },
  { name: 'Modal' }
)

export interface ModalCloseBtnProps {
  testID?: string
  className?: string
}

export interface ModalProps {
  visible: boolean
  title?: string
  onClose?: () => void
  closeBtnProps?: ModalCloseBtnProps
  transitionDuration?: number
  maskClosable?: boolean
  containerRef?: RefObject<HTMLElement>
}

const Modal: FC<PropsWithChildren<ModalProps>> = (props) => {
  const { visible, children, transitionDuration } = props
  const theme: theme.Theme = useTheme()
  const duration = transitionDuration ?? theme.transitions.duration.short
  const containerRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const classes = useStyles({
    duration,
  })
  const pos = useRef<{ top: number; left: number }>()
  useMemo(() => {
    if (visible && containerRef.current) {
      pos.current = {
        top: (mousePosition?.y ?? 0) - containerRef.current.ownerDocument.documentElement.scrollTop,
        left: (mousePosition?.x ?? 0) - containerRef.current.ownerDocument.documentElement.scrollLeft,
      }
    }
  }, [visible])
  useEffect(() => {
    if (visible && typeof window !== 'undefined') {
      const overflow = window.document.body.style.overflow
      window.document.body.style.overflow = 'hidden'
      return () => {
        window.document.body.style.overflow = overflow
      }
    }
    return () => null
  }, [visible])
  const handleClickModalWrapper = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!props.maskClosable || !props.onClose) {
        return
      }
      if (!modalRef.current || !modalRef.current.contains(event.target as Node)) {
        props.onClose()
      }
    },
    [props.maskClosable, props.onClose]
  )
  return (
    <div ref={containerRef}>
      <Transition in={visible} timeout={{ appear: 0, enter: 0, exit: duration }} unmountOnExit>
        {(state) => {
          return (
            <div
              className={clx(classes.mask, {
                [classes.maskEntering]: state === ENTERING,
                [classes.maskEntered]: state === ENTERED,
                [classes.maskExiting]: state === EXITING,
                [classes.maskExited]: state === EXITED,
              })}
            />
          )
        }}
      </Transition>
      <Transition in={visible} timeout={{ appear: 0, enter: 0, exit: duration }} unmountOnExit>
        {(state) => (
          <div
            onClick={handleClickModalWrapper}
            ref={props.containerRef as RefObject<HTMLDivElement>}
            className={clx(classes.modalWrapper, {
              [classes.modalWrapperEntering]: state === ENTERING,
              [classes.modalWrapperEntered]: state === ENTERED,
              [classes.modalWrapperExiting]: state === EXITING,
              [classes.modalWrapperExited]: state === EXITED,
            })}
            style={{ transformOrigin: `${pos.current?.left ?? 0}px ${pos.current?.top ?? 0}px` }}>
            <div className={clx(classes.modal)} ref={modalRef}>
              <div className={classes.header}>
                <div className={classes.title}>{props.title}</div>
                <div
                  className={clx(classes.closeBtn, props.closeBtnProps?.className)}
                  data-testid={props.closeBtnProps?.testID}
                  onClick={props.onClose}
                  title="close">
                  <AiFillCloseCircle />
                </div>
              </div>
              {children}
            </div>
          </div>
        )}
      </Transition>
    </div>
  )
}

export { Modal }
