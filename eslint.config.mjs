// @ts-check
import prettier from 'prettier'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'vue/html-self-closing': 'off',
    'vue/no-v-html': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    '@stylistic/brace-style': 'off',
    '@stylistic/arrow-parens': 'off',
    '@stylistic/operator-linebreak': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',
  },
  plugins: {
    prettier,
  },
})
