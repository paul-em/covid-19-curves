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
        :key="row.location"
        :columns="columns"
        :row="row"
        :class="{ 'opacity-50': !value.includes(row.location) }"
        class="cursor-pointer hover:opacity-75"
        @click="toggleSelection(row.location)">
        <color-surface
          slot="column-color"
          :value="row.location"
          :class="{ 'opacity-25': !value.includes(row.location) }"
          class="rounded-full"
        />
        <a
          slot="column-source"
          :href="row.url"
          target="_blank"
          class="no-underline"
        >🔗</a>
        <a
          slot="column-regions"
          target="#"
          class="no-underline"
          @click.stop="toggleRegions(row.location)"
        >{{ getRegionsCount(row.location) }}
          <expand-icon
            v-if="getRegionsCount(row.location)"
            :expanded="row.location === selectedCountry"/></a>
      </table-row>
    </div>
  </div>
</template>

<script>
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import ColorSurface from './ColorSurface.vue';
import TableHeader from './TableHeader.vue';
import TableRow from './TableRow.vue';
import ExpandIcon from './ExpandIcon.vue';
import countryNames from '../assets/countryNames.json';


export default {
  components: {
    ColorSurface,
    TableHeader,
    TableRow,
    ExpandIcon,
    vSelect,
  },
  props: {
    value: { type: Array, default: () => [] },
    data: { type: Array, required: true },
  },
  data: () => ({
    sort: {
      prop: 'cases',
      desc: true,
    },
    selectedCountry: null,
  }),
  computed: {
    columns() {
      return [
        {
          label: '',
          value: 'color',
          width: 36,
          static: true,
        },
        {
          label: '',
          value: 'source',
          width: 24,
          static: true,
        },
        {
          label: 'Location',
          value: 'name',
          width: 200,
          static: true,
        },
        {
          label: 'Regions',
          value: 'regions',
          width: 70,
          static: true,
        },
        {
          label: 'Population',
          value: 'population',
          formatter: row => this.formatPopulation(row.population),
          width: 80,
          static: true,
        },
        {
          label: 'Total Cases',
          value: 'cases',
          formatter: row => this.formatNumber(row.cases),
          width: 75,
        },
        {
          label: 'New Cases',
          value: 'newCases',
          width: 90,
          formatter: row => (row.newCases > 1 ? `+${this.formatNumber(row.newCases)}` : ''),
          serverity: (row) => {
            if (!row.population) {
              return 0;
            }
            return Math.min(1, (row.newCases / row.population) * 100000);
          },
        },
        {
          label: 'Cases / Million',
          value: 'casesInMillion',
          width: 75,
          serverity: row => row.casesInMillion / 500,
        },
        {
          label: 'Total Deaths',
          value: 'deaths',
          formatter: row => this.formatNumber(row.deaths),
          width: 75,
        },
        {
          label: 'New Deaths',
          value: 'newDeaths',
          width: 75,
          formatter: row => (row.newDeaths > 1 ? `+${row.newDeaths}` : ''),
          serverity: (row) => {
            if (!row.population) {
              return 0;
            }
            return Math.min(1, (row.newDeaths / row.population) * 100000);
          },
        },
        {
          label: '% Deaths',
          value: 'deathsPercent',
          width: 75,
          formatter: row => (row.deathsPercent > 1 ? `${row.deathsPercent}%` : ''),
        },
        /*
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
        */
      ];
    },
    width() {
      let total = 0;
      this.columns.forEach((column) => {
        total += column.width;
      });
      return total;
    },
    filteredData() {
      if (!this.selectedCountry) {
        return this.data.filter(item => !!countryNames[item.location]);
      }
      return this.data.filter(item => item.country === this.selectedCountry);
    },
    rows() {
      const rows = [...this.filteredData]
        .sort((a, b) => {
          if (typeof a[this.sort.prop] === 'string') {
            return a[this.sort.prop].localeCompare(b[this.sort.prop]);
          }
          return (a[this.sort.prop] || 0) - (b[this.sort.prop] || 0);
        });
      if (this.sort.desc) {
        return rows.reverse().slice(0, 50);
      }
      return rows.slice(0, 50);
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
    toggleRegions(country) {
      if (this.selectedCountry === country) {
        this.selectedCountry = null;
      } else {
        this.selectedCountry = country;
      }
    },
    emitSortUpdate(sort) {
      const column = this.columns.find(c => c.value === sort.prop);
      if (column && !column.static) {
        this.$emit('columnSelect', column);
      }
    },
    formatNumber(num) {
      if (!num) {
        return '';
      }
      return Math.floor(num).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    },
    formatPopulation(num) {
      if (!num) {
        return '';
      }
      if (num < 100000) {
        return `${Math.round(num / 10000) / 100}M`;
      }
      if (num < 1000000) {
        return `${Math.round(num / 100000) / 10}M`;
      }
      return `${Math.round(num / 1000000)}M`;
    },
    getRegionsCount(location) {
      return this.data
        .filter(item => item.country === location && item.location !== location)
        .length || '';
    },
  },
};
</script>


<style lang="scss" scoped>
.top-0 {
  top: 0;
}
</style>
