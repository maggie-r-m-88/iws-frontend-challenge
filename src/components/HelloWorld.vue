<template>
  <div class="sensor-container">
      <div class="row">
          <div class="col">
                 <h1>HelloWorld status: {{ msg }}</h1>
                 <h1>input: {{ rawActual }}</h1>
                 <h1>output: {{ tempCalc }}</h1><br/>
          </div>
      </div>
      <div class="row">
          <div class="col">
            <!-- Form goes here -->
            <div class="row">
              <div class="col">
                  <div class="form-floating mb-3">
                    <input type="number" class="form-control" id="RawLow" placeholder="Raw Low" v-model="rawLow" min="0">
                    <label for="RawLow">Raw Low</label>
                  </div>
                  <div class="form-floating mb-3">
                    <input type="number" class="form-control" id="RawHigh" placeholder="Raw High" v-model="rawHigh">
                    <label for="RawHigh">Raw High</label>
                  </div>
              </div>
              <div class="col">
                  <div class="form-floating mb-3">
                    <input type="number" class="form-control" id="EngLow" placeholder="Eng Low" v-model="engLow">
                    <label for="EngLow">Eng Low</label>
                  </div>
                  <div class="form-floating mb-3">
                    <input type="number" class="form-control" id="EngHigh" placeholder="Eng High" v-model="engHigh">
                    <label for="EngHigh">Eng High</label>
                  </div>
              </div>
            </div>
            <div class="row">
                <div class="col">
                   <div class="form-floating mb-3">
                    <input type="number" class="form-control" id="Increment" placeholder="Increment" v-model="rawIncrement" min="0" step="0.1">
                    <label for="Increment">Increment</label>
                  </div>
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckChecked" v-model="subscribe" @change="toggleSub">
                    <label class="form-check-label" for="flexSwitchCheckChecked">{{subscribeToggleText }}</label>
                  </div>
                </div>
                <div class="col">
                </div>
            </div>
          </div>
          <div class="col">
            <!-- Sensor goes here -->
            <div class="output-reading">
                <div class="row">
                   <div class="col d-flex flex-column">
                      <div class="marker" v-for="number in rawIntervals">{{ number }} </div>
                   </div>
                   <div class="col meter" :style="{'background-color':meterColor}">
                      <div class="measured" :style="{'height':meterReading}">
                      </div>
                   </div>
                   <div class="col d-flex flex-column">
                      <div class="marker" v-for="number in engIntervals">{{ number }} </div>
                   </div>
                </div>
             </div>
          </div>
      </div>
     <RawPublisher :topic="this.topic" :increment="parseIncrement" :interval="1000" :active="subscribe" />


     {{ parseIncrement }}
  </div>
</template>

<script>

import VueThermometer from 'vuejs-thermometer'
import RawPublisher from './RawPublisher.vue'

export default {
  name: "HelloWorld",
  components: {
    VueThermometer,
    RawPublisher
  },
  data() {
    return {
      msg: "init",
      rawActual: 0, // Received raw sensor value, mA
      rawLow: 0, // Minimum sensor reading, mA
      rawHigh: 20, // Maximum sensor readin, mA
      engActual: 0, // Current thermometer reading, deg C
      engLow: -70, // Minimum temperature of thermometer, deg C
      engHigh: 70, // Maximum temperature of thermometer, deg C
      rawIncrement: 0.5,
      topic: 'iws_maggie',
      subscribe: true
    };
  },
  mounted() {
    this.$root.$on("mqtt-connected", () => {
      this.$root.mqtt.sub(this.topic, 0, this.onRawPublish);
     // this.$root.mqtt.pub("iws_maggie", 'testing123');
    });

  },
  methods: {
    getIntervals(low,high){
      var first = parseInt(low)
      var second = parseInt(high)
      var times = 10
      // Create 10 intervals of measurement
      var result = Array.from({ length: times }, (_, i) => first + (second - first) * i / (times - 1)).map(function (x) { 
        return parseInt(x)
      });
      //Sort from lowest to highest values
      return result.sort(function(a, b) {
        return b - a;
      });
    },
    mapBetween(currentNum, minAllowed, maxAllowed, min, max){
      return (maxAllowed - minAllowed) * (currentNum- min) / (max - min) + minAllowed;
    },
    onRawPublish(topic, payload){
      console.log(`Foo - topic: ${topic} payload: ${payload}`);
      var newVal = JSON.parse(payload)
      this.rawActual = newVal.value   
    },
    toggleSub(){
      // This will stop the messages from being sent and the output from being scaled.
      if(this.subscribe == true){
        this.$root.mqtt.sub(this.topic, 0, this.onRawPublish);
      }else{
        this.$root.mqtt.unsub(this.topic);
      }
    }
  },
  computed: {
    a(){
      var top = this.engHigh - this.engLow
      var bottom = this.rawHigh - this.rawLow
      return top/bottom
    },
    b(){
      var top = this.rawActual
      var bottom = this.rawLow
      return top - bottom
    },
    engIntervals(){
      // Interval markers for Eng values
      return this.getIntervals(this.engLow,this.engHigh)
    },
    meterColor(){
      var a = this.rawHigh * 75
      var b = this.rawHigh * 25
      var top_val = a/100
      var bottom_val = b/100
      if (this.rawActual >= top_val){
        return 'red'
      }
      if(this.rawActual <= bottom_val){
        return 'blue'
      }
      else{
        return 'black'
      }
    },
    meterReading(){
      // Transform output value as percent in the component
      return 100 - parseInt(this.mapBetween(this.tempCalc,0,100,this.engLow,this.engHigh)) + '%'
    },
    parseIncrement(){
      return Number(this.rawIncrement)
    },
    rawIntervals(){
      // Interval markers for Raw values
      return this.getIntervals(this.rawLow,this.rawHigh)
    },
    subscribeToggleText(){
      if(this.subscribe == true){
        return 'ON'
      }else{
        return 'OFF'
      }
    },
    tempCalc(){
      var first = this.a * this.b
      var result = first + parseInt(this.engLow)
      return result.toFixed(2)
    },
    textColor(){
      if(this.rawActual < 4){
        return 'red'
      }else{
        return 'black'
      }
    }
  }
};
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: block;
  margin: 10px 20px;
}
a {
  color: #42b983;
}
.meter{
  background: #eee;
  padding: 0;
  min-width: 100px;

}
.measured{
  background:  #eee;
}
.output-reading{
  height: 500px;
}
.marker{
  padding: 10px 0;
  font-size: 0.8rem;
}
</style>
