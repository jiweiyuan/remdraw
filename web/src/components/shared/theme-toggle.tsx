import {Monitor, Moon, Sun} from 'lucide-react';

import {useTheme} from '@/providers/theme-provider';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
      <div className="flex items-center space-x-4 rounded-lg">
          <span className="text-sm">Theme</span>
            <button
                onClick={() => setTheme('light')}
                className={`${
                    theme == 'light' ? 'bg-primary text-white': ''
                } p-2 rounded-lg`}
            >
                <Sun size={12} />
            </button>
            <button
                onClick={() => setTheme('dark') }
                className={`${
                    theme == 'dark' ? 'bg-primary  text-black' : ''
                } p-2 rounded-lg`}
            >
                <Moon size={12} />
            </button>
            <button
                onClick={() => {
                    setTheme('system');
                }}
                className={`${
                    theme == 'system' ? 'bg-primary text-white dark:text-black' : ''
                } p-2 rounded-lg`}
            >
                <Monitor size={12} />
            </button>

      </div>
  );
}
