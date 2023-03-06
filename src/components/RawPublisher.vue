<template>
  <div>
    <p>Publisher: {{ rawActual }}</p>
    <input v-model="increment" type="text">
  </div>
</template>

<script>
export default {
  name: "RawPublisher",
  data() {
    return {
      rawActual: 0,
      ceiling: 20,
      increment: 0.5,
      up: true
    };
  },
  mounted() {
    //console.log("mounted");
    window.setInterval(() => {
        //this.oscillate();
      this.rawPublisher();
    },1000);
  },
  methods: {
    rawPublisher() {
      // This function oscillates rawActual between 0 & 20 and publishes result to mqtt.
      if(this.up == true && this.rawActual <= this.ceiling){
         this.rawActual += this.increment
         var payload = JSON.stringify({
            value: this.rawActual
         })
         this.$root.mqtt.pub('iws_maggie', payload)
         if(this.rawActual == this.ceiling){
          this.up = false
         }
      }else{
        this.rawActual -= this.increment
        var payload = JSON.stringify({
            value: this.rawActual
         })
        this.$root.mqtt.pub('iws_maggie', payload)
        if(this.rawActual == 0){
          this.up = true
        }
      }
      //onsole.log(this.$root.mqtt)
      //this.$root.mqtt.pub('iws_maggie', this.rawActual)
    }
  },
};
</script>