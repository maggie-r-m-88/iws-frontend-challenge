<template>
  <div :ceiling="ceiling" :increment="increment"  :interval="interval" :topic="topic" :active="active">
    <!--<p>{{ rawActual }}</p>-->
  </div>
</template>

<script>
export default {
  name: "RawPublisher",
  props: {
    ceiling:{
      type: Number,
      default: 20,
    },
    increment:{
      type: Number,
      default: 0.5,
    },
    interval: {
      type: Number,
      default: 1000,
    },
    topic: {
      type: String
    },
    active:{
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      rawActual: 0,
      up: true
    };
  },
  mounted() {
    window.setInterval(() => {
      this.rawPublisher();
    },this.interval);
  },
  methods: {
    getRange(start, end, step = 1){
      // Get an array of the sequence between two numbers, with interval
      const len = Math.floor((end - start) / step) + 1
      return Array(len).fill().map((_, idx) => start + (idx * step))
    },
    rawPublisher() {
      // This function oscillates rawActual between a low value & high value and publishes result to mqtt.

      if(this.active == true){
        if(this.up == true && this.rawActual <= this.actual_ceiling){

           this.rawActual += this.increment
           var payload = JSON.stringify({
              value: this.rawActual.toFixed(2)
           })
           this.$root.mqtt.pub(this.topic, payload)

           if(this.rawActual >= this.actual_ceiling){
            this.up = false
           }
        }else{
          this.rawActual -= this.increment
          var payload = JSON.stringify({
              value: this.rawActual.toFixed(2)
           })
          this.$root.mqtt.pub(this.topic, payload)
          if(this.rawActual <= 0){
            this.up = true
          }
        }
      }else{
        this.rawActual = 0
        this.up = true
      } 
    }
  },
  computed: {
    actual_ceiling(){
      //If output value doesn't sequence exactly to our ceiling, use the last number in the sequence as the ceiling before counting down
      const custom_ceiling = this.ceiling/this.increment
      let sequence_values = []

      if(custom_ceiling != Math.floor(custom_ceiling)){
        sequence_values = this.getRange(0, this.ceiling, this.increment)
        return Math.max(...sequence_values)

      }else{
        return this.ceiling
      }
    }
  }
};
</script>