<template>
  <div
    :style="{ width: `${width}px` }"
  >
    <table-header
      v-model="sort"
      :columns="columns"
      class="sticky top-0"
      @input="v => $emit('columnSelect', v.prop)"
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
        },
        {
          label: 'Location',
          value: 'location',
          width: 250,
        },
        {
          label: 'New Deaths',
          value: 'new_deaths',
          width: 120,
        },
        {
          label: 'Total Deaths',
          value: 'total_deaths',
          width: 120,
        },
        {
          label: 'New Cases',
          value: 'new_cases',
          width: 120,
        },
        {
          label: 'Total Cases',
          value: 'total_cases',
          width: 120,
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
            key: latest.location,
            location: latest.location,
            new_cases: parseInt(latest.new_cases || 0, 10),
            new_deaths: parseInt(latest.new_deaths || 0, 10),
            total_cases: parseInt(latest.total_cases || 0, 10),
            total_deaths: parseInt(latest.total_deaths || 0, 10),
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
  },
};
</script>


<style lang="scss" scoped>
</style>
