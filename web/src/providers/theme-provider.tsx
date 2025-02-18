import React, {createContext, useContext, useEffect, useState} from 'react';

export type Theme = 'light'| 'dark'  | 'system';
export type Layout = 'full' | 'left-sidebar' | 'right-sidebar' | 'double-sidebar'

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultLayout?: Layout;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  layout: Layout;
  setLayout: (layout: Layout) => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  closeSidebar: () => void;
};

const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null,
  layout: 'full',
  setLayout: () => null,
  toggleLeftSidebar: () => null,
  toggleRightSidebar: () => null,
  closeSidebar: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export default function ThemeProvider({
  children,
  defaultTheme = 'light', defaultLayout = 'left-sidebar',
  storageKey = 'remdraw-ui-theme',
  ...props
}: ThemeProviderProps) {

  const [theme, setTheme] = useState<Theme>(
    () => localStorage.getItem(storageKey) as Theme || defaultTheme
  );

  const [layout, setLayout] = useState<Layout>(defaultLayout);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      // const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
      //   .matches
      //   ? 'dark'
      //   : 'light';
      const systemTheme = 'light';

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    getTheme: (theme: Theme) => {
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: light)')
            .matches
            ? 'light'
            : 'dark';
      }
      return theme;
    },
    layout,
    setLayout: (layout: Layout) => {
      setLayout(layout);
    },
    toggleLeftSidebar: () => {
      if (layout === 'full') {
        setLayout('left-sidebar');
      }
      if (layout === 'left-sidebar') {
        setLayout('full');
      }
      if (layout === 'right-sidebar') {
        setLayout('double-sidebar');
      }
      if (layout === 'double-sidebar') {
        setLayout('right-sidebar');
      }
    },
    toggleRightSidebar: () => {
      if (layout === 'full') {
        setLayout('right-sidebar');
      }
      if (layout === 'right-sidebar') {
        setLayout('full');
      }
      if (layout === 'left-sidebar') {
        setLayout('double-sidebar');
      }
      if (layout === 'double-sidebar') {
        setLayout('left-sidebar');
      }
    },
    closeSidebar: () => {
      if (layout === 'left-sidebar') {
        setLayout('full');
      }
      if (layout === 'right-sidebar') {
        setLayout('full');
      }
      if (layout === 'double-sidebar') {
        setLayout('full');
      }
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
