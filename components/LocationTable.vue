<template>
  <div
    :style="{ width: `${width}px` }"
  >
    <table-header
      v-model="sort"
      :columns="columns"
      class="sticky top-0"
      @input="emitSortUpdate"
    />
    <div>
      <table-row
        v-for="row in rows"
        :key="row.key"
        :columns="columns"
        :row="row"
        :class="{ 'opacity-50': !value.includes(row.key) }"
        class="cursor-pointer hover:opacity-75"
        @click="toggleSelection(row.key)">
        <color-surface
          slot="column-color"
          :value="row.location"
          :class="{ 'opacity-25': !value.includes(row.key) }"
          class="rounded-full"
        />
      </table-row>
    </div>
  </div>
</template>

<script>
import ColorSurface from './ColorSurface.vue';
import TableHeader from './TableHeader.vue';
import TableRow from './TableRow.vue';

export default {
  components: {
    ColorSurface,
    TableHeader,
    TableRow,
  },
  props: {
    value: { type: Array, default: () => [] },
    data: { type: Array, required: true },
  },
  data: () => ({
    sort: {
      prop: 'total_cases',
      desc: true,
    },
  }),
  computed: {
    locations() {
      const locations = [];
      this.data.forEach((item) => {
        if (!locations.includes(item.location)) {
          locations.push(item.location);
        }
      });
      return locations;
    },
    columns() {
      return [
        {
          label: '',
          value: 'color',
          width: 36,
          static: true,
        },
        {
          label: 'Location',
          value: 'location',
          width: 200,
          static: true,
        },
        {
          label: 'New Cases',
          value: 'new_cases',
          width: 75,
          prefix: v => (v > 1 ? '+' : ''),
        },
        {
          label: 'Total Cases',
          value: 'total_cases',
          width: 75,
        },
        {
          label: 'Cases / Million',
          value: 'cases_in_million',
          width: 75,
        },
        {
          label: 'Cases Doubled',
          value: 'cases_doubled',
          width: 75,
          postfix: v => (v > 1 ? ' days' : ' day'),
        },
        {
          label: 'New Deaths',
          value: 'new_deaths',
          width: 75,
          prefix: v => (v > 1 ? '+' : ''),
        },
        {
          label: 'Total Deaths',
          value: 'total_deaths',
          width: 75,
        },
        {
          label: 'Deaths / Million',
          value: 'deaths_in_million',
          width: 75,
        },
        {
          label: 'Deaths Doubled',
          value: 'deaths_doubled',
          width: 75,
          postfix: v => (v > 1 ? ' days' : ' day'),
        },
      ];
    },
    width() {
      let total = 0;
      this.columns.forEach((column) => {
        total += column.width;
      });
      return total;
    },
    rows() {
      const rows = this.locations
        .map((location) => {
          const locationData = this.data.filter(item => item.location === location);
          const latest = locationData[locationData.length - 1];
          return {
            ...latest,
            key: latest.location,
          };
        })
        .sort((a, b) => {
          if (typeof a[this.sort.prop] === 'string') {
            return a[this.sort.prop].localeCompare(b[this.sort.prop]);
          }
          return a[this.sort.prop] - b[this.sort.prop];
        });
      if (this.sort.desc) {
        return rows.reverse();
      }
      return rows;
    },
  },
  methods: {
    toggleSelection(location) {
      if (this.value.includes(location)) {
        this.$emit('input', this.value.filter(selectedItem => selectedItem !== location));
      } else {
        this.$emit('input', [
          ...this.value,
          location,
        ]);
      }
    },
    emitSortUpdate(sort) {
      const column = this.columns.find(c => c.value === sort.prop);
      if (column && !column.static) {
        this.$emit('columnSelect', column);
      }
    },
  },
};
</script>


<style lang="scss" scoped>
</style>
