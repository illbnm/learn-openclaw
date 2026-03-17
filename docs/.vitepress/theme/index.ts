import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import SourceSnapshotCard from './components/SourceSnapshotCard.vue'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // 可在此添加布局插槽
    })
  },
  enhanceApp({ app }) {
    // 注册全局组件
    app.component('SourceSnapshotCard', SourceSnapshotCard)
  }
}
