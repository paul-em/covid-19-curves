<template>
  <div class="column-select">
    <v-select
      :options="columns"
      :value="selectedColumn"
      :clearable="false"
      :searchable="false"
      :components="{OpenIndicator}"
      label="label"
      placeholder="Select Column"
      @input="select"/>
  </div>
</template>

<script>
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import columns from './columns';

export default {
  components: {
    vSelect,
  },
  model: {
    prop: 'value',
    event: 'input',
  },
  props: {
    value: { type: String, default: null },
  },
  data: () => ({
    OpenIndicator: {
      render: createElement => createElement('span', ''),
    },
  }),
  computed: {
    columns() {
      return columns;
    },
    selectedColumn() {
      return columns.find(column => column.value === this.value);
    },
  },
  methods: {
    select(column) {
      this.$emit('input', column.value);
    },
  },
};
</script>

<style>
.column-select {
  min-width: 70px;
}

.column-select .vs__dropdown-toggle {
  border: 0;
}

.column-select .vs__selected {
  border-bottom: 2px solid black;
  border-radius: 0;
  padding: 0;
}


.column-select .vs__search,
.column-select .vs__actions {
  padding: 0;
}
</style>
