import 'styled-components';

import {theme} from './resources/theme.json';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {[K in keyof typeof theme.colors]: string};
  }
}
