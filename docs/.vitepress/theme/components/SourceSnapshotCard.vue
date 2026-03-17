<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'

interface SourceSnapshotEntry {
  label: string
  path: string
  href?: string
}

const props = defineProps({
  title: {
    type: String,
    default: '源码快照'
  },
  description: {
    type: String,
    default: ''
  },
  repo: {
    type: String,
    required: true
  },
  repoUrl: {
    type: String,
    default: ''
  },
  branch: {
    type: String,
    default: 'main'
  },
  commit: {
    type: String,
    default: ''
  },
  verifiedAt: {
    type: String,
    default: ''
  },
  entries: {
    type: Array as PropType<SourceSnapshotEntry[]>,
    default: () => []
  }
})

const repoLink = computed(() => {
  if (props.repoUrl) return props.repoUrl
  return `https://github.com/${props.repo}`
})

const commitLink = computed(() => {
  if (!props.commit) return ''
  return `https://github.com/${props.repo}/commit/${props.commit}`
})

const shortCommit = computed(() => {
  if (!props.commit) return ''
  return props.commit.substring(0, 7)
})
</script>

<template>
  <section class="source-snapshot" aria-label="源码快照">
    <header class="snapshot-header">
      <p class="snapshot-eyebrow">Source Snapshot</p>
      <h3 class="snapshot-title">{{ title }}</h3>
      <p v-if="description" class="snapshot-description">{{ description }}</p>
    </header>

    <div class="snapshot-meta">
      <div class="meta-item">
        <span class="meta-label">仓库</span>
        <a :href="repoLink" target="_blank" rel="noopener" class="meta-value">
          {{ repo }}
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="external-icon"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </div>
      <div class="meta-item">
        <span class="meta-label">分支</span>
        <code class="meta-value code">{{ branch }}</code>
      </div>
      <div v-if="commit" class="meta-item">
        <span class="meta-label">Commit</span>
        <a :href="commitLink" target="_blank" rel="noopener" class="meta-value mono">
          {{ shortCommit }}
        </a>
      </div>
      <div v-if="verifiedAt" class="meta-item">
        <span class="meta-label">验证时间</span>
        <span class="meta-value">{{ verifiedAt }}</span>
      </div>
    </div>

    <div v-if="entries.length > 0" class="snapshot-entries">
      <div v-for="entry in entries" :key="entry.path" class="entry-item">
        <span class="entry-label">{{ entry.label }}</span>
        <code class="entry-path">{{ entry.path }}</code>
        <a v-if="entry.href" :href="entry.href" target="_blank" rel="noopener" class="entry-link">
          查看
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.source-snapshot {
  margin: 24px 0;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.snapshot-header {
  margin-bottom: 16px;
}

.snapshot-eyebrow {
  margin: 0 0 4px;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

.snapshot-title {
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.3;
  border: none;
}

.snapshot-description {
  margin: 8px 0 0;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.snapshot-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.meta-value {
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-value.code,
.entry-path {
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  background: var(--vp-c-bg);
  padding: 2px 8px;
  border-radius: 4px;
}

.meta-value.mono {
  font-family: var(--vp-font-family-mono);
}

.meta-value a,
.entry-link {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.meta-value a:hover,
.entry-link:hover {
  text-decoration: underline;
}

.external-icon {
  opacity: 0.6;
}

.snapshot-entries {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.entry-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
}

.entry-label {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  min-width: 120px;
}

.entry-path {
  flex: 1;
}

.entry-link {
  font-size: 0.85rem;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.entry-link:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .snapshot-meta {
    flex-direction: column;
    gap: 12px;
  }

  .entry-item {
    flex-wrap: wrap;
  }

  .entry-label {
    min-width: 100%;
  }
}
</style>
