<script setup lang="ts">
import { moduleTree } from '../composables/fetch'
</script>

<template>
  <div h-full border="r main">
    <div of-hidden>
      <NarBar />
      <div
        pt="4"
        flex="~ col gap-3"
      >
        <RouterLink block to="/" text-sm m="l-3.7">
          <div i-carbon-dashboard />
          <span>
            Overview
          </span>
        </RouterLink>
        <RouterLink block to="/repl" text-sm m="l-3.7">
          <div i-carbon-terminal />
          <span>
            REPL
          </span>
        </RouterLink>
        <div border="b main" />
      </div>
    </div>
    <div class="scrolls scrolls-sidebar">
      <ModuleTreeNode
        v-if="Object.keys(moduleTree.workspace.children).length"
        :node="moduleTree.workspace"
        p="l3 t4"
        icon="i-carbon-portfolio"
      />
      <ModuleTreeNode
        v-if="Object.keys(moduleTree.root.children).length"
        :node="moduleTree.root"
        p="l3 t4"
        icon="i-carbon-vmdk-disk"
      />
      <ModuleTreeNode
        v-if="Object.keys(moduleTree.nodeModules.children).length"
        :node="moduleTree.nodeModules"
        p="l3 t4"
        icon="i-carbon-categories"
      />
    </div>
  </div>
</template>
