<template>
  <div class="map">
    <div class="map__legend">
      <div v-for="color in colorPalette" :key="color.color">
        <div :style="{'background-color': color.color}" class="color-box"></div>
        <span>{{color.min}} {{color.max == Infinity ? '+' : `- ${color.max}`}}</span>
      </div>
      <p>Population per square<br> mile by state.<br> 2015 census figures.</p>
    </div>
    <svg width="500" height="350" viewBox="0 0 960 600" id="statesvg"></svg>
  </div>
</template>

<script>
  import eventHub from '../eventHub.js';
  import {uStatePaths} from './mapData/statePaths.js';
  import {colorPalette} from './mapData/colorPalette.js';
  import {states} from './mapData/states.js';

  import * as d3 from 'd3';

  export default {
    name: 'StatesMap',
    props: {
      selectedState: {
        type: Object,
        default() {
          return {id: '', name: 'All'}
        }
      }
    },
    created() {
      eventHub.$on('reset state', this.mouseClick);
    },
    destroyed() {
      eventHub.$off('reset state', this.mouseClick);
    },

    computed: {
      colorData() {
        let tempData = {};
        _.forEach(states, state => { tempData[state.value] = {color: this.getColor(state).color} });

        return tempData;
      }
    },
    data() {
      return {
        clickedState: {id: ''},
        colorPalette
      }
    },
    methods: {
      draw(id, data) {
        d3.select(id).selectAll(".state")
          .data(uStatePaths).enter().append("path").attr("id", d => d.id).attr("d", d => d.d)
          .style("fill", d => data[d.id].color).style("stroke", "black")
          .on("mouseover", this.mouseOver).on("mouseout", this.mouseOut).on('click', this.mouseClick);
      },
      getColor(state) {
        return [..._.filter(colorPalette, data => data.max > state.population && data.min <= state.population)][0];
      },
      mouseClick(event) {
        if (!event.id) return
        if (this.clickedState.id !== event.id && !_.isEmpty(this.clickedState.id)) {
          d3.select(`#${this.clickedState.id}`).style("fill", this.colorData[event.id].color) ;
        } else if (this.clickedState.id === event.id){
          d3.select(`#${event.id}`).style("fill", this.colorData[event.id].color)
          this.clickedState = {id: ''};
          return
        }

        this.clickedState = {id: event.id};
        d3.select(`#${event.id}`).style("fill", 'orange');
      },
      mouseOver(event) {
        return event.id !== this.clickedState.id ? d3.select(`#${event.id}`).style("fill", 'orange') : '';
      },
      mouseOut(event) {
        return event.id !== this.clickedState.id ? d3.select(`#${event.id}`).style("fill", this.colorData[event.id].color) : '';
      }
    },
    mounted() {
      this.draw("#statesvg", this.colorData);
    },
    watch: {
      clickedState() {
        this.$emit('update:selectedState', ..._.filter(states, state => state.value === this.clickedState.id));
        eventHub.$emit('update state');
      }
    }
  }
</script>

<style lang="scss" scoped>
  .map {
    position: relative;
  }

  .map__legend {
    position: absolute;
    bottom: 45px;
    right: 5px;

    font-size: 0px;

    .color-box {
      display: inline-block;
      width: 15px;
      height: 10px;
      margin-right: 3px;

      border: 1px solid black;
      border-top: 0px;

      vertical-align: top;
    }

    span {
      display: inline-block;

      font-size: 9px;
      line-height: 10px;

      vertical-align: top;
    }

    p {
      margin-top: 5px;
      margin-bottom: 0;
      padding: 0;

      font-size: 9px;
      line-height: normal;
    }
  }
</style>


