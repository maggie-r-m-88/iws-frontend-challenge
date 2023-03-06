import Vue from "vue";
import App from "./App.vue";
import IWS_MQTT from "./mqtt"
import bootstrap from 'bootstrap';
import "bootstrap/dist/css/bootstrap.min.css"

Vue.config.productionTip = false;
new Vue({
  render: function (h) {
    return h(App);
  },
  data() {
    return {
      mqtt: null
    }
  },
  created() {
    const HOST = 'broker.emqx.io';
    const PORT = 8083;
    const CLIENT_ID = 'mqttx_02913915'
    this.mqtt = new IWS_MQTT(HOST, PORT, CLIENT_ID);
    this.mqtt.connect(() => {
      this.$emit('mqtt-connected', true)
    })

  }
}).$mount("#app");