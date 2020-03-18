<template>
  <div
    class="border-b "
    v-on="$listeners"
  >
    <div
      v-for="column in columns"
      :key="column.value"
      :style="{ width: `${column.width}px` }"
      class="truncate inline-block text-sm p-2"
    >
      {{ column.formatter ? column.formatter(row[column.value]): row[column.value] }}
      <slot :name="`column-${column.value}`"/>
    </div>
  </div>
</template>

<script>
import ColorSurface from './ColorSurface.vue';

export default {
  components: {
    ColorSurface,
  },
  props: {
    columns: { type: Array, required: true },
    row: { type: Object, required: true },
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
