const colors = require('tailwindcss/colors')

delete colors?.lightBlue
delete colors?.warmGray
delete colors?.trueGray
delete colors?.coolGray
delete colors?.blueGray

module.exports = {
  content: ['./src/**/*.{ts,tsx}', './src/pages/**/*.{ts,tsx}'],
  media: false,
  mode: 'jit',
  theme: {
    colors: {
      // You may customize your own custom color here
      primary: '#BA954F',
      dark: '#1A1A1A',
      secondary: '#222222',
      light: '#F7F7F7',
      lightGray: '#DCDFE7',
      midGray: '#808797',
      yellow: '#F8FE11',
      danger: '#FF6961',
      warning: '#FFB340',
      success: '#1F8E4B',
      primaryBlue: '#3E97FF',
      ...colors
    },
    fontFamily: {
      body: ['Sofia Pro', 'sans-serif']
    },
    extend: {
      boxShadow: {
        frame: '0px 4px 32px -8px rgba(32, 38, 34, 0.16)'
      }
    }
  },
  plugins: [
    require('tailwind-filter-utilities'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    function ({ addVariant }) {
      addVariant('child', '& > *'),
        addVariant('child-hover', '& > *:hover'),
        addVariant('child-hover-el', '&:hover > *'),
        addVariant('last-child-hover', '&:hover > *:last-child'),
        addVariant('find-child-hover', '&:hover .hover-this')
    }
  ]
}
