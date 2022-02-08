const axios = require('axios')
import { store } from 'quasar/wrappers'
import { createStore } from 'vuex'

// import example from './module-example'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

function recursiveParsing (data) {
  let result = {}
  if (data.children) {
    data.children.forEach(item => {
      result = { ...result, ...recursiveParsing(item) }
    })
  } else {
    result[data.name] = data.status
  }
  return result
}

export default store(function (/* { ssrContext } */) {
  const Store = createStore({
    modules: {
      // example
    },

    state: {
      allure_address: 'http://localhost:5050',
      report_list: [],
      first_report: {},
      second_report: {},
      table_data: {
        rows: [],
        columns: [
          { name: 'name', align: 'center', label: 'Test Name', field: 'name', sortable: true },
          { name: 'status', align: 'center', label: 'Status', field: 'status', sortable: true },
          { name: 'state_first', align: 'center', label: 'State (first)', field: 'state_first', sortable: true },
          { name: 'state_second', align: 'center', label: 'State (second)', field: 'state_second', sortable: true }
        ]
      }
    },

    getters: {
      report_list: state => state.report_list
    },

    actions: {
      getReportList: ({ commit, state }) => {
        axios.get(state.allure_address + '/allure-docker-service/projects/waf-core-autotest').then(response => {
          commit('updateReportList', response.data.data)
        })
      },
      updateReportSummary: ({ commit, dispatch, state }, data) => {
        axios.get(state.allure_address + '/allure-docker-service/projects/waf-core-autotest/reports/' + data.value + '/widgets/summary.json').then(response => {
          response.data.id = data.value
          commit('updateParam', { name: data.name + '_report', value: response.data })
          dispatch('updateTableData')
        })
      },
      updateAllureAddress: ({ commit, state }, data) => {
        commit('updateParam', { name: 'allure_address', value: data })
      },
      updateTableData: ({ commit, state }, data) => {
        if (state.first_report.id && state.second_report.id) {
          axios.get(state.allure_address + '/allure-docker-service/projects/waf-core-autotest/reports/' + state.first_report.id + '/data/suites.json').then(response1 => {
            const firstData = recursiveParsing(response1.data)
            axios.get(state.allure_address + '/allure-docker-service/projects/waf-core-autotest/reports/' + state.second_report.id + '/data/suites.json').then(response2 => {
              const secondData = recursiveParsing(response2.data)
              const temp = {}
              for (const key in secondData) {
                if (firstData[key]) {
                  if (firstData[key] !== secondData[key]) {
                    temp[key] = {
                      status: 'changed',
                      first: firstData[key],
                      second: secondData[key]
                    }
                  }
                } else {
                  temp[key] = {
                    status: 'new',
                    second: secondData[key]
                  }
                }
              }
              commit('updateTable', temp)
            })
          })
        }
      }
    },

    mutations: {
      updateReportList (state, data) {
        state.report_list = data.project.reports_id
      },
      updateParam (state, data) {
        state[data.name] = data.value
      },
      updateTable (state, data) {
        state.table_data.rows = []
        for (const key in data) {
          state.table_data.rows.push({
            name: key,
            status: data[key].status,
            state_first: data[key].first,
            state_second: data[key].second
          })
        }
      }
    },
    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: process.env.DEBUGGING
  })

  return Store
})
