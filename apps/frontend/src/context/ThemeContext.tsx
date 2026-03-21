import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

interface ThemeCtx {
    theme: 'dark' | 'light'
    toggle: () => void
}

const ThemeCtxObj = createContext<ThemeCtx>({ theme: 'dark', toggle: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<'dark' | 'light'>(
        () => (localStorage.getItem('minisiem_theme') as 'dark' | 'light') || 'dark'
    )

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('minisiem_theme', theme)
    }, [theme])

    return (
        <ThemeCtxObj.Provider value={{ theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }}>
            {children}
        </ThemeCtxObj.Provider>
    )
}

export function useTheme() {
    return useContext(ThemeCtxObj)
}