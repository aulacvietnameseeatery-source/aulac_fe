/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {}, // 👈 Quan trọng: Phải là cái này
  },
};

export default config;