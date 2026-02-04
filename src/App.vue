<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto flex w-full max-w-2xl flex-col px-6 py-16">
      <main>
        <RouterView />
      </main>
    </div>
  </div>
</template>
