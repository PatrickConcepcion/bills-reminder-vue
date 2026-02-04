<template>
  <div class="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
    <div class="flex flex-col gap-2">
      <h2 class="text-2xl font-semibold">Dashboard</h2>
      <p class="text-sm text-slate-500">
        Your account overview will appear here.
      </p>
    </div>

    <div class="mt-8 grid gap-4 sm:grid-cols-2">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Due soon</p>
        <p class="mt-3 text-2xl font-semibold text-slate-900">0 bills</p>
        <p class="mt-1 text-sm text-slate-500">Nothing due in the next week.</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</p>
        <p class="mt-3 text-2xl font-semibold text-slate-900">Up to date</p>
        <p class="mt-1 text-sm text-slate-500">All reminders are current.</p>
      </div>
    </div>
  </div>
</template>
