import autoprefixer     from 'autoprefixer';
import cssnano          from 'cssnano';
import postcssNesting   from 'postcss-nesting';
import postcssPresetEnv from 'postcss-preset-env';

export default {
  plugins: [
    autoprefixer,
    cssnano,
    postcssNesting,
    postcssPresetEnv,
  ],
};