'use client'

import { createContext, useContext, useRef, ReactNode } from 'react'
import { ImperativePanelHandle } from 'react-resizable-panels'

type PanelContextType = {
    rightPanelRef: React.RefObject<ImperativePanelHandle> | null
    collapseRightPanel: () => void
    expandRightPanel: () => void
    toggleRightPanel: () => void
}

const PanelContext = createContext<PanelContextType | null>(null)

export function PanelProvider({ children }: { children: ReactNode }) {
    const rightPanelRef = useRef<ImperativePanelHandle>(null)

    const collapseRightPanel = () => {
        rightPanelRef.current?.collapse()
    }

    const expandRightPanel = () => {
        rightPanelRef.current?.expand()
    }

    const toggleRightPanel = () => {
        const panel = rightPanelRef.current
        if (panel) {
            if (panel.isCollapsed()) {
                panel.expand()
            } else {
                panel.collapse()
            }
        }
    }

    return (
        <PanelContext.Provider
            value={{
                rightPanelRef,
                collapseRightPanel,
                expandRightPanel,
                toggleRightPanel,
            }}
        >
            {children}
        </PanelContext.Provider>
    )
}

export function usePanel() {
    const context = useContext(PanelContext)
    if (!context) {
        throw new Error('usePanel must be used within a PanelProvider')
    }
    return context
}
