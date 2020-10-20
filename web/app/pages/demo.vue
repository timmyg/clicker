<template>
  <div>Redirecting...</div>
</template>

<script>
export default {
  fetch ({ params, redirect }) {
    redirect(301, `https://release.mobile.tryclicker.com`)
  }
}
</script>
