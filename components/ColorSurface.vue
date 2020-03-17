<template>
  <div
    :style="{ 'background-color': $color.hex(value) }"
    class="h-full">&nbsp;</div>
</template>

<script>
export default {
  props: {
    value: { type: String, required: true },
  },
};
</script>
