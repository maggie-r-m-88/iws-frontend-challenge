<template>
  <div class="hello">
     <h1>HelloWorld status: {{ msg }}</h1>
     <h1>input: {{ rawActual }}</h1>
     <h1>output: {{ tempCalc }}</h1><br/>
     <label>RawLow</label>: <input v-model="rawLow" type="text"><br/>
     <label>RawHigh</label>: <input v-model="rawHigh" type="text"><br/>
     <label>engLow</label>: <input v-model="engLow" type="text"><br/>
     <label>engHigh</label>: <input v-model="engHigh" type="text"><br/>
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
</template>

<script>

import VueThermometer from 'vuejs-thermometer'

export default {
  name: "HelloWorld",
  components: {
    VueThermometer
  },
  data() {
    return {
      msg: "init",
      rawActual: null, // Received raw sensor value, mA
      rawLow: 0, // Minimum sensor reading, mA
      rawHigh: 20, // Maximum sensor readin, mA
      engActual: 0, // Current thermometer reading, deg C
      engLow: -70, // Minimum temperature of thermometer, deg C
      engHigh: 70, // Maximum temperature of thermometer, deg C
      testing: ''
    };
  },
  mounted() {
    this.$root.$on("mqtt-connected", () => {
      this.$root.mqtt.sub("iws_maggie", 0, this.onRawPublish);
     // this.$root.mqtt.pub("iws_maggie", 'testing123');
    });

  },
  methods: {
    onIwsFoo(topic, payload) {
      console.log(`Foo - topic: ${topic} payload: ${payload}`);
      this.msg = JSON.stringify(payload);
    },
    onRawPublish(topic, payload){
    //  console.log(`Foo - topic: ${topic} payload: ${payload}`);
      var newVal = JSON.parse(payload)
      this.rawActual = newVal.value;

      
    },
    mapBetween(currentNum, minAllowed, maxAllowed, min, max){
      return (maxAllowed - minAllowed) * (currentNum- min) / (max - min) + minAllowed;
    },
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
    tempCalc(){
      var first = this.a * this.b
      return first + parseInt(this.engLow)

    },
    rawIntervals(){
      return this.getIntervals(this.rawLow,this.rawHigh)
    },
    engIntervals(){
       return this.getIntervals(this.engLow,this.engHigh)
    },
    meterReading(){
      return 100 - parseInt(this.mapBetween(this.tempCalc,0,100,this.engLow,this.engHigh)) + '%'
    },
    textColor(){
      if(this.rawActual < 4){
        return 'red'
      }else{
        return 'black'
      }
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
