<template>
  <v-layout align-space-around justify-space-around row fill-height>
    <v-flex md12>
      <v-container fluid grid-list-md class="px-0 py-0 panel-graph">
        <v-layout align-center justify-space-between row wrap>
          <v-flex sm12 md6 lg4 class="text-md-right">
            <v-layout row>
              <v-flex sm10 md10>
                <v-text-field
                  v-model="searchQuery"
                  label="search"
                  required
                ></v-text-field>
              </v-flex>
              <v-flex sm2 md2>
                <v-btn @click="search">
                  search
                </v-btn>
              </v-flex>
            </v-layout>
          </v-flex>
          <v-flex sm12 md6 lg4 class="text-md-right">
            <div style="float:right;border:1px solid #b9b7b7;background:#f2f2f2;padding:3px 5px;margin:6px">ghost</div>
            <div style="float:right;border:1px solid #9696bd;background:#e6e6ff;padding:3px 5px;margin:6px">sleeping provider</div>
            <div style="float:right;border:1px solid #588c61;background:#95d9a1;padding:3px 5px;margin:6px">agent</div>
            <div style="float:right;border:1px solid #377d9c;background:#03a5ed;padding:3px 5px;margin:6px">provider</div>
            <div style="float:right;border:1px solid #b75f3f;background:#f15a24;padding:3px 5px;margin:6px" @click="hide('lighthouse')">lighthouse</div>
          </v-flex>
        </v-layout>
      </v-container>
      <Graph />
    </v-flex>
  </v-layout>
</template>

<script>
import Graph from './Graph'
import bus from '../../utils/bus'

export default {
  name: 'page',
  components: {
    Graph
  },
  data () {
    return {
      searchQuery: ''
    }
  },
  methods: {
    search () {
      bus.$emit('search', this.searchQuery)
    }
  }
}
</script>
