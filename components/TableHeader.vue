<template>
  <header class="border-t border-b p-y-2 bg-grey-lighter">
    <div
      v-for="column in columns"
      :key="column.value"
      :style="{ width: `${column.width}px` }"
      :class="{
        'text-black': value.prop === column.value,
        'text-grey-dark': value.prop !== column.value,
      }"
      class="cursor-pointer inline-block font-semibold text-sm p-2"
      @click="changeSorting(column.value)"
    >
      {{ column.label }}
    </div>
  </header>
</template>

<script>
import ColorSurface from './ColorSurface.vue';

export default {
  components: {
    ColorSurface,
  },
  props: {
    value: { type: Object, required: true },
    columns: { type: Array, required: true },
  },
  methods: {
    changeSorting(prop) {
      if (this.value.prop === prop) {
        this.$emit('input', {
          prop: this.value.prop,
          desc: !this.value.desc,
        });
      } else {
        this.$emit('input', {
          prop,
          desc: true,
        });
      }
    },
  },
};
</script>


<style lang="scss" scoped>
</style>
