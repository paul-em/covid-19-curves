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
          width: 200,
        },
        {
          label: 'New Cases',
          value: 'new_cases',
          width: 80,
        },
        {
          label: 'Total Cases',
          value: 'total_cases',
          width: 80,
        },
        {
          label: 'Cases / Million',
          value: 'cases_in_million',
          width: 80,
        },
        {
          label: 'Cases Doubled',
          value: 'cases_doubled',
          width: 80,
        },
        {
          label: 'New Deaths',
          value: 'new_deaths',
          width: 80,
        },
        {
          label: 'Total Deaths',
          value: 'total_deaths',
          width: 80,
        },
        {
          label: 'Deaths / Million',
          value: 'deaths_in_million',
          width: 80,
        },
        {
          label: 'Deaths Doubled',
          value: 'deaths_doubled',
          width: 80,
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
            new_cases: parseInt(latest.new_cases || 0, 10),
            new_deaths: parseInt(latest.new_deaths || 0, 10),
            total_cases: parseInt(latest.total_cases || 0, 10),
            total_deaths: parseInt(latest.total_deaths || 0, 10),
            deaths_doubled: this.getDeathsDoubled(location),
            cases_doubled: this.getCasesDoubled(location),
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
    getDeathsDoubled() {
      return 1;
    },
    getCasesDoubled() {
      return 1;
    },
  },
};
</script>


<style lang="scss" scoped>
</style>
