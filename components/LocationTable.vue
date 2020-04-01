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
        :key="row.name"
        :columns="columns"
        :row="row"
        :class="{ 'opacity-50': !value.includes(row.name) }"
        class="cursor-pointer hover:opacity-75"
        @click="toggleSelection(row.name)">
        <color-surface
          slot="column-color"
          :value="row.name"
          :class="{ 'opacity-25': !value.includes(row.name) }"
          class="rounded-full"
        />
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
import columns from './columns';


function formatPopulation(num) {
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
}

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
          formatter: row => formatPopulation(row.population),
          width: 80,
          static: true,
        },
        ...columns,
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
        return this.data.filter(item => !!item.isCountry);
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
    toggleSelection(name) {
      if (this.value.includes(name)) {
        this.$emit('input', this.value.filter(selectedItem => selectedItem !== name));
      } else {
        this.$emit('input', [
          ...this.value,
          name,
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
