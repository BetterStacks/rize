'use client'

import { createContext, useContext, useRef, ReactNode, useState } from 'react'
import { ImperativePanelHandle } from 'react-resizable-panels'

type PanelContextType = {
    rightPanelRef: React.RefObject<ImperativePanelHandle | null>
    isRightPanelExpanded: boolean
    collapseRightPanel: () => void
    expandRightPanel: () => void
    toggleRightPanel: () => void
}

const PanelContext = createContext<PanelContextType | null>(null)

export function PanelProvider({ children }: { children: ReactNode }) {
    const rightPanelRef = useRef<ImperativePanelHandle>(null)
    const [isRightPanelExpanded, setIsRightPanelExpanded] = useState(true)

    const collapseRightPanel = () => {
        rightPanelRef.current?.collapse()
        setIsRightPanelExpanded(false)
    }

    const expandRightPanel = () => {
        rightPanelRef.current?.expand()
        setIsRightPanelExpanded(true)
    }

    const toggleRightPanel = () => {
        const panel = rightPanelRef.current
        if (panel) {
            if (panel.isCollapsed()) {
                panel.expand()
                setIsRightPanelExpanded(true)
            } else {
                panel.collapse()
                setIsRightPanelExpanded(false)
            }
        }
    }

    return (
        <PanelContext.Provider
            value={{
                rightPanelRef,
                isRightPanelExpanded,
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
