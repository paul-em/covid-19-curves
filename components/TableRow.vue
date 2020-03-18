<template>
  <div
    class="border-b "
    v-on="$listeners"
  >
    <div
      v-for="(column, index) in columns"
      :key="column.value"
      :style="getColumnStyles(column, index)"
      class="truncate inline-block text-sm p-2"
    >
      {{ column.formatter ? column.formatter(row): row[column.value] }}
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
    getColumnStyles(column, index) {
      const styles = {};
      if (index !== this.columns.length - 1) {
        styles.width = `${column.width}px`;
      }
      if (column.serverity) {
        const serverity = column.serverity(this.row);
        if (serverity > 0.5) {
          styles.color = '#e3342f';
        }
        if (serverity > 0.8) {
          styles.fontSize = '1rem';
        }
        if (serverity < 0) {
          styles.color = '#38c172';
        }
        if (serverity < -0.5) {
          styles.fontSize = '1rem';
        }
      }
      return styles;
    },
  },
};
</script>


<style lang="scss" scoped>
</style>
