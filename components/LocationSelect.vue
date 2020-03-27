<template>
  <div>
    <span
      v-for="item in value"
      :key="item"
      :style="{ 'border-color': $color.hex(item) }"
      class="border-b-2 mr-4 my-2 inline-block cursor-pointer"
      @click="unselect(item)"
    >
      {{ item }}
    </span>
    <div class="inline-block dropdown">
      <v-select
        :options="filteredLocations"
        :filterable="false"
        :components="{OpenIndicator}"
        :value="null"
        placeholder="Add another"
        @search="query => search = query"
        @input="select"/>
    </div>
  </div>
</template>

<script>
import Fuse from 'fuse.js';
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import countryNamesMap from '../assets/countryNames.json';

const countryNames = Object.values(countryNamesMap);

export default {
  components: {
    vSelect,
  },
  model: {
    prop: 'value',
    event: 'input',
  },
  props: {
    locations: { type: Array, required: true },
    value: { type: Array, required: true },
  },
  data: () => ({
    search: '',
    OpenIndicator: {
      render: createElement => createElement('span', ''),
    },
  }),
  computed: {
    notSelectedLocations() {
      return this.locations.filter(location => !this.value.includes(location));
    },
    filteredLocations() {
      if (this.search) {
        const result = new Fuse(this.notSelectedLocations.map(value => ({
          value,
        })), {
          keys: ['value'],
          shouldSort: true,
          threshold: 0.4,
        }).search(this.search);
        return result.slice(0, 20).map(r => r.item.value);
      }
      return this.notSelectedLocations
        .filter(location => countryNames.includes(location))
        .sort();
    },
  },
  methods: {
    select(area) {
      this.$emit('input', [
        ...this.value,
        area,
      ]);
    },
    unselect(area) {
      this.$emit('input', [...this.value].filter(a => a !== area));
    },
  },
};
</script>

<style scoped>
.dropdown {
  min-width: 260px;
}
</style>

<style>
.area-select {
  min-height: 100px;
}

.vs__dropdown-toggle {
  border: 0;
}
</style>
