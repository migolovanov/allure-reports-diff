<template>
  <div class="row">
    <q-card-section class="col">
      <q-input clearable filled v-model="allureAddress" label="Allure address" />
    </q-card-section>
    <q-card-section class="col">
      <q-select v-model="firstReport" :options="reportList"
        :label="'First report ' + ((firstReportSummary.time?.stop) ? '('
          + new Date(firstReportSummary.time.stop).toISOString()
          + ': S:' + (firstReportSummary.statistic?.passed || 0)
          + ', F:' + (firstReportSummary.statistic?.failed || 0)
          + ', B:' + (firstReportSummary.statistic?.broken || 0)
          + ')' : '')" />
    </q-card-section>
    <q-card-section class="col">
      <q-select v-model="secondReport" :options="reportList"
        :label="'Second report ' + ((secondReportSummary.time?.stop) ? '('
          + new Date(secondReportSummary.time.stop).toISOString()
          + ': S:' + (secondReportSummary.statistic?.passed || 0)
          + ', F:' + (secondReportSummary.statistic?.failed || 0)
          + ', B:' + (secondReportSummary.statistic?.broken || 0)
          + ')' : '')" />
    </q-card-section>
  </div>
  <div class="row">
    <div class="col">
      <q-table
        :rows="tableData.rows"
        :columns="tableData.columns"
        :pagination="{ rowsPerPage: 15, sortBy: 'name'}"
        row-key="name"
        v-if="tableData.rows.length > 0"
      >
        <template v-slot:body-cell="props">
          <q-td
            :props="props"
            :class="(props.row.state_second == 'passed') ? 'bg-green-2' : 'bg-red-2'"
          >
          {{props.value}}
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { mapGetters, mapState } from 'vuex'

export default defineComponent({
  name: 'PageIndex',
  data: () => ({
    allureAddress: ref('http://localhost:5050'),
    firstReport: ref(null),
    secondReport: ref(null)
  }),
  computed: {
    ...mapState({
      tableData: 'table_data',
      firstReportSummary: 'first_report',
      secondReportSummary: 'second_report'
    }),
    ...mapGetters({ reportList: 'report_list' })
  },
  watch: {
    allureAddress: function (val) {
      this.$store.dispatch('updateAllureAddress', val)
      this.$store.dispatch('getReportList')
    },
    firstReport: function (val) {
      this.$store.dispatch('updateReportSummary', { name: 'first', value: this.firstReport })
    },
    secondReport: function (val) {
      this.$store.dispatch('updateReportSummary', { name: 'second', value: this.secondReport })
    }
  },
  mounted () {
    this.$store.dispatch('getReportList')
  },
  setup () {
    return {
    }
  }
})

</script>
