<template>
  <div
    :style="{ width: `${width}px` }"
    class="m-auto"
  >
    <table-header
      v-model="sort"
      :columns="columns"
      class="sticky top-0 z-10"
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
import populations from '../assets/populations';

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
      prop: 'active_cases',
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
          label: 'Active Cases',
          value: 'active_cases',
          width: 75,
        },
        {
          label: 'New Cases',
          value: 'new_cases',
          width: 75,
          formatter: row => (row.new_cases > 1 ? `+${row.new_cases}` : ''),
          serverity: (row) => {
            const population = populations[row.location];
            if (!population) {
              return 0;
            }
            return Math.min(1, (row.new_cases / population) * 100000);
          },
        },
        {
          label: '% New Cases',
          value: 'new_cases_percent',
          width: 75,
          formatter: row => (row.new_cases_percent > 1 ? `${row.new_cases_percent}%` : ''),
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
          serverity: row => row.cases_in_million / 500,
        },
        {
          label: 'Cases Doubled',
          value: 'cases_doubled',
          width: 75,
          formatter: (row) => {
            if (row.cases_doubled > 1) {
              return `${row.cases_doubled} days`;
            }
            if (row.cases_doubled === 1) {
              return '1 day';
            }
            return '';
          },
        },
        {
          label: 'New Recovered',
          value: 'new_recovered',
          width: 75,
          formatter: row => (row.new_recovered > 1 ? `+${row.new_recovered}` : ''),
          serverity: (row) => {
            const population = populations[row.location];
            if (!population) {
              return 0;
            }
            return -Math.min(1, (row.new_recovered / population) * 100000);
          },
        },
        {
          label: 'Total Recovered',
          value: 'total_recovered',
          width: 75,
        },
        {
          label: '% Recovered',
          value: 'recovered_percent',
          width: 75,
          formatter: row => (row.recovered_percent > 1 ? `${row.recovered_percent}%` : ''),
        },
        {
          label: 'New Deaths',
          value: 'new_deaths',
          width: 75,
          formatter: row => (row.new_deaths > 1 ? `+${row.new_deaths}` : ''),
          serverity: (row) => {
            const population = populations[row.location];
            if (!population) {
              return 0;
            }
            return Math.min(1, (row.new_cases / population) * 100000);
          },
        },
        {
          label: '% New Deaths',
          value: 'new_deaths_percent',
          width: 75,
          formatter: row => (row.new_deaths_percent > 1 ? `${row.new_deaths_percent}%` : ''),
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
          serverity: row => row.deaths_in_million / 50,
        },
        {
          label: 'Deaths Doubled',
          value: 'deaths_doubled',
          width: 75,
          formatter: (row) => {
            if (row.deaths_doubled > 1) {
              return `${row.deaths_doubled} days`;
            }
            if (row.deaths_doubled === 1) {
              return '1 day';
            }
            return '';
          },
        },
        {
          label: '% Deaths',
          value: 'deaths_percent',
          width: 75,
          formatter: row => (row.deaths_percent > 1 ? `${row.deaths_percent}%` : ''),
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
.top-0 {
  top: 0;
}
</style>
