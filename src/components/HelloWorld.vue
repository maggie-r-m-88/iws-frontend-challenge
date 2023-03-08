<template>
<div class="sensor-container">
   <RawPublisher :topic="this.topic" :increment="parseIncrement" :interval="1000" :active="subscribe" />
   <div class="row">
      <div class="col mb-3">
         <h1>IWS Frontend Assessment</h1>
      </div>
   </div>
   <div class="row d-flex justify-content-center">
      <div class="col-sm-3 mb-4">
         <div class="d-inline-block me-3">Off</div>
         <div class="form-check form-switch d-inline-block">
            <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckChecked" v-model="subscribe" @change="toggleSub">
            <label class="form-check-label ms-2" for="flexSwitchCheckChecked">On</label>
         </div>
      </div>
   </div>
   <div class="row data-row">
      <div class="col-sm-6">
         <!-- Form goes here -->
         <div class="row">
            <div class="col">
               <div class="form-floating mb-3">
                  <input type="number" class="form-control" id="RawLow" placeholder="Raw Low" v-model="rawLow" min="0">
                  <label for="RawLow">Raw Low</label>
               </div>
               <div class="form-floating mb-3">
                  <input type="number" class="form-control" id="RawHigh" placeholder="Raw High" v-model="rawHigh" min="0">
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
                  <input type="number" class="form-control" id="Increment" placeholder="Increment" v-model="rawIncrement" min="0" step="0.1" :disabled="subscribe == true">
                  <label for="Increment">Increment (mA/s)</label>
               </div>
            </div>
            <div class="col">
            </div>
         </div>
      </div>
      <div class="col-sm-6">
         <!-- Sensor -->
         <div class="output-reading">
            <div class="row">
               <div class="col mb-3">
                  <h3 :style="{'color':textColor}">Input: <br/><b>{{ rawActual }}</b> mA</h3>
               </div>
               <div class="col mb-3">
                  <h3>Output: <br/><b>{{ tempCalc }}</b>&deg; C</h3>
               </div>
            </div>
            <div class="row">
               <div class="col d-flex flex-column text-end">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                     <tr v-for="number in rawIntervals">
                        <td  valign="middle">{{ number }} mA</td>
                     </tr>
                  </table>
               </div>
               <div class="meter">
                  <div class="indicator" :style="{'bottom':meterReading,'background-color':meterColor}">
                  </div>
               </div>
               <div class="col d-flex flex-column text-start">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                     <tr v-for="number in engIntervals">
                        <td  valign="middle" >{{ number }} &deg;C</td>
                     </tr>
                  </table>
               </div>
            </div>
         </div>
         <!-- /Sensor -->
      </div>
   </div>
</div>
</template>

<script>
import RawPublisher from './RawPublisher.vue'

export default {
  name: "HelloWorld",
  components: {
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
      rawIncrement: 0.1, //Default spped of raw publisher
      topic: 'iws_maggie',
      subscribe: false
    };
  },
  mounted() {
    this.$root.$on("mqtt-connected", () => {
       this.subscribe = true
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
        return x.toFixed(1)
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
      console.log(`Topic: ${topic} payload: ${payload}`);
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
        return '#CF3D4B'
      }
      if(this.rawActual <= bottom_val){
        return '#0055CA'
      }
      else{
        return '#4D4D4D'
      }
    },
    meterReading(){
      // Transform output value as percent in the component
      var reading = parseInt(this.mapBetween(this.tempCalc,0,100,this.engLow,this.engHigh))
      if(reading <= 98){
        return reading  + '%'
      }
      else{
        return reading - 2 + '%'
      }
      
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
        return '#CF3D4B'
      }else{
        return '#4D4D4D'
      }
    }
  }
};
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
  font-weight: normal;
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
.data-row{
  align-items: center; 
}
.meter{
  background: #eee;
  padding: 0;
  width: 100px;
  background-image: linear-gradient(#4D4D4D, #4D4D4D);
  background-size: 2px 100%;
  background-repeat: no-repeat;
  background-position: center center;
  position: relative;
}
.indicator{
  height: 2%;
  width: 100%;
  position: absolute;
}
.output-reading{
  min-height: 600px;
}

.sensor-container table{
  height: 400px;
}
.sensor-container td{
   font-size: 0.8rem;
}
.sensor-container tr:first-of-type td{
  vertical-align: top !important;
}
.sensor-container tr:last-of-type td{
  vertical-align:  bottom !important;
}
.form-check-input{
  transform: scale(1.4);
}
</style>
