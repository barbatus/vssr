
import tailwindcss from './tailwind.config.js';

export default {
  plugins: {
    tailwindcss: {
      ...tailwindcss,
    },
    autoprefixer: {},
  },
};
