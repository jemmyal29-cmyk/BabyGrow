/**
 * Dark mode hook untuk BabyGrow
 */

import { useState } from 'react';

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  return {
    isDark,
    isDarkMode: isDark,
    toggleDarkMode,
  };
};