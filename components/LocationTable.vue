<template>
  <div class="overflow-y-scroll">
    <table>
      <thead>
        <tr>
          <th>
            Color
          </th>
          <th
            class="cursor-pointer"
            @click="changeSorting('location')"
          >
            Location
          </th>
          <th
            class="cursor-pointer"
            @click="changeSorting('new_deaths')"
          >
            New Deaths
          </th>
          <th
            class="cursor-pointer"
            @click="changeSorting('total_deaths')"
          >
            Total Deaths
          </th>
          <th
            class="cursor-pointer"
            @click="changeSorting('new_cases')"
          >
            New Cases
          </th>
          <th
            class="cursor-pointer"
            @click="changeSorting('total_cases')"
          >
            Total Cases
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="row.location"
          class="cursor-pointer"
          @click="toggleSelection(row.location)"
        >
          <td>
            <color-surface
              :style="{ opacity: value.includes(row.location) ? 1 : 0.2 }"
              :value="row.location"/>
          </td>
          <td>
            {{ row.location }}
          </td>
          <td>
            {{ row.new_deaths }}
          </td>
          <td>
            {{ row.total_deaths }}
          </td>
          <td>
            {{ row.new_cases }}
          </td>
          <td>
            {{ row.total_cases }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import ColorSurface from './ColorSurface.vue';

export default {
  components: {
    ColorSurface,
  },
  props: {
    value: { type: Array, default: () => [] },
    data: { type: Array, required: true },
  },
  data: () => ({
    sortBy: 'total_cases',
    sortDesc: true,
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
    rows() {
      const rows = this.locations
        .map((location) => {
          const locationData = this.data.filter(item => item.location === location);
          const latest = locationData[locationData.length - 1];
          return {
            location: latest.location,
            new_cases: parseInt(latest.new_cases || 0, 10),
            new_deaths: parseInt(latest.new_deaths || 0, 10),
            total_cases: parseInt(latest.total_cases || 0, 10),
            total_deaths: parseInt(latest.total_deaths || 0, 10),
          };
        })
        .sort((a, b) => {
          if (typeof a[this.sortBy] === 'string') {
            return a[this.sortBy].localeCompare(b[this.sortBy]);
          }
          return a[this.sortBy] - b[this.sortBy];
        });
      if (this.sortDesc) {
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
    changeSorting(sort) {
      if (this.sortBy === sort) {
        this.sortDesc = !this.sortDesc;
      } else {
        this.sortBy = sort;
        this.sortDesc = true;
      }
    },
  },
};
</script>


<style lang="scss" scoped>

</style>
