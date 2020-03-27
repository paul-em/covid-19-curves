<template>
  <span
    :class="{ expanded }"
    class="expand"
  />
</template>

<script>
export default {
  props: {
    expanded: { type: Boolean, default: false },
  },
};
</script>

<style lang="scss" scoped>
  .expand {
    display: inline-block;
    margin: 3px;
    width: 6px;
    height: 6px;
    border-right: 2px solid black;
    border-bottom: 2px solid black;
    transform: rotate(45deg);
    transition: transform 200ms;
  }

  .expanded {
    transform: rotate(225deg);
  }
</style>
