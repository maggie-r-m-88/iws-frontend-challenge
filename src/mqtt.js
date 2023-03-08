import Paho from 'paho-mqtt'

export default class IWS_MQTT {
  /** This class is a wrapper for the Paho MQTT class to provide extra
   *  functionality to the publish, subsribe and onMessage methods.
   * 
   * Paho JS MQTT Docs: https://www.eclipse.org/paho/files/jsdoc/Paho.MQTT.Client.html
   * 
   * @param {string} host the hostname of the MQTT broker.
   * @param {int} port the port of the MQTT broker.
   */

  // Initiates the client with host/port parameters 
  constructor(host, port) {
    this.host = host
    this.port = port
    this.connected = false
    this.client = new Paho.Client(host, port, "clientjs");
    this.client.onMessageArrived = this.handleMessage.bind(this)
    this.callbackMap = new Map()
    this.onMessage = null
    this.subbedTopics = []
  }

  _defaultConnect() {
    this.connected = true
    console.log('Connected!')
  }

  // When we successfully connect to the server, callback function will show a message when successful
  connect(callbackFn = null) {
    console.log(`Connecting to ws://${this.host}:${this.port}`);
    let successCallbackFn = this._defaultConnect
    if (callbackFn) {
      successCallbackFn = () => {
        this._defaultConnect()
        callbackFn()
      }
    }
    let options = {
      timeout: 3,
      onSuccess: successCallbackFn
    }
    this.client.connect(options)
  }

  // When subscribing to a topic, add possibility for callback function that can be used when messages arrive for that topic
  sub(topic, qos = 0, callbackFn = null) {
    this.client.subscribe(topic, { qos: qos })
    this.subbedTopics.push(topic)
    if (callbackFn) {
      this.callbackMap.set(topic, callbackFn)
    }
  }

  addSubCallback(topic, callbackFn) {
    if (this.subbedTopics.indexOf(topic) != -1) {
      this.callbackMap.set(topic, callbackFn)
    } else {
      console.log(`Callback cannot be added to topic:
      '${topic}'
      because it does not exist.`)
    }
  }

  // Publishes to topic with specific payload, or throws an error message
  pub(topic, payload, qos = 0, retain = false) {
    if (this.connected) {
      this.client.publish(topic, payload, qos, retain)
    } else {
      console.log(`MQTT not connected. Failed to publish:
      topic: ${topic}
      payload: ${payload}`)
    }
  }

  handleMessage(message) {
    try {
      const callbackFn = this.callbackMap.get(message.destinationName)
      if (callbackFn) {
        callbackFn(message.destinationName, message.payloadString)
      } else if (this.onMessage) {
        this.onMessage(message.destinationName, message.payloadString)
      }
    } catch (e) {
      console.log(`Handler for topic ${message.destinationName} failed. Error: `, e)
    }
  }

  //Unsubscribe to topic and log result
  unsub(topic){
    this.client.unsubscribe(topic, function (complete) {
       console.log("successfully unsubscribed: " + complete.result);
    }, function (error) {
       console.log("Error unsubscribing: " + (error.message || error.type));
    });
   
  }

}