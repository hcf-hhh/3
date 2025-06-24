!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).mqtt=e()}}(function(){return function(){return function e(t,r,n){function i(s,a){if(!r[s]){if(!t[s]){var u="function"==typeof require&&require;if(!a&&u)return u(s,!0);if(o)return o(s,!0);var c=new Error("Cannot find module '"+s+"'");throw c.code="MODULE_NOT_FOUND",c}var l=r[s]={exports:{}};t[s][0].call(l.exports,function(e){return i(t[s][1][e]||e)},l,l.exports,e,t,r,n)}return r[s].exports}for(var o="function"==typeof require&&require,s=0;s<n.length;s++)i(n[s]);return i}}()({1:[function(e,t,r){(function(r,n){"use strict";var i=e("events").EventEmitter,o=e("./store"),s=e("mqtt-packet"),a=e("readable-stream").Writable,u=e("inherits"),c=e("reinterval"),l=e("./validations"),f=e("xtend"),p=e("debug")("mqttjs:client"),h=n.setImmediate||function(e){r.nextTick(e)},d={keepalive:60,reschedulePings:!0,protocolId:"MQTT",protocolVersion:4,reconnectPeriod:1e3,connectTimeout:3e4,clean:!0,resubscribe:!0},g=["ECONNREFUSED","EADDRINUSE","ECONNRESET","ENOTFOUND"],b={0:"",1:"Unacceptable protocol version",2:"Identifier rejected",3:"Server unavailable",4:"Bad username or password",5:"Not authorized",16:"No matching subscribers",17:"No subscription existed",128:"Unspecified error",129:"Malformed Packet",130:"Protocol Error",131:"Implementation specific error",132:"Unsupported Protocol Version",133:"Client Identifier not valid",134:"Bad User Name or Password",135:"Not authorized",136:"Server unavailable",137:"Server busy",138:"Banned",139:"Server shutting down",140:"Bad authentication method",141:"Keep Alive timeout",142:"Session taken over",143:"Topic Filter invalid",144:"Topic Name invalid",145:"Packet identifier in use",146:"Packet Identifier not found",147:"Receive Maximum exceeded",148:"Topic Alias invalid",149:"Packet too large",150:"Message rate too high",151:"Quota exceeded",152:"Administrative action",153:"Payload format invalid",154:"Retain not supported",155:"QoS not supported",156:"Use another server",157:"Server moved",158:"Shared Subscriptions not supported",159:"Connection rate exceeded",160:"Maximum connect time",161:"Subscription Identifiers not supported",162:"Wildcard Subscriptions not supported"};function y(e,t,r){p("sendPacket :: packet: %O",t),p("sendPacket :: emitting `packetsend`"),e.emit("packetsend",t),p("sendPacket :: writing to stream");var n=s.writeToStream(t,e.stream,e.options);p("sendPacket :: writeToStream result %s",n),!n&&r?(p("sendPacket :: handle events on `drain` once through callback."),e.stream.once("drain",r)):r&&(p("sendPacket :: invoking cb"),r())}function m(e,t,r,n){p("storeAndSend :: store packet with cmd %s to outgoingStore",t.cmd),e.outgoingStore.put(t,function(i){if(i)return r&&r(i);n(),y(e,t,r)})}function _(e){p("nop ::",e)}function v(e,t){var r,n=this;if(!(this instanceof v))return new v(e,t);for(r in this.options=t||{},d)void 0===this.options[r]?this.options[r]=d[r]:this.options[r]=t[r];p("MqttClient :: options.protocol",t.protocol),p("MqttClient :: options.protocolVersion",t.protocolVersion),p("MqttClient :: options.username",t.username),p("MqttClient :: options.keepalive",t.keepalive),p("MqttClient :: options.reconnectPeriod",t.reconnectPeriod),p("MqttClient :: options.rejectUnauthorized",t.rejectUnauthorized),this.options.clientId="string"==typeof t.clientId?t.clientId:"mqttjs_"+Math.random().toString(16).substr(2,8),p("MqttClient :: clientId",this.options.clientId),this.options.customHandleAcks=5===t.protocolVersion&&t.customHandleAcks?t.customHandleAcks:function(){arguments[3](0)},this.streamBuilder=e,this.outgoingStore=t.outgoingStore||new o,this.incomingStore=t.incomingStore||new o,this.queueQoSZero=void 0===t.queueQoSZero||t.queueQoSZero,this._resubscribeTopics={},this.messageIdToTopic={},this.pingTimer=null,this.connected=!1,this.disconnecting=!1,this.queue=[],this.connackTimer=null,this.reconnectTimer=null,this._storeProcessing=!1,this._packetIdsDuringStoreProcessing={},this.nextId=Math.max(1,Math.floor(65535*Math.random())),this.outgoing={},this._firstConnection=!0,this.on("connect",function(){var e=this.queue;p("connect :: sending queued packets"),function t(){var r=e.shift();p("deliver :: entry %o",r);var i;r&&(i=r.packet,p("deliver :: call _sendPacket for %o",i),n._sendPacket(i,function(e){r.cb&&r.cb(e),t()}))}()}),this.on("close",function(){p("close :: connected set to `false`"),this.connected=!1,p("close :: clearing connackTimer"),clearTimeout(this.connackTimer),p("close :: clearing ping timer"),null!==n.pingTimer&&(n.pingTimer.clear(),n.pingTimer=null),p("close :: calling _setupReconnect"),this._setupReconnect()}),i.call(this),p("MqttClient :: setting up stream"),this._setupStream()}u(v,i),v.prototype._setupStream=function(){var e,t=this,n=new a,i=s.parser(this.options),o=null,u=[];function c(){if(u.length)r.nextTick(l);else{var e=o;o=null,e()}}function l(){p("work :: getting next packet in queue");var e=u.shift();if(e)p("work :: packet pulled from queue"),t._handlePacket(e,c);else{p("work :: no packets in queue");var r=o;o=null,p("work :: done flag is %s",!!r),r&&r()}}if(p("_setupStream :: calling method to clear reconnect"),this._clearReconnect(),p("_setupStream :: using streamBuilder provided to client to create stream"),this.stream=this.streamBuilder(this),i.on("packet",function(e){p("parser :: on packet push to packets array."),u.push(e)}),n._write=function(e,t,r){o=r,p("writable stream :: parsing buffer"),i.parse(e),l()},p("_setupStream :: pipe stream to writable stream"),this.stream.pipe(n),this.stream.on("error",function(e){p("streamErrorHandler :: error",e.message),g.includes(e.code)?(p("streamErrorHandler :: emitting error"),t.emit("error",e)):_(e)}),this.stream.on("close",function(){var e;p("(%s)stream :: on close",t.options.clientId),(e=t.outgoing)&&(p("flushVolatile :: deleting volatile messages from the queue and setting their callbacks as error function"),Object.keys(e).forEach(function(t){e[t].volatile&&"function"==typeof e[t].cb&&(e[t].cb(new Error("Connection closed")),delete e[t])})),p("stream: emit close to MqttClient"),t.emit("close")}),p("_setupStream: sending packet `connect`"),(e=Object.create(this.options)).cmd="connect",y(this,e),i.on("error",this.emit.bind(this,"error")),this.options.properties){if(!this.options.properties.authenticationMethod&&this.options.properties.authenticationData)return t.end(()=>this.emit("error",new Error("Packet has no Authentication Method"))),this;if(this.options.properties.authenticationMethod&&this.options.authPacket&&"object"==typeof this.options.authPacket)y(this,f({cmd:"auth",reasonCode:0},this.options.authPacket))}this.stream.setMaxListeners(1e3),clearTimeout(this.connackTimer),this.connackTimer=setTimeout(function(){p("!!connectTimeout hit!! Calling _cleanUp with force `true`"),t._cleanUp(!0)},this.options.connectTimeout)},v.prototype._handlePacket=function(e,t){var r=this.options;if(5===r.protocolVersion&&r.properties&&r.properties.maximumPacketSize&&r.properties.maximumPacketSize<e.length)return this.emit("error",new Error("exceeding packets size "+e.cmd)),this.end({reasonCode:149,properties:{reasonString:"Maximum packet size was exceeded"}}),this;switch(p("_handlePacket :: emitting packetreceive"),this.emit("packetreceive",e),e.cmd){case"publish":this._handlePublish(e,t);break;case"puback":case"pubrec":case"pubcomp":case"suback":case"unsuback":this._handleAck(e),t();break;case"pubrel":this._handlePubrel(e,t);break;case"connack":this._handleConnack(e),t();break;case"pingresp":this._handlePingresp(e),t();break;case"disconnect":this._handleDisconnect(e),t()}},v.prototype._checkDisconnecting=function(e){return this.disconnecting&&(e?e(new Error("client disconnecting")):this.emit("error",new Error("client disconnecting"))),this.disconnecting},v.prototype.publish=function(e,t,r,n){var i;p("publish :: message `%s` to topic `%s`",t,e);var o=this.options;"function"==typeof r&&(n=r,r=null);if(r=f({qos:0,retain:!1,dup:!1},r),this._checkDisconnecting(n))return this;switch(i={cmd:"publish",topic:e,payload:t,qos:r.qos,retain:r.retain,messageId:this._nextId(),dup:r.dup},5===o.protocolVersion&&(i.properties=r.properties,(!o.properties&&i.properties&&i.properties.topicAlias||r.properties&&o.properties&&(r.properties.topicAlias&&o.properties.topicAliasMaximum&&r.properties.topicAlias>o.properties.topicAliasMaximum||!o.properties.topicAliasMaximum&&r.properties.topicAlias))&&delete i.properties.topicAlias),p("publish :: qos",r.qos),r.qos){case 1:case 2:this.outgoing[i.messageId]={volatile:!1,cb:n||_},this._storeProcessing?(p("_storeProcessing enabled"),this._packetIdsDuringStoreProcessing[i.messageId]=!1,this._storePacket(i,void 0,r.cbStorePut)):(p("MqttClient:publish: packet cmd: %s",i.cmd),this._sendPacket(i,void 0,r.cbStorePut));break;default:this._storeProcessing?(p("_storeProcessing enabled"),this._storePacket(i,n,r.cbStorePut)):(p("MqttClient:publish: packet cmd: %s",i.cmd),this._sendPacket(i,n,r.cbStorePut))}return this},v.prototype.subscribe=function(){for(var e,t=new Array(arguments.length),r=0;r<arguments.length;r++)t[r]=arguments[r];var n,i=[],o=t.shift(),s=o.resubscribe,a=t.pop()||_,u=t.pop(),c=this,d=this.options.protocolVersion;if(delete o.resubscribe,"string"==typeof o&&(o=[o]),"function"!=typeof a&&(u=a,a=_),null!==(n=l.validateTopics(o)))return h(a,new Error("Invalid topic "+n)),this;if(this._checkDisconnecting(a))return p("subscribe: discconecting true"),this;var g={qos:0};if(5===d&&(g.nl=!1,g.rap=!1,g.rh=0),u=f(g,u),Array.isArray(o)?o.forEach(function(e){if(p("subscribe: array topic %s",e),!c._resubscribeTopics.hasOwnProperty(e)||c._resubscribeTopics[e].qos<u.qos||s){var t={topic:e,qos:u.qos};5===d&&(t.nl=u.nl,t.rap=u.rap,t.rh=u.rh,t.properties=u.properties),p("subscribe: pushing topic `%s` and qos `%s` to subs list",t.topic,t.qos),i.push(t)}}):Object.keys(o).forEach(function(e){if(p("subscribe: object topic %s",e),!c._resubscribeTopics.hasOwnProperty(e)||c._resubscribeTopics[e].qos<o[e].qos||s){var t={topic:e,qos:o[e].qos};5===d&&(t.nl=o[e].nl,t.rap=o[e].rap,t.rh=o[e].rh,t.properties=u.properties),p("subscribe: pushing `%s` to subs list",t),i.push(t)}}),e={cmd:"subscribe",subscriptions:i,qos:1,retain:!1,dup:!1,messageId:this._nextId()},u.properties&&(e.properties=u.properties),i.length){if(this.options.resubscribe){p("subscribe :: resubscribe true");var b=[];i.forEach(function(e){if(c.options.reconnectPeriod>0){var t={qos:e.qos};5===d&&(t.nl=e.nl||!1,t.rap=e.rap||!1,t.rh=e.rh||0,t.properties=e.properties),c._resubscribeTopics[e.topic]=t,b.push(e.topic)}}),c.messageIdToTopic[e.messageId]=b}return this.outgoing[e.messageId]={volatile:!0,cb:function(e,t){if(!e)for(var r=t.granted,n=0;n<r.length;n+=1)i[n].qos=r[n];a(e,i)}},p("subscribe :: call _sendPacket"),this._sendPacket(e),this}a(null,[])},v.prototype.unsubscribe=function(){for(var e={cmd:"unsubscribe",qos:1,messageId:this._nextId()},t=this,r=new Array(arguments.length),n=0;n<arguments.length;n++)r[n]=arguments[n];var i=r.shift(),o=r.pop()||_,s=r.pop();return"string"==typeof i&&(i=[i]),"function"!=typeof o&&(s=o,o=_),this._checkDisconnecting(o)?this:("string"==typeof i?e.unsubscriptions=[i]:Array.isArray(i)&&(e.unsubscriptions=i),this.options.resubscribe&&e.unsubscriptions.forEach(function(e){delete t._resubscribeTopics[e]}),"object"==typeof s&&s.properties&&(e.properties=s.properties),this.outgoing[e.messageId]={volatile:!0,cb:o},p("unsubscribe: call _sendPacket"),this._sendPacket(e),this)},v.prototype.end=function(e,t,n){var i=this;function o(){p("end :: (%s) :: finish :: calling _cleanUp with force %s",i.options.clientId,e),i._cleanUp(e,()=>{p("end :: finish :: calling process.nextTick on closeStores"),r.nextTick(function(){p("end :: closeStores: closing incoming and outgoing stores"),i.disconnected=!0,i.incomingStore.close(function(){i.outgoingStore.close(function(){p("end :: closeStores: emitting end"),i.emit("end"),n&&(p("end :: closeStores: invoking callback with args"),n())})}),i._deferredReconnect&&i._deferredReconnect()}.bind(i))},t)}return p("end :: (%s)",this.options.clientId),null!=e&&"boolean"==typeof e||(n=t||_,t=e,e=!1,"object"!=typeof t&&(n=t,t=null,"function"!=typeof n&&(n=_))),"object"!=typeof t&&(n=t,t=null),p("end :: cb? %s",!!n),n=n||_,this.disconnecting?(n(),this):(this._clearReconnect(),this.disconnecting=!0,!e&&Object.keys(this.outgoing).length>0?(p("end :: (%s) :: calling finish in 10ms once outgoing is empty",i.options.clientId),this.once("outgoingEmpty",setTimeout.bind(null,o,10))):(p("end :: (%s) :: immediately calling finish",i.options.clientId),o()),this)},v.prototype.removeOutgoingMessage=function(e){var t=this.outgoing[e]?this.outgoing[e].cb:null;return delete this.outgoing[e],this.outgoingStore.del({messageId:e},function(){t(new Error("Message removed"))}),this},v.prototype.reconnect=function(e){p("client reconnect");var t=this,r=function(){e?(t.options.incomingStore=e.incomingStore,t.options.outgoingStore=e.outgoingStore):(t.options.incomingStore=null,t.options.outgoingStore=null),t.incomingStore=t.options.incomingStore||new o,t.outgoingStore=t.options.outgoingStore||new o,t.disconnecting=!1,t.disconnected=!1,t._deferredReconnect=null,t._reconnect()};return this.disconnecting&&!this.disconnected?this._deferredReconnect=r:r(),this},v.prototype._reconnect=function(){p("_reconnect: emitting reconnect to client"),this.emit("reconnect"),p("_reconnect: calling _setupStream"),this._setupStream()},v.prototype._setupReconnect=function(){var e=this;!e.disconnecting&&!e.reconnectTimer&&e.options.reconnectPeriod>0?(this.reconnecting||(p("_setupReconnect :: emit `offline` state"),this.emit("offline"),p("_setupReconnect :: set `reconnecting` to `true`"),this.reconnecting=!0),p("_setupReconnect :: setting reconnectTimer for %d ms",e.options.reconnectPeriod),e.reconnectTimer=setInterval(function(){p("reconnectTimer :: reconnect triggered!"),e._reconnect()},e.options.reconnectPeriod)):p("_setupReconnect :: doing nothing...")},v.prototype._clearReconnect=function(){p("_clearReconnect : clearing reconnect timer"),this.reconnectTimer&&(clearInterval(this.reconnectTimer),this.reconnectTimer=null)},v.prototype._cleanUp=function(e,t){var r,n=arguments[2];if(t&&(p("_cleanUp :: done callback provided for on stream close"),this.stream.on("close",t)),p("_cleanUp :: forced? %s",e),e)0===this.options.reconnectPeriod&&this.options.clean&&(r=this.outgoing)&&(p("flush: queue exists? %b",!!r),Object.keys(r).forEach(function(e){"function"==typeof r[e].cb&&(r[e].cb(new Error("Connection closed")),delete r[e])})),p("_cleanUp :: (%s) :: destroying stream",this.options.clientId),this.stream.destroy();else{var i=f({cmd:"disconnect"},n);p("_cleanUp :: (%s) :: call _sendPacket with disconnect packet",this.options.clientId),this._sendPacket(i,h.bind(null,this.stream.end.bind(this.stream)))}this.disconnecting||(p("_cleanUp :: client not disconnecting. Clearing and resetting reconnect."),this._clearReconnect(),this._setupReconnect()),null!==this.pingTimer&&(p("_cleanUp :: clearing pingTimer"),this.pingTimer.clear(),this.pingTimer=null),t&&!this.connected&&(p("_cleanUp :: (%s) :: removing stream `done` callback `close` listener",this.options.clientId),this.stream.removeListener("close",t),t())},v.prototype._sendPacket=function(e,t,r){if(p("_sendPacket :: (%s) ::  start",this.options.clientId),r=r||_,!this.connected)return p("_sendPacket :: client not connected. Storing packet offline."),void this._storePacket(e,t,r);switch(this._shiftPingInterval(),e.cmd){case"publish":break;case"pubrel":return void m(this,e,t,r);default:return void y(this,e,t)}switch(e.qos){case 2:case 1:m(this,e,t,r);break;case 0:default:y(this,e,t)}p("_sendPacket :: (%s) ::  end",this.options.clientId)},v.prototype._storePacket=function(e,t,r){p("_storePacket :: packet: %o",e),p("_storePacket :: cb? %s",!!t),r=r||_,0===(e.qos||0)&&this.queueQoSZero||"publish"!==e.cmd?this.queue.push({packet:e,cb:t}):e.qos>0?(t=this.outgoing[e.messageId]?this.outgoing[e.messageId].cb:null,this.outgoingStore.put(e,function(e){if(e)return t&&t(e);r()})):t&&t(new Error("No connection to broker"))},v.prototype._setupPingTimer=function(){p("_setupPingTimer :: keepalive %d (seconds)",this.options.keepalive);var e=this;!this.pingTimer&&this.options.keepalive&&(this.pingResp=!0,this.pingTimer=c(function(){e._checkPing()},1e3*this.options.keepalive))},v.prototype._shiftPingInterval=function(){this.pingTimer&&this.options.keepalive&&this.options.reschedulePings&&this.pingTimer.reschedule(1e3*this.options.keepalive)},v.prototype._checkPing=function(){p("_checkPing :: checking ping..."),this.pingResp?(p("_checkPing :: ping response received. Clearing flag and sending `pingreq`"),this.pingResp=!1,this._sendPacket({cmd:"pingreq"})):(p("_checkPing :: calling _cleanUp with force true"),this._cleanUp(!0))},v.prototype._handlePingresp=function(){this.pingResp=!0},v.prototype._handleConnack=function(e){p("_handleConnack");var t=this.options,r=5===t.protocolVersion?e.reasonCode:e.returnCode;if(clearTimeout(this.connackTimer),e.properties&&(e.properties.topicAliasMaximum&&(t.properties||(t.properties={}),t.properties.topicAliasMaximum=e.properties.topicAliasMaximum),e.properties.serverKeepAlive&&t.keepalive&&(t.keepalive=e.properties.serverKeepAlive,this._shiftPingInterval()),e.properties.maximumPacketSize&&(t.properties||(t.properties={}),t.properties.maximumPacketSize=e.properties.maximumPacketSize)),0===r)this.reconnecting=!1,this._onConnect(e);else if(r>0){var n=new Error("Connection refused: "+b[r]);n.code=r,this.emit("error",n)}},v.prototype._handlePublish=function(e,t){p("_handlePublish: packet %o",e),t=void 0!==t?t:_;var r=e.topic.toString(),n=e.payload,i=e.qos,o=e.messageId,s=this,a=this.options,u=[0,16,128,131,135,144,145,151,153];switch(p("_handlePublish: qos %d",i),i){case 2:a.customHandleAcks(r,n,e,function(r,n){return r instanceof Error||(n=r,r=null),r?s.emit("error",r):-1===u.indexOf(n)?s.emit("error",new Error("Wrong reason code for pubrec")):void(n?s._sendPacket({cmd:"pubrec",messageId:o,reasonCode:n},t):s.incomingStore.put(e,function(){s._sendPacket({cmd:"pubrec",messageId:o},t)}))});break;case 1:a.customHandleAcks(r,n,e,function(i,a){return i instanceof Error||(a=i,i=null),i?s.emit("error",i):-1===u.indexOf(a)?s.emit("error",new Error("Wrong reason code for puback")):(a||s.emit("message",r,n,e),void s.handleMessage(e,function(e){if(e)return t&&t(e);s._sendPacket({cmd:"puback",messageId:o,reasonCode:a},t)}))});break;case 0:this.emit("message",r,n,e),this.handleMessage(e,t);break;default:p("_handlePublish: unknown QoS. Doing nothing.")}},v.prototype.handleMessage=function(e,t){t()},v.prototype._handleAck=function(e){var t,r=e.messageId,n=e.cmd,i=null,o=this.outgoing[r]?this.outgoing[r].cb:null,s=this;if(o){switch(p("_handleAck :: packet type",n),n){case"pubcomp":case"puback":var a=e.reasonCode;a&&a>0&&16!==a&&((t=new Error("Publish error: "+b[a])).code=a,o(t,e)),delete this.outgoing[r],this.outgoingStore.del(e,o);break;case"pubrec":i={cmd:"pubrel",qos:2,messageId:r};var u=e.reasonCode;u&&u>0&&16!==u?((t=new Error("Publish error: "+b[u])).code=u,o(t,e)):this._sendPacket(i);break;case"suback":delete this.outgoing[r];for(var c=0;c<e.granted.length;c++)if(0!=(128&e.granted[c])){var l=this.messageIdToTopic[r];l&&l.forEach(function(e){delete s._resubscribeTopics[e]})}o(null,e);break;case"unsuback":delete this.outgoing[r],o(null);break;default:s.emit("error",new Error("unrecognized packet type"))}this.disconnecting&&0===Object.keys(this.outgoing).length&&this.emit("outgoingEmpty")}else p("_handleAck :: Server sent an ack in error. Ignoring.")},v.prototype._handlePubrel=function(e,t){p("handling pubrel packet"),t=void 0!==t?t:_;var r=this,n={cmd:"pubcomp",messageId:e.messageId};r.incomingStore.get(e,function(e,i){e?r._sendPacket(n,t):(r.emit("message",i.topic,i.payload,i),r.handleMessage(i,function(e){if(e)return t(e);r.incomingStore.del(i,_),r._sendPacket(n,t)}))})},v.prototype._handleDisconnect=function(e){this.emit("disconnect",e)},v.prototype._nextId=function(){var e=this.nextId++;return 65536===this.nextId&&(this.nextId=1),e},v.prototype.getLastMessageId=function(){return 1===this.nextId?65535:this.nextId-1},v.prototype._resubscribe=function(e){p("_resubscribe");var t=Object.keys(this._resubscribeTopics);if(!this._firstConnection&&(this.options.clean||5===this.options.protocolVersion&&!e.sessionPresent)&&t.length>0)if(this.options.resubscribe)if(5===this.options.protocolVersion){p("_resubscribe: protocolVersion 5");for(var r=0;r<t.length;r++){var n={};n[t[r]]=this._resubscribeTopics[t[r]],n.resubscribe=!0,this.subscribe(n,{properties:n[t[r]].properties})}}else this._resubscribeTopics.resubscribe=!0,this.subscribe(this._resubscribeTopics);else this._resubscribeTopics={};this._firstConnection=!1},v.prototype._onConnect=function(e){if(this.disconnected)this.emit("connect",e);else{var t=this;this._setupPingTimer(),this._resubscribe(e),this.connected=!0,function r(){var n=t.outgoingStore.createStream();function i(){t._storeProcessing=!1,t._packetIdsDuringStoreProcessing={}}function o(){n.destroy(),n=null,i()}t.once("close",o),n.on("error",function(e){i(),t.removeListener("close",o),t.emit("error",e)}),n.on("end",function(){var n=!0;for(var s in t._packetIdsDuringStoreProcessing)if(!t._packetIdsDuringStoreProcessing[s]){n=!1;break}n?(i(),t.removeListener("close",o),t.emit("connect",e)):r()}),function e(){if(n){t._storeProcessing=!0;var r,i=n.read(1);i?t._packetIdsDuringStoreProcessing[i.messageId]?e():t.disconnecting||t.reconnectTimer?n.destroy&&n.destroy():(r=t.outgoing[i.messageId]?t.outgoing[i.messageId].cb:null,t.outgoing[i.messageId]={volatile:!1,cb:function(t,n){r&&r(t,n),e()}},t._packetIdsDuringStoreProcessing[i.messageId]=!0,t._sendPacket(i)):n.once("readable",e)}}()}()}},t.exports=v}).call(this,e("_process"),"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./store":7,"./validations":8,_process:100,debug:17,events:83,inherits:88,"mqtt-packet":92,"readable-stream":116,reinterval:117,xtend:140}],2:[function(e,t,r){(function(r){"use strict";var n,i,o,s=e("readable-stream").Transform,a=e("duplexify"),u=e("base64-js"),c=!1;t.exports=function(e,t){if(t.hostname=t.hostname||t.host,!t.hostname)throw new Error("Could not determine host. Specify host manually.");var l="MQIsdp"===t.protocolId&&3===t.protocolVersion?"mqttv3.1":"mqtt";!function(e){e.hostname||(e.hostname="localhost"),e.path||(e.path="/"),e.wsOptions||(e.wsOptions={})}(t);var f=function(e,t){var r="alis"===e.protocol?"wss":"ws",n=r+"://"+e.hostname+e.path;return e.port&&80!==e.port&&443!==e.port&&(n=r+"://"+e.hostname+":"+e.port+e.path),"function"==typeof e.transformWsUrl&&(n=e.transformWsUrl(n,e,t)),n}(t,e);return(n=t.my).connectSocket({url:f,protocols:l}),i=function(){var e=new s;return e._write=function(e,t,r){n.sendSocketMessage({data:e.buffer,success:function(){r()},fail:function(){r(new Error)}})},e._flush=function(e){n.closeSocket({success:function(){e()}})},e}(),o=a.obj(),c||(c=!0,n.onSocketOpen(function(){o.setReadable(i),o.setWritable(i),o.emit("connect")}),n.onSocketMessage(function(e){if("string"==typeof e.data){var t=u.toByteArray(e.data),n=r.from(t);i.push(n)}else{var o=new FileReader;o.addEventListener("load",function(){var e=o.result;e=e instanceof ArrayBuffer?r.from(e):r.from(e,"utf8"),i.push(e)}),o.readAsArrayBuffer(e.data)}}),n.onSocketClose(function(){o.end(),o.destroy()}),n.onSocketError(function(e){o.destroy(e)})),o}}).call(this,e("buffer").Buffer)},{"base64-js":10,buffer:12,duplexify:19,"readable-stream":116}],3:[function(e,t,r){"use strict";var n=e("net"),i=e("debug")("mqttjs:tcp");t.exports=function(e,t){var r,o;return t.port=t.port||1883,t.hostname=t.hostname||t.host||"localhost",r=t.port,o=t.hostname,i("port %d and host %s",r,o),n.createConnection(r,o)}},{debug:17,net:11}],4:[function(e,t,r){"use strict";var n=e("tls"),i=e("debug")("mqttjs:tls");t.exports=function(e,t){var r;function o(n){t.rejectUnauthorized&&e.emit("error",n),r.end()}return t.port=t.port||8883,t.host=t.hostname||t.host||"localhost",t.servername=t.host,t.rejectUnauthorized=!1!==t.rejectUnauthorized,delete t.path,i("port %d host %s rejectUnauthorized %b",t.port,t.host,t.rejectUnauthorized),(r=n.connect(t)).on("secureConnect",function(){t.rejectUnauthorized&&!r.authorized?r.emit("error",new Error("TLS not authorized")):r.removeListener("error",o)}),r.on("error",o),r}},{debug:17,tls:11}],5:[function(e,t,r){(function(r){"use strict";var n=e("debug")("mqttjs:ws"),i=e("websocket-stream"),o=e("url"),s=["rejectUnauthorized","ca","cert","key","pfx","passphrase"],a="browser"===r.title;function u(e,t){n("createWebSocket");var r="MQIsdp"===t.protocolId&&3===t.protocolVersion?"mqttv3.1":"mqtt";!function(e){e.hostname||(e.hostname="localhost"),e.port||("wss"===e.protocol?e.port=443:e.port=80),e.path||(e.path="/"),e.wsOptions||(e.wsOptions={}),a||"wss"!==e.protocol||s.forEach(function(t){e.hasOwnProperty(t)&&!e.wsOptions.hasOwnProperty(t)&&(e.wsOptions[t]=e[t])})}(t);var o=function(e,t){var r=e.protocol+"://"+e.hostname+":"+e.port+e.path;return"function"==typeof e.transformWsUrl&&(r=e.transformWsUrl(r,e,t)),r}(t,e);return n("url %s protocol %s",o,r),i(o,[r],t.wsOptions)}t.exports=a?function(e,t){if(n("browserStreamBuilder"),t.hostname||(t.hostname=t.host),!t.hostname){if("undefined"==typeof document)throw new Error("Could not determine host. Specify host manually.");var r=o.parse(document.URL);t.hostname=r.hostname,t.port||(t.port=r.port)}return u(e,t)}:function(e,t){return u(e,t)}}).call(this,e("_process"))},{_process:100,debug:17,url:132,"websocket-stream":137}],6:[function(e,t,r){(function(r,n){"use strict";var i,o,s,a=e("readable-stream").Transform,u=e("duplexify");t.exports=function(e,t){if(t.hostname=t.hostname||t.host,!t.hostname)throw new Error("Could not determine host. Specify host manually.");var c="MQIsdp"===t.protocolId&&3===t.protocolVersion?"mqttv3.1":"mqtt";!function(e){e.hostname||(e.hostname="localhost"),e.path||(e.path="/"),e.wsOptions||(e.wsOptions={})}(t);var l=function(e,t){var r="wxs"===e.protocol?"wss":"ws",n=r+"://"+e.hostname+e.path;return e.port&&80!==e.port&&443!==e.port&&(n=r+"://"+e.hostname+":"+e.port+e.path),"function"==typeof e.transformWsUrl&&(n=e.transformWsUrl(n,e,t)),n}(t,e);i=wx.connectSocket({url:l,protocols:[c]}),o=function(){var e=new a;return e._write=function(e,t,r){i.send({data:e.buffer,success:function(){r()},fail:function(e){r(new Error(e))}})},e._flush=function(e){i.close({success:function(){e()}})},e}(),(s=u.obj())._destroy=function(e,t){i.close({success:function(){t&&t(e)}})};var f=s.destroy;return s.destroy=function(){s.destroy=f;var e=this;r.nextTick(function(){i.close({fail:function(){e._destroy(new Error)}})})}.bind(s),i.onOpen(function(){s.setReadable(o),s.setWritable(o),s.emit("connect")}),i.onMessage(function(e){var t=e.data;t=t instanceof ArrayBuffer?n.from(t):n.from(t,"utf8"),o.push(t)}),i.onClose(function(){s.end(),s.destroy()}),i.onError(function(e){s.destroy(new Error(e.errMsg))}),s}}).call(this,e("_process"),e("buffer").Buffer)},{_process:100,buffer:12,duplexify:19,"readable-stream":116}],7:[function(e,t,r){(function(r){"use strict";var n=e("xtend"),i=e("readable-stream").Readable,o={objectMode:!0},s={clean:!0},a=e("es6-map");function u(e){if(!(this instanceof u))return new u(e);this.options=e||{},this.options=n(s,e),this._inflights=new a}u.prototype.put=function(e,t){return this._inflights.set(e.messageId,e),t&&t(),this},u.prototype.createStream=function(){var e=new i(o),t=!1,n=[],s=0;return this._inflights.forEach(function(e,t){n.push(e)}),e._read=function(){!t&&s<n.length?this.push(n[s++]):this.push(null)},e.destroy=function(){if(!t){var e=this;t=!0,r.nextTick(function(){e.emit("close")})}},e},u.prototype.del=function(e,t){return(e=this._inflights.get(e.messageId))?(this._inflights.delete(e.messageId),t(null,e)):t&&t(new Error("missing packet")),this},u.prototype.get=function(e,t){return(e=this._inflights.get(e.messageId))?t(null,e):t&&t(new Error("missing packet")),this},u.prototype.close=function(e){this.options.clean&&(this._inflights=null),e&&e()},t.exports=u}).call(this,e("_process"))},{_process:100,"es6-map":68,"readable-stream":116,xtend:140}],8:[function(e,t,r){"use strict";function n(e){for(var t=e.split("/"),r=0;r<t.length;r++)if("+"!==t[r]){if("#"===t[r])return r===t.length-1;if(-1!==t[r].indexOf("+")||-1!==t[r].indexOf("#"))return!1}return!0}t.exports={validateTopics:function(e){if(0===e.length)return"empty_topic_list";for(var t=0;t<e.length;t++)if(!n(e[t]))return e[t];return null}}},{}],9:[function(e,t,r){(function(r){"use strict";var n=e("../client"),i=e("../store"),o=e("url"),s=e("xtend"),a=e("debug")("mqttjs"),u={};function c(e,t){if(a("connecting to an MQTT broker..."),"object"!=typeof e||t||(t=e,e=null),t=t||{},e){var r=o.parse(e,!0);if(null!=r.port&&(r.port=Number(r.port)),null===(t=s(r,t)).protocol)throw new Error("Missing protocol");t.protocol=t.protocol.replace(/:$/,"")}if(function(e){var t;e.auth&&((t=e.auth.match(/^(.+):(.+)$/))?(e.username=t[1],e.password=t[2]):e.username=e.auth)}(t),t.query&&"string"==typeof t.query.clientId&&(t.clientId=t.query.clientId),t.cert&&t.key){if(!t.protocol)throw new Error("Missing secure protocol key");if(-1===["mqtts","wss","wxs","alis"].indexOf(t.protocol))switch(t.protocol){case"mqtt":t.protocol="mqtts";break;case"ws":t.protocol="wss";break;case"wx":t.protocol="wxs";break;case"ali":t.protocol="alis";break;default:throw new Error('Unknown protocol for secure connection: "'+t.protocol+'"!')}}if(!u[t.protocol]){var i=-1!==["mqtts","wss"].indexOf(t.protocol);t.protocol=["mqtt","mqtts","ws","wss","wx","wxs","ali","alis"].filter(function(e,t){return(!i||t%2!=0)&&"function"==typeof u[e]})[0]}if(!1===t.clean&&!t.clientId)throw new Error("Missing clientId for unclean clients");t.protocol&&(t.defaultProtocol=t.protocol);var c=new n(function(e){return t.servers&&(e._reconnectCount&&e._reconnectCount!==t.servers.length||(e._reconnectCount=0),t.host=t.servers[e._reconnectCount].host,t.port=t.servers[e._reconnectCount].port,t.protocol=t.servers[e._reconnectCount].protocol?t.servers[e._reconnectCount].protocol:t.defaultProtocol,t.hostname=t.host,e._reconnectCount++),a("calling streambuilder for",t.protocol),u[t.protocol](e,t)},t);return c.on("error",function(){}),c}"browser"!==r.title?(u.mqtt=e("./tcp"),u.tcp=e("./tcp"),u.ssl=e("./tls"),u.tls=e("./tls"),u.mqtts=e("./tls")):(u.wx=e("./wx"),u.wxs=e("./wx"),u.ali=e("./ali"),u.alis=e("./ali")),u.ws=e("./ws"),u.wss=e("./ws"),t.exports=c,t.exports.connect=c,t.exports.MqttClient=n,t.exports.Store=i}).call(this,e("_process"))},{"../client":1,"../store":7,"./ali":2,"./tcp":3,"./tls":4,"./ws":5,"./wx":6,_process:100,debug:17,url:132,xtend:140}],10:[function(e,t,r){"use strict";r.byteLength=function(e){var t=c(e),r=t[0],n=t[1];return 3*(r+n)/4-n},r.toByteArray=function(e){for(var t,r=c(e),n=r[0],s=r[1],a=new o(function(e,t,r){return 3*(t+r)/4-r}(0,n,s)),u=0,l=s>0?n-4:n,f=0;f<l;f+=4)t=i[e.charCodeAt(f)]<<18|i[e.charCodeAt(f+1)]<<12|i[e.charCodeAt(f+2)]<<6|i[e.charCodeAt(f+3)],a[u++]=t>>16&255,a[u++]=t>>8&255,a[u++]=255&t;2===s&&(t=i[e.charCodeAt(f)]<<2|i[e.charCodeAt(f+1)]>>4,a[u++]=255&t);1===s&&(t=i[e.charCodeAt(f)]<<10|i[e.charCodeAt(f+1)]<<4|i[e.charCodeAt(f+2)]>>2,a[u++]=t>>8&255,a[u++]=255&t);return a},r.fromByteArray=function(e){for(var t,r=e.length,i=r%3,o=[],s=0,a=r-i;s<a;s+=16383)o.push(l(e,s,s+16383>a?a:s+16383));1===i?(t=e[r-1],o.push(n[t>>2]+n[t<<4&63]+"==")):2===i&&(t=(e[r-2]<<8)+e[r-1],o.push(n[t>>10]+n[t>>4&63]+n[t<<2&63]+"="));return o.join("")};for(var n=[],i=[],o="undefined"!=typeof Uint8Array?Uint8Array:Array,s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",a=0,u=s.length;a<u;++a)n[a]=s[a],i[s.charCodeAt(a)]=a;function c(e){var t=e.length;if(t%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var r=e.indexOf("=");return-1===r&&(r=t),[r,r===t?0:4-r%4]}function l(e,t,r){for(var i,o,s=[],a=t;a<r;a+=3)i=(e[a]<<16&16711680)+(e[a+1]<<8&65280)+(255&e[a+2]),s.push(n[(o=i)>>18&63]+n[o>>12&63]+n[o>>6&63]+n[63&o]);return s.join("")}i["-".charCodeAt(0)]=62,i["_".charCodeAt(0)]=63},{}],11:[function(e,t,r){},{}],12:[function(e,t,r){(function(t){"use strict";var n=e("base64-js"),i=e("ieee754");r.Buffer=t,r.SlowBuffer=function(e){+e!=e&&(e=0);return t.alloc(+e)},r.INSPECT_MAX_BYTES=50;var o=2147483647;function s(e){if(e>o)throw new RangeError('The value "'+e+'" is invalid for option "size"');var r=new Uint8Array(e);return r.__proto__=t.prototype,r}function t(e,t,r){if("number"==typeof e){if("string"==typeof t)throw new TypeError('The "string" argument must be of type string. Received type number');return c(e)}return a(e,t,r)}function a(e,r,n){if("string"==typeof e)return function(e,r){"string"==typeof r&&""!==r||(r="utf8");if(!t.isEncoding(r))throw new TypeError("Unknown encoding: "+r);var n=0|p(e,r),i=s(n),o=i.write(e,r);o!==n&&(i=i.slice(0,o));return i}(e,r);if(ArrayBuffer.isView(e))return l(e);if(null==e)throw TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof e);if(q(e,ArrayBuffer)||e&&q(e.buffer,ArrayBuffer))return function(e,r,n){if(r<0||e.byteLength<r)throw new RangeError('"offset" is outside of buffer bounds');if(e.byteLength<r+(n||0))throw new RangeError('"length" is outside of buffer bounds');var i;i=void 0===r&&void 0===n?new Uint8Array(e):void 0===n?new Uint8Array(e,r):new Uint8Array(e,r,n);return i.__proto__=t.prototype,i}(e,r,n);if("number"==typeof e)throw new TypeError('The "value" argument must not be of type number. Received type number');var i=e.valueOf&&e.valueOf();if(null!=i&&i!==e)return t.from(i,r,n);var o=function(e){if(t.isBuffer(e)){var r=0|f(e.length),n=s(r);return 0===n.length?n:(e.copy(n,0,0,r),n)}if(void 0!==e.length)return"number"!=typeof e.length||F(e.length)?s(0):l(e);if("Buffer"===e.type&&Array.isArray(e.data))return l(e.data)}(e);if(o)return o;if("undefined"!=typeof Symbol&&null!=Symbol.toPrimitive&&"function"==typeof e[Symbol.toPrimitive])return t.from(e[Symbol.toPrimitive]("string"),r,n);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof e)}function u(e){if("number"!=typeof e)throw new TypeError('"size" argument must be of type number');if(e<0)throw new RangeError('The value "'+e+'" is invalid for option "size"')}function c(e){return u(e),s(e<0?0:0|f(e))}function l(e){for(var t=e.length<0?0:0|f(e.length),r=s(t),n=0;n<t;n+=1)r[n]=255&e[n];return r}function f(e){if(e>=o)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+o.toString(16)+" bytes");return 0|e}function p(e,r){if(t.isBuffer(e))return e.length;if(ArrayBuffer.isView(e)||q(e,ArrayBuffer))return e.byteLength;if("string"!=typeof e)throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof e);var n=e.length,i=arguments.length>2&&!0===arguments[2];if(!i&&0===n)return 0;for(var o=!1;;)switch(r){case"ascii":case"latin1":case"binary":return n;case"utf8":case"utf-8":return U(e).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*n;case"hex":return n>>>1;case"base64":return N(e).length;default:if(o)return i?-1:U(e).length;r=(""+r).toLowerCase(),o=!0}}function h(e,t,r){var n=e[t];e[t]=e[r],e[r]=n}function d(e,r,n,i,o){if(0===e.length)return-1;if("string"==typeof n?(i=n,n=0):n>2147483647?n=2147483647:n<-2147483648&&(n=-2147483648),F(n=+n)&&(n=o?0:e.length-1),n<0&&(n=e.length+n),n>=e.length){if(o)return-1;n=e.length-1}else if(n<0){if(!o)return-1;n=0}if("string"==typeof r&&(r=t.from(r,i)),t.isBuffer(r))return 0===r.length?-1:g(e,r,n,i,o);if("number"==typeof r)return r&=255,"function"==typeof Uint8Array.prototype.indexOf?o?Uint8Array.prototype.indexOf.call(e,r,n):Uint8Array.prototype.lastIndexOf.call(e,r,n):g(e,[r],n,i,o);throw new TypeError("val must be string, number or Buffer")}function g(e,t,r,n,i){var o,s=1,a=e.length,u=t.length;if(void 0!==n&&("ucs2"===(n=String(n).toLowerCase())||"ucs-2"===n||"utf16le"===n||"utf-16le"===n)){if(e.length<2||t.length<2)return-1;s=2,a/=2,u/=2,r/=2}function c(e,t){return 1===s?e[t]:e.readUInt16BE(t*s)}if(i){var l=-1;for(o=r;o<a;o++)if(c(e,o)===c(t,-1===l?0:o-l)){if(-1===l&&(l=o),o-l+1===u)return l*s}else-1!==l&&(o-=o-l),l=-1}else for(r+u>a&&(r=a-u),o=r;o>=0;o--){for(var f=!0,p=0;p<u;p++)if(c(e,o+p)!==c(t,p)){f=!1;break}if(f)return o}return-1}function b(e,t,r,n){r=Number(r)||0;var i=e.length-r;n?(n=Number(n))>i&&(n=i):n=i;var o=t.length;n>o/2&&(n=o/2);for(var s=0;s<n;++s){var a=parseInt(t.substr(2*s,2),16);if(F(a))return s;e[r+s]=a}return s}function y(e,t,r,n){return L(U(t,e.length-r),e,r,n)}function m(e,t,r,n){return L(function(e){for(var t=[],r=0;r<e.length;++r)t.push(255&e.charCodeAt(r));return t}(t),e,r,n)}function _(e,t,r,n){return m(e,t,r,n)}function v(e,t,r,n){return L(N(t),e,r,n)}function w(e,t,r,n){return L(function(e,t){for(var r,n,i,o=[],s=0;s<e.length&&!((t-=2)<0);++s)r=e.charCodeAt(s),n=r>>8,i=r%256,o.push(i),o.push(n);return o}(t,e.length-r),e,r,n)}function S(e,t,r){return 0===t&&r===e.length?n.fromByteArray(e):n.fromByteArray(e.slice(t,r))}function x(e,t,r){r=Math.min(e.length,r);for(var n=[],i=t;i<r;){var o,s,a,u,c=e[i],l=null,f=c>239?4:c>223?3:c>191?2:1;if(i+f<=r)switch(f){case 1:c<128&&(l=c);break;case 2:128==(192&(o=e[i+1]))&&(u=(31&c)<<6|63&o)>127&&(l=u);break;case 3:o=e[i+1],s=e[i+2],128==(192&o)&&128==(192&s)&&(u=(15&c)<<12|(63&o)<<6|63&s)>2047&&(u<55296||u>57343)&&(l=u);break;case 4:o=e[i+1],s=e[i+2],a=e[i+3],128==(192&o)&&128==(192&s)&&128==(192&a)&&(u=(15&c)<<18|(63&o)<<12|(63&s)<<6|63&a)>65535&&u<1114112&&(l=u)}null===l?(l=65533,f=1):l>65535&&(l-=65536,n.push(l>>>10&1023|55296),l=56320|1023&l),n.push(l),i+=f}return function(e){var t=e.length;if(t<=k)return String.fromCharCode.apply(String,e);var r="",n=0;for(;n<t;)r+=String.fromCharCode.apply(String,e.slice(n,n+=k));return r}(n)}r.kMaxLength=o,t.TYPED_ARRAY_SUPPORT=function(){try{var e=new Uint8Array(1);return e.__proto__={__proto__:Uint8Array.prototype,foo:function(){return 42}},42===e.foo()}catch(e){return!1}}(),t.TYPED_ARRAY_SUPPORT||"undefined"==typeof console||"function"!=typeof console.error||console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."),Object.defineProperty(t.prototype,"parent",{enumerable:!0,get:function(){if(t.isBuffer(this))return this.buffer}}),Object.defineProperty(t.prototype,"offset",{enumerable:!0,get:function(){if(t.isBuffer(this))return this.byteOffset}}),"undefined"!=typeof Symbol&&null!=Symbol.species&&t[Symbol.species]===t&&Object.defineProperty(t,Symbol.species,{value:null,configurable:!0,enumerable:!1,writable:!1}),t.poolSize=8192,t.from=function(e,t,r){return a(e,t,r)},t.prototype.__proto__=Uint8Array.prototype,t.__proto__=Uint8Array,t.alloc=function(e,t,r){return function(e,t,r){return u(e),e<=0?s(e):void 0!==t?"string"==typeof r?s(e).fill(t,r):s(e).fill(t):s(e)}(e,t,r)},t.allocUnsafe=function(e){return c(e)},t.allocUnsafeSlow=function(e){return c(e)},t.isBuffer=function(e){return null!=e&&!0===e._isBuffer&&e!==t.prototype},t.compare=function(e,r){if(q(e,Uint8Array)&&(e=t.from(e,e.offset,e.byteLength)),q(r,Uint8Array)&&(r=t.from(r,r.offset,r.byteLength)),!t.isBuffer(e)||!t.isBuffer(r))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(e===r)return 0;for(var n=e.length,i=r.length,o=0,s=Math.min(n,i);o<s;++o)if(e[o]!==r[o]){n=e[o],i=r[o];break}return n<i?-1:i<n?1:0},t.isEncoding=function(e){switch(String(e).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},t.concat=function(e,r){if(!Array.isArray(e))throw new TypeError('"list" argument must be an Array of Buffers');if(0===e.length)return t.alloc(0);var n;if(void 0===r)for(r=0,n=0;n<e.length;++n)r+=e[n].length;var i=t.allocUnsafe(r),o=0;for(n=0;n<e.length;++n){var s=e[n];if(q(s,Uint8Array)&&(s=t.from(s)),!t.isBuffer(s))throw new TypeError('"list" argument must be an Array of Buffers');s.copy(i,o),o+=s.length}return i},t.byteLength=p,t.prototype._isBuffer=!0,t.prototype.swap16=function(){var e=this.length;if(e%2!=0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(var t=0;t<e;t+=2)h(this,t,t+1);return this},t.prototype.swap32=function(){var e=this.length;if(e%4!=0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(var t=0;t<e;t+=4)h(this,t,t+3),h(this,t+1,t+2);return this},t.prototype.swap64=function(){var e=this.length;if(e%8!=0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(var t=0;t<e;t+=8)h(this,t,t+7),h(this,t+1,t+6),h(this,t+2,t+5),h(this,t+3,t+4);return this},t.prototype.toString=function(){var e=this.length;return 0===e?"":0===arguments.length?x(this,0,e):function(e,t,r){var n=!1;if((void 0===t||t<0)&&(t=0),t>this.length)return"";if((void 0===r||r>this.length)&&(r=this.length),r<=0)return"";if((r>>>=0)<=(t>>>=0))return"";for(e||(e="utf8");;)switch(e){case"hex":return C(this,t,r);case"utf8":case"utf-8":return x(this,t,r);case"ascii":return E(this,t,r);case"latin1":case"binary":return I(this,t,r);case"base64":return S(this,t,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return O(this,t,r);default:if(n)throw new TypeError("Unknown encoding: "+e);e=(e+"").toLowerCase(),n=!0}}.apply(this,arguments)},t.prototype.toLocaleString=t.prototype.toString,t.prototype.equals=function(e){if(!t.isBuffer(e))throw new TypeError("Argument must be a Buffer");return this===e||0===t.compare(this,e)},t.prototype.inspect=function(){var e="",t=r.INSPECT_MAX_BYTES;return e=this.toString("hex",0,t).replace(/(.{2})/g,"$1 ").trim(),this.length>t&&(e+=" ... "),"<Buffer "+e+">"},t.prototype.compare=function(e,r,n,i,o){if(q(e,Uint8Array)&&(e=t.from(e,e.offset,e.byteLength)),!t.isBuffer(e))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof e);if(void 0===r&&(r=0),void 0===n&&(n=e?e.length:0),void 0===i&&(i=0),void 0===o&&(o=this.length),r<0||n>e.length||i<0||o>this.length)throw new RangeError("out of range index");if(i>=o&&r>=n)return 0;if(i>=o)return-1;if(r>=n)return 1;if(r>>>=0,n>>>=0,i>>>=0,o>>>=0,this===e)return 0;for(var s=o-i,a=n-r,u=Math.min(s,a),c=this.slice(i,o),l=e.slice(r,n),f=0;f<u;++f)if(c[f]!==l[f]){s=c[f],a=l[f];break}return s<a?-1:a<s?1:0},t.prototype.includes=function(e,t,r){return-1!==this.indexOf(e,t,r)},t.prototype.indexOf=function(e,t,r){return d(this,e,t,r,!0)},t.prototype.lastIndexOf=function(e,t,r){return d(this,e,t,r,!1)},t.prototype.write=function(e,t,r,n){if(void 0===t)n="utf8",r=this.length,t=0;else if(void 0===r&&"string"==typeof t)n=t,r=this.length,t=0;else{if(!isFinite(t))throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");t>>>=0,isFinite(r)?(r>>>=0,void 0===n&&(n="utf8")):(n=r,r=void 0)}var i=this.length-t;if((void 0===r||r>i)&&(r=i),e.length>0&&(r<0||t<0)||t>this.length)throw new RangeError("Attempt to write outside buffer bounds");n||(n="utf8");for(var o=!1;;)switch(n){case"hex":return b(this,e,t,r);case"utf8":case"utf-8":return y(this,e,t,r);case"ascii":return m(this,e,t,r);case"latin1":case"binary":return _(this,e,t,r);case"base64":return v(this,e,t,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return w(this,e,t,r);default:if(o)throw new TypeError("Unknown encoding: "+n);n=(""+n).toLowerCase(),o=!0}},t.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};var k=4096;function E(e,t,r){var n="";r=Math.min(e.length,r);for(var i=t;i<r;++i)n+=String.fromCharCode(127&e[i]);return n}function I(e,t,r){var n="";r=Math.min(e.length,r);for(var i=t;i<r;++i)n+=String.fromCharCode(e[i]);return n}function C(e,t,r){var n=e.length;(!t||t<0)&&(t=0),(!r||r<0||r>n)&&(r=n);for(var i="",o=t;o<r;++o)i+=R(e[o]);return i}function O(e,t,r){for(var n=e.slice(t,r),i="",o=0;o<n.length;o+=2)i+=String.fromCharCode(n[o]+256*n[o+1]);return i}function j(e,t,r){if(e%1!=0||e<0)throw new RangeError("offset is not uint");if(e+t>r)throw new RangeError("Trying to access beyond buffer length")}function T(e,r,n,i,o,s){if(!t.isBuffer(e))throw new TypeError('"buffer" argument must be a Buffer instance');if(r>o||r<s)throw new RangeError('"value" argument is out of bounds');if(n+i>e.length)throw new RangeError("Index out of range")}function A(e,t,r,n,i,o){if(r+n>e.length)throw new RangeError("Index out of range");if(r<0)throw new RangeError("Index out of range")}function P(e,t,r,n,o){return t=+t,r>>>=0,o||A(e,0,r,4),i.write(e,t,r,n,23,4),r+4}function M(e,t,r,n,o){return t=+t,r>>>=0,o||A(e,0,r,8),i.write(e,t,r,n,52,8),r+8}t.prototype.slice=function(e,r){var n=this.length;e=~~e,r=void 0===r?n:~~r,e<0?(e+=n)<0&&(e=0):e>n&&(e=n),r<0?(r+=n)<0&&(r=0):r>n&&(r=n),r<e&&(r=e);var i=this.subarray(e,r);return i.__proto__=t.prototype,i},t.prototype.readUIntLE=function(e,t,r){e>>>=0,t>>>=0,r||j(e,t,this.length);for(var n=this[e],i=1,o=0;++o<t&&(i*=256);)n+=this[e+o]*i;return n},t.prototype.readUIntBE=function(e,t,r){e>>>=0,t>>>=0,r||j(e,t,this.length);for(var n=this[e+--t],i=1;t>0&&(i*=256);)n+=this[e+--t]*i;return n},t.prototype.readUInt8=function(e,t){return e>>>=0,t||j(e,1,this.length),this[e]},t.prototype.readUInt16LE=function(e,t){return e>>>=0,t||j(e,2,this.length),this[e]|this[e+1]<<8},t.prototype.readUInt16BE=function(e,t){return e>>>=0,t||j(e,2,this.length),this[e]<<8|this[e+1]},t.prototype.readUInt32LE=function(e,t){return e>>>=0,t||j(e,4,this.length),(this[e]|this[e+1]<<8|this[e+2]<<16)+16777216*this[e+3]},t.prototype.readUInt32BE=function(e,t){return e>>>=0,t||j(e,4,this.length),16777216*this[e]+(this[e+1]<<16|this[e+2]<<8|this[e+3])},t.prototype.readIntLE=function(e,t,r){e>>>=0,t>>>=0,r||j(e,t,this.length);for(var n=this[e],i=1,o=0;++o<t&&(i*=256);)n+=this[e+o]*i;return n>=(i*=128)&&(n-=Math.pow(2,8*t)),n},t.prototype.readIntBE=function(e,t,r){e>>>=0,t>>>=0,r||j(e,t,this.length);for(var n=t,i=1,o=this[e+--n];n>0&&(i*=256);)o+=this[e+--n]*i;return o>=(i*=128)&&(o-=Math.pow(2,8*t)),o},t.prototype.readInt8=function(e,t){return e>>>=0,t||j(e,1,this.length),128&this[e]?-1*(255-this[e]+1):this[e]},t.prototype.readInt16LE=function(e,t){e>>>=0,t||j(e,2,this.length);var r=this[e]|this[e+1]<<8;return 32768&r?4294901760|r:r},t.prototype.readInt16BE=function(e,t){e>>>=0,t||j(e,2,this.length);var r=this[e+1]|this[e]<<8;return 32768&r?4294901760|r:r},t.prototype.readInt32LE=function(e,t){return e>>>=0,t||j(e,4,this.length),this[e]|this[e+1]<<8|this[e+2]<<16|this[e+3]<<24},t.prototype.readInt32BE=function(e,t){return e>>>=0,t||j(e,4,this.length),this[e]<<24|this[e+1]<<16|this[e+2]<<8|this[e+3]},t.prototype.readFloatLE=function(e,t){return e>>>=0,t||j(e,4,this.length),i.read(this,e,!0,23,4)},t.prototype.readFloatBE=function(e,t){return e>>>=0,t||j(e,4,this.length),i.read(this,e,!1,23,4)},t.prototype.readDoubleLE=function(e,t){return e>>>=0,t||j(e,8,this.length),i.read(this,e,!0,52,8)},t.prototype.readDoubleBE=function(e,t){return e>>>=0,t||j(e,8,this.length),i.read(this,e,!1,52,8)},t.prototype.writeUIntLE=function(e,t,r,n){(e=+e,t>>>=0,r>>>=0,n)||T(this,e,t,r,Math.pow(2,8*r)-1,0);var i=1,o=0;for(this[t]=255&e;++o<r&&(i*=256);)this[t+o]=e/i&255;return t+r},t.prototype.writeUIntBE=function(e,t,r,n){(e=+e,t>>>=0,r>>>=0,n)||T(this,e,t,r,Math.pow(2,8*r)-1,0);var i=r-1,o=1;for(this[t+i]=255&e;--i>=0&&(o*=256);)this[t+i]=e/o&255;return t+r},t.prototype.writeUInt8=function(e,t,r){return e=+e,t>>>=0,r||T(this,e,t,1,255,0),this[t]=255&e,t+1},t.prototype.writeUInt16LE=function(e,t,r){return e=+e,t>>>=0,r||T(this,e,t,2,65535,0),this[t]=255&e,this[t+1]=e>>>8,t+2},t.prototype.writeUInt16BE=function(e,t,r){return e=+e,t>>>=0,r||T(this,e,t,2,65535,0),this[t]=e>>>8,this[t+1]=255&e,t+2},t.prototype.writeUInt32LE=function(e,t,r){return e=+e,t>>>=0,r||T(this,e,t,4,4294967295,0),this[t+3]=e>>>24,this[t+2]=e>>>16,this[t+1]=e>>>8,this[t]=255&e,t+4},t.prototype.writeUInt32BE=function(e,t,r){return e=+e,t>>>=0,r||T(this,e,t,4,4294967295,0),this[t]=e>>>24,this[t+1]=e>>>16,this[t+2]=e>>>8,this[t+3]=255&e,t+4},t.prototype.writeIntLE=function(e,t,r,n){if(e=+e,t>>>=0,!n){var i=Math.pow(2,8*r-1);T(this,e,t,r,i-1,-i)}var o=0,s=1,a=0;for(this[t]=255&e;++o<r&&(s*=256);)e<0&&0===a&&0!==this[t+o-1]&&(a=1),this[t+o]=(e/s>>0)-a&255;return t+r},t.prototype.writeIntBE=function(e,t,r,n){if(e=+e,t>>>=0,!n){var i=Math.pow(2,8*r-1);T(this,e,t,r,i-1,-i)}var o=r-1,s=1,a=0;for(this[t+o]=255&e;--o>=0&&(s*=256);)e<0&&0===a&&0!==this[t+o+1]&&(a=1),this[t+o]=(e/s>>0)-a&255;return t+r},t.prototype.writeInt8=function(e,t,r){return e=+e,t>>>=0,r||T(this,e,t,1,127,-128),e<0&&(e=255+e+1),this[t]=255&e,t+1},t.prototype.writeInt16LE=function(e,t,r){return e=+e,t>>>=0,r||T(this,e,t,2,32767,-32768),this[t]=255&e,this[t+1]=e>>>8,t+2},t.prototype.writeInt16BE=function(e,t,r){return e=+e,t>>>=0,r||T(this,e,t,2,32767,-32768),this[t]=e>>>8,this[t+1]=255&e,t+2},t.prototype.writeInt32LE=function(e,t,r){return e=+e,t>>>=0,r||T(this,e,t,4,2147483647,-2147483648),this[t]=255&e,this[t+1]=e>>>8,this[t+2]=e>>>16,this[t+3]=e>>>24,t+4},t.prototype.writeInt32BE=function(e,t,r){return e=+e,t>>>=0,r||T(this,e,t,4,2147483647,-2147483648),e<0&&(e=4294967295+e+1),this[t]=e>>>24,this[t+1]=e>>>16,this[t+2]=e>>>8,this[t+3]=255&e,t+4},t.prototype.writeFloatLE=function(e,t,r){return P(this,e,t,!0,r)},t.prototype.writeFloatBE=function(e,t,r){return P(this,e,t,!1,r)},t.prototype.writeDoubleLE=function(e,t,r){return M(this,e,t,!0,r)},t.prototype.writeDoubleBE=function(e,t,r){return M(this,e,t,!1,r)},t.prototype.copy=function(e,r,n,i){if(!t.isBuffer(e))throw new TypeError("argument should be a Buffer");if(n||(n=0),i||0===i||(i=this.length),r>=e.length&&(r=e.length),r||(r=0),i>0&&i<n&&(i=n),i===n)return 0;if(0===e.length||0===this.length)return 0;if(r<0)throw new RangeError("targetStart out of bounds");if(n<0||n>=this.length)throw new RangeError("Index out of range");if(i<0)throw new RangeError("sourceEnd out of bounds");i>this.length&&(i=this.length),e.length-r<i-n&&(i=e.length-r+n);var o=i-n;if(this===e&&"function"==typeof Uint8Array.prototype.copyWithin)this.copyWithin(r,n,i);else if(this===e&&n<r&&r<i)for(var s=o-1;s>=0;--s)e[s+r]=this[s+n];else Uint8Array.prototype.set.call(e,this.subarray(n,i),r);return o},t.prototype.fill=function(e,r,n,i){if("string"==typeof e){if("string"==typeof r?(i=r,r=0,n=this.length):"string"==typeof n&&(i=n,n=this.length),void 0!==i&&"string"!=typeof i)throw new TypeError("encoding must be a string");if("string"==typeof i&&!t.isEncoding(i))throw new TypeError("Unknown encoding: "+i);if(1===e.length){var o=e.charCodeAt(0);("utf8"===i&&o<128||"latin1"===i)&&(e=o)}}else"number"==typeof e&&(e&=255);if(r<0||this.length<r||this.length<n)throw new RangeError("Out of range index");if(n<=r)return this;var s;if(r>>>=0,n=void 0===n?this.length:n>>>0,e||(e=0),"number"==typeof e)for(s=r;s<n;++s)this[s]=e;else{var a=t.isBuffer(e)?e:t.from(e,i),u=a.length;if(0===u)throw new TypeError('The value "'+e+'" is invalid for argument "value"');for(s=0;s<n-r;++s)this[s+r]=a[s%u]}return this};var B=/[^+/0-9A-Za-z-_]/g;function R(e){return e<16?"0"+e.toString(16):e.toString(16)}function U(e,t){var r;t=t||1/0;for(var n=e.length,i=null,o=[],s=0;s<n;++s){if((r=e.charCodeAt(s))>55295&&r<57344){if(!i){if(r>56319){(t-=3)>-1&&o.push(239,191,189);continue}if(s+1===n){(t-=3)>-1&&o.push(239,191,189);continue}i=r;continue}if(r<56320){(t-=3)>-1&&o.push(239,191,189),i=r;continue}r=65536+(i-55296<<10|r-56320)}else i&&(t-=3)>-1&&o.push(239,191,189);if(i=null,r<128){if((t-=1)<0)break;o.push(r)}else if(r<2048){if((t-=2)<0)break;o.push(r>>6|192,63&r|128)}else if(r<65536){if((t-=3)<0)break;o.push(r>>12|224,r>>6&63|128,63&r|128)}else{if(!(r<1114112))throw new Error("Invalid code point");if((t-=4)<0)break;o.push(r>>18|240,r>>12&63|128,r>>6&63|128,63&r|128)}}return o}function N(e){return n.toByteArray(function(e){if((e=(e=e.split("=")[0]).trim().replace(B,"")).length<2)return"";for(;e.length%4!=0;)e+="=";return e}(e))}function L(e,t,r,n){for(var i=0;i<n&&!(i+r>=t.length||i>=e.length);++i)t[i+r]=e[i];return i}function q(e,t){return e instanceof t||null!=e&&null!=e.constructor&&null!=e.constructor.name&&e.constructor.name===t.name}function F(e){return e!=e}}).call(this,e("buffer").Buffer)},{"base64-js":10,buffer:12,ieee754:87}],13:[function(e,t,r){(function(e){function t(e){return Object.prototype.toString.call(e)}r.isArray=function(e){return Array.isArray?Array.isArray(e):"[object Array]"===t(e)},r.isBoolean=function(e){return"boolean"==typeof e},r.isNull=function(e){return null===e},r.isNullOrUndefined=function(e){return null==e},r.isNumber=function(e){return"number"==typeof e},r.isString=function(e){return"string"==typeof e},r.isSymbol=function(e){return"symbol"==typeof e},r.isUndefined=function(e){return void 0===e},r.isRegExp=function(e){return"[object RegExp]"===t(e)},r.isObject=function(e){return"object"==typeof e&&null!==e},r.isDate=function(e){return"[object Date]"===t(e)},r.isError=function(e){return"[object Error]"===t(e)||e instanceof Error},r.isFunction=function(e){return"function"==typeof e},r.isPrimitive=function(e){return null===e||"boolean"==typeof e||"number"==typeof e||"string"==typeof e||"symbol"==typeof e||void 0===e},r.isBuffer=e.isBuffer}).call(this,{isBuffer:e("../../is-buffer/index.js")})},{"../../is-buffer/index.js":89}],14:[function(e,t,r){"use strict";var n,i=e("type/value/is"),o=e("type/value/ensure"),s=e("type/plain-function/ensure"),a=e("es5-ext/object/copy"),u=e("es5-ext/object/normalize-options"),c=e("es5-ext/object/map"),l=Function.prototype.bind,f=Object.defineProperty,p=Object.prototype.hasOwnProperty;n=function(e,t,r){var n,i=o(t)&&s(t.value);return delete(n=a(t)).writable,delete n.value,n.get=function(){return!r.overwriteDefinition&&p.call(this,e)?i:(t.value=l.call(i,r.resolveContext?r.resolveContext(this):this),f(this,e,t),this[e])},n},t.exports=function(e){var t=u(arguments[1]);return i(t.resolveContext)&&s(t.resolveContext),c(e,function(e,r){return n(r,e,t)})}},{"es5-ext/object/copy":41,"es5-ext/object/map":49,"es5-ext/object/normalize-options":50,"type/plain-function/ensure":126,"type/value/ensure":130,"type/value/is":131}],15:[function(e,t,r){"use strict";var n=e("type/value/is"),i=e("type/plain-function/is"),o=e("es5-ext/object/assign"),s=e("es5-ext/object/normalize-options"),a=e("es5-ext/string/#/contains");(t.exports=function(e,t){var r,i,u,c,l;return arguments.length<2||"string"!=typeof e?(c=t,t=e,e=null):c=arguments[2],n(e)?(r=a.call(e,"c"),i=a.call(e,"e"),u=a.call(e,"w")):(r=u=!0,i=!1),l={value:t,configurable:r,enumerable:i,writable:u},c?o(s(c),l):l}).gs=function(e,t,r){var u,c,l,f;return"string"!=typeof e?(l=r,r=t,t=e,e=null):l=arguments[3],n(t)?i(t)?n(r)?i(r)||(l=r,r=void 0):r=void 0:(l=t,t=r=void 0):t=void 0,n(e)?(u=a.call(e,"c"),c=a.call(e,"e")):(u=!0,c=!1),f={get:t,set:r,configurable:u,enumerable:c},l?o(s(l),f):f}},{"es5-ext/object/assign":38,"es5-ext/object/normalize-options":50,"es5-ext/string/#/contains":57,"type/plain-function/is":127,"type/value/is":131}],16:[function(e,t,r){var n=1e3,i=60*n,o=60*i,s=24*o,a=7*s,u=365.25*s;function c(e,t,r,n){var i=t>=1.5*r;return Math.round(e/r)+" "+n+(i?"s":"")}t.exports=function(e,t){t=t||{};var r=typeof e;if("string"===r&&e.length>0)return function(e){if((e=String(e)).length>100)return;var t=/^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(e);if(!t)return;var r=parseFloat(t[1]);switch((t[2]||"ms").toLowerCase()){case"years":case"year":case"yrs":case"yr":case"y":return r*u;case"weeks":case"week":case"w":return r*a;case"days":case"day":case"d":return r*s;case"hours":case"hour":case"hrs":case"hr":case"h":return r*o;case"minutes":case"minute":case"mins":case"min":case"m":return r*i;case"seconds":case"second":case"secs":case"sec":case"s":return r*n;case"milliseconds":case"millisecond":case"msecs":case"msec":case"ms":return r;default:return}}(e);if("number"===r&&isFinite(e))return t.long?function(e){var t=Math.abs(e);if(t>=s)return c(e,t,s,"day");if(t>=o)return c(e,t,o,"hour");if(t>=i)return c(e,t,i,"minute");if(t>=n)return c(e,t,n,"second");return e+" ms"}(e):function(e){var t=Math.abs(e);if(t>=s)return Math.round(e/s)+"d";if(t>=o)return Math.round(e/o)+"h";if(t>=i)return Math.round(e/i)+"m";if(t>=n)return Math.round(e/n)+"s";return e+"ms"}(e);throw new Error("val is not a non-empty string or a valid number. val="+JSON.stringify(e))}},{}],17:[function(e,t,r){(function(n){r.log=function(...e){return"object"==typeof console&&console.log&&console.log(...e)},r.formatArgs=function(e){if(e[0]=(this.useColors?"%c":"")+this.namespace+(this.useColors?" %c":" ")+e[0]+(this.useColors?"%c ":" ")+"+"+t.exports.humanize(this.diff),!this.useColors)return;const r="color: "+this.color;e.splice(1,0,r,"color: inherit");let n=0,i=0;e[0].replace(/%[a-zA-Z%]/g,e=>{"%%"!==e&&"%c"===e&&(i=++n)}),e.splice(i,0,r)},r.save=function(e){try{e?r.storage.setItem("debug",e):r.storage.removeItem("debug")}catch(e){}},r.load=function(){let e;try{e=r.storage.getItem("debug")}catch(e){}!e&&void 0!==n&&"env"in n&&(e=n.env.DEBUG);return e},r.useColors=function(){if("undefined"!=typeof window&&window.process&&("renderer"===window.process.type||window.process.__nwjs))return!0;if("undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))return!1;return"undefined"!=typeof document&&document.documentElement&&document.documentElement.style&&document.documentElement.style.WebkitAppearance||"undefined"!=typeof window&&window.console&&(window.console.firebug||window.console.exception&&window.console.table)||"undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)&&parseInt(RegExp.$1,10)>=31||"undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/)},r.storage=function(){try{return localStorage}catch(e){}}(),r.colors=["#0000CC","#0000FF","#0033CC","#0033FF","#0066CC","#0066FF","#0099CC","#0099FF","#00CC00","#00CC33","#00CC66","#00CC99","#00CCCC","#00CCFF","#3300CC","#3300FF","#3333CC","#3333FF","#3366CC","#3366FF","#3399CC","#3399FF","#33CC00","#33CC33","#33CC66","#33CC99","#33CCCC","#33CCFF","#6600CC","#6600FF","#6633CC","#6633FF","#66CC00","#66CC33","#9900CC","#9900FF","#9933CC","#9933FF","#99CC00","#99CC33","#CC0000","#CC0033","#CC0066","#CC0099","#CC00CC","#CC00FF","#CC3300","#CC3333","#CC3366","#CC3399","#CC33CC","#CC33FF","#CC6600","#CC6633","#CC9900","#CC9933","#CCCC00","#CCCC33","#FF0000","#FF0033","#FF0066","#FF0099","#FF00CC","#FF00FF","#FF3300","#FF3333","#FF3366","#FF3399","#FF33CC","#FF33FF","#FF6600","#FF6633","#FF9900","#FF9933","#FFCC00","#FFCC33"],t.exports=e("./common")(r);const{formatters:i}=t.exports;i.j=function(e){try{return JSON.stringify(e)}catch(e){return"[UnexpectedJSONParseError]: "+e.message}}}).call(this,e("_process"))},{"./common":18,_process:100}],18:[function(e,t,r){t.exports=function(t){function r(e){let t=0;for(let r=0;r<e.length;r++)t=(t<<5)-t+e.charCodeAt(r),t|=0;return n.colors[Math.abs(t)%n.colors.length]}function n(e){let t;function s(...e){if(!s.enabled)return;const r=s,i=Number(new Date),o=i-(t||i);r.diff=o,r.prev=t,r.curr=i,t=i,e[0]=n.coerce(e[0]),"string"!=typeof e[0]&&e.unshift("%O");let a=0;e[0]=e[0].replace(/%([a-zA-Z%])/g,(t,i)=>{if("%%"===t)return t;a++;const o=n.formatters[i];if("function"==typeof o){const n=e[a];t=o.call(r,n),e.splice(a,1),a--}return t}),n.formatArgs.call(r,e),(r.log||n.log).apply(r,e)}return s.namespace=e,s.enabled=n.enabled(e),s.useColors=n.useColors(),s.color=r(e),s.destroy=i,s.extend=o,"function"==typeof n.init&&n.init(s),n.instances.push(s),s}function i(){const e=n.instances.indexOf(this);return-1!==e&&(n.instances.splice(e,1),!0)}function o(e,t){const r=n(this.namespace+(void 0===t?":":t)+e);return r.log=this.log,r}function s(e){return e.toString().substring(2,e.toString().length-2).replace(/\.\*\?$/,"*")}return n.debug=n,n.default=n,n.coerce=function(e){return e instanceof Error?e.stack||e.message:e},n.disable=function(){const e=[...n.names.map(s),...n.skips.map(s).map(e=>"-"+e)].join(",");return n.enable(""),e},n.enable=function(e){let t;n.save(e),n.names=[],n.skips=[];const r=("string"==typeof e?e:"").split(/[\s,]+/),i=r.length;for(t=0;t<i;t++)r[t]&&("-"===(e=r[t].replace(/\*/g,".*?"))[0]?n.skips.push(new RegExp("^"+e.substr(1)+"$")):n.names.push(new RegExp("^"+e+"$")));for(t=0;t<n.instances.length;t++){const e=n.instances[t];e.enabled=n.enabled(e.namespace)}},n.enabled=function(e){if("*"===e[e.length-1])return!0;let t,r;for(t=0,r=n.skips.length;t<r;t++)if(n.skips[t].test(e))return!1;for(t=0,r=n.names.length;t<r;t++)if(n.names[t].test(e))return!0;return!1},n.humanize=e("ms"),Object.keys(t).forEach(e=>{n[e]=t[e]}),n.instances=[],n.names=[],n.skips=[],n.formatters={},n.selectColor=r,n.enable(n.load()),n}},{ms:16}],19:[function(e,t,r){(function(r,n){var i=e("readable-stream"),o=e("end-of-stream"),s=e("inherits"),a=e("stream-shift"),u=n.from&&n.from!==Uint8Array.from?n.from([0]):new n([0]),c=function(e,t){e._corked?e.once("uncork",t):t()},l=function(e,t){return function(r){r?function(e,t){e._autoDestroy&&e.destroy(t)}(e,"premature close"===r.message?null:r):t&&!e._ended&&e.end()}},f=function(e,t,r){if(!(this instanceof f))return new f(e,t,r);i.Duplex.call(this,r),this._writable=null,this._readable=null,this._readable2=null,this._autoDestroy=!r||!1!==r.autoDestroy,this._forwardDestroy=!r||!1!==r.destroy,this._forwardEnd=!r||!1!==r.end,this._corked=1,this._ondrain=null,this._drained=!1,this._forwarding=!1,this._unwrite=null,this._unread=null,this._ended=!1,this.destroyed=!1,e&&this.setWritable(e),t&&this.setReadable(t)};s(f,i.Duplex),f.obj=function(e,t,r){return r||(r={}),r.objectMode=!0,r.highWaterMark=16,new f(e,t,r)},f.prototype.cork=function(){1==++this._corked&&this.emit("cork")},f.prototype.uncork=function(){this._corked&&0==--this._corked&&this.emit("uncork")},f.prototype.setWritable=function(e){if(this._unwrite&&this._unwrite(),this.destroyed)e&&e.destroy&&e.destroy();else if(null!==e&&!1!==e){var t=this,n=o(e,{writable:!0,readable:!1},l(this,this._forwardEnd)),i=function(){var e=t._ondrain;t._ondrain=null,e&&e()};this._unwrite&&r.nextTick(i),this._writable=e,this._writable.on("drain",i),this._unwrite=function(){t._writable.removeListener("drain",i),n()},this.uncork()}else this.end()},f.prototype.setReadable=function(e){if(this._unread&&this._unread(),this.destroyed)e&&e.destroy&&e.destroy();else{if(null===e||!1===e)return this.push(null),void this.resume();var t,r=this,n=o(e,{writable:!1,readable:!0},l(this)),s=function(){r._forward()},a=function(){r.push(null)};this._drained=!0,this._readable=e,this._readable2=e._readableState?e:(t=e,new i.Readable({objectMode:!0,highWaterMark:16}).wrap(t)),this._readable2.on("readable",s),this._readable2.on("end",a),this._unread=function(){r._readable2.removeListener("readable",s),r._readable2.removeListener("end",a),n()},this._forward()}},f.prototype._read=function(){this._drained=!0,this._forward()},f.prototype._forward=function(){if(!this._forwarding&&this._readable2&&this._drained){var e;for(this._forwarding=!0;this._drained&&null!==(e=a(this._readable2));)this.destroyed||(this._drained=this.push(e));this._forwarding=!1}},f.prototype.destroy=function(e){if(!this.destroyed){this.destroyed=!0;var t=this;r.nextTick(function(){t._destroy(e)})}},f.prototype._destroy=function(e){if(e){var t=this._ondrain;this._ondrain=null,t?t(e):this.emit("error",e)}this._forwardDestroy&&(this._readable&&this._readable.destroy&&this._readable.destroy(),this._writable&&this._writable.destroy&&this._writable.destroy()),this.emit("close")},f.prototype._write=function(e,t,r){return this.destroyed?r():this._corked?c(this,this._write.bind(this,e,t,r)):e===u?this._finish(r):this._writable?void(!1===this._writable.write(e)?this._ondrain=r:r()):r()},f.prototype._finish=function(e){var t=this;this.emit("preend"),c(this,function(){var r,n;r=t._forwardEnd&&t._writable,n=function(){!1===t._writableState.prefinished&&(t._writableState.prefinished=!0),t.emit("prefinish"),c(t,e)},r?r._writableState&&r._writableState.finished?n():r._writableState?r.end(n):(r.end(),n()):n()})},f.prototype.end=function(e,t,r){return"function"==typeof e?this.end(null,null,e):"function"==typeof t?this.end(e,null,t):(this._ended=!0,e&&this.write(e),this._writableState.ending||this.write(u),i.Writable.prototype.end.call(this,r))},t.exports=f}).call(this,e("_process"),e("buffer").Buffer)},{_process:100,buffer:12,"end-of-stream":20,inherits:88,"readable-stream":116,"stream-shift":119}],20:[function(e,t,r){var n=e("once"),i=function(){},o=function(e,t,r){if("function"==typeof t)return o(e,null,t);t||(t={}),r=n(r||i);var s=e._writableState,a=e._readableState,u=t.readable||!1!==t.readable&&e.readable,c=t.writable||!1!==t.writable&&e.writable,l=function(){e.writable||f()},f=function(){c=!1,u||r.call(e)},p=function(){u=!1,c||r.call(e)},h=function(t){r.call(e,t?new Error("exited with error code: "+t):null)},d=function(t){r.call(e,t)},g=function(){return(!u||a&&a.ended)&&(!c||s&&s.ended)?void 0:r.call(e,new Error("premature close"))},b=function(){e.req.on("finish",f)};return!function(e){return e.setHeader&&"function"==typeof e.abort}(e)?c&&!s&&(e.on("end",l),e.on("close",l)):(e.on("complete",f),e.on("abort",g),e.req?b():e.on("request",b)),function(e){return e.stdio&&Array.isArray(e.stdio)&&3===e.stdio.length}(e)&&e.on("exit",h),e.on("end",p),e.on("finish",f),!1!==t.error&&e.on("error",d),e.on("close",g),function(){e.removeListener("complete",f),e.removeListener("abort",g),e.removeListener("request",b),e.req&&e.req.removeListener("finish",f),e.removeListener("end",l),e.removeListener("close",l),e.removeListener("finish",f),e.removeListener("exit",h),e.removeListener("end",p),e.removeListener("error",d),e.removeListener("close",g)}};t.exports=o},{once:98}],21:[function(e,t,r){"use strict";var n=e("../../object/valid-value");t.exports=function(){return n(this).length=0,this}},{"../../object/valid-value":56}],22:[function(e,t,r){"use strict";var n=e("../../number/is-nan"),i=e("../../number/to-pos-integer"),o=e("../../object/valid-value"),s=Array.prototype.indexOf,a=Object.prototype.hasOwnProperty,u=Math.abs,c=Math.floor;t.exports=function(e){var t,r,l,f;if(!n(e))return s.apply(this,arguments);for(r=i(o(this).length),l=arguments[1],t=l=isNaN(l)?0:l>=0?c(l):i(this.length)-c(u(l));t<r;++t)if(a.call(this,t)&&(f=this[t],n(f)))return t;return-1}},{"../../number/is-nan":32,"../../number/to-pos-integer":36,"../../object/valid-value":56}],23:[function(e,t,r){"use strict";t.exports=e("./is-implemented")()?Array.from:e("./shim")},{"./is-implemented":24,"./shim":25}],24:[function(e,t,r){"use strict";t.exports=function(){var e,t,r=Array.from;return"function"==typeof r&&(t=r(e=["raz","dwa"]),Boolean(t&&t!==e&&"dwa"===t[1]))}},{}],25:[function(e,t,r){"use strict";var n=e("es6-symbol").iterator,i=e("../../function/is-arguments"),o=e("../../function/is-function"),s=e("../../number/to-pos-integer"),a=e("../../object/valid-callable"),u=e("../../object/valid-value"),c=e("../../object/is-value"),l=e("../../string/is-string"),f=Array.isArray,p=Function.prototype.call,h={configurable:!0,enumerable:!0,writable:!0,value:null},d=Object.defineProperty;t.exports=function(e){var t,r,g,b,y,m,_,v,w,S,x=arguments[1],k=arguments[2];if(e=Object(u(e)),c(x)&&a(x),this&&this!==Array&&o(this))t=this;else{if(!x){if(i(e))return 1!==(y=e.length)?Array.apply(null,e):((b=new Array(1))[0]=e[0],b);if(f(e)){for(b=new Array(y=e.length),r=0;r<y;++r)b[r]=e[r];return b}}b=[]}if(!f(e))if(void 0!==(w=e[n])){for(_=a(w).call(e),t&&(b=new t),v=_.next(),r=0;!v.done;)S=x?p.call(x,k,v.value,r):v.value,t?(h.value=S,d(b,r,h)):b[r]=S,v=_.next(),++r;y=r}else if(l(e)){for(y=e.length,t&&(b=new t),r=0,g=0;r<y;++r)S=e[r],r+1<y&&(m=S.charCodeAt(0))>=55296&&m<=56319&&(S+=e[++r]),S=x?p.call(x,k,S,g):S,t?(h.value=S,d(b,g,h)):b[g]=S,++g;y=g}if(void 0===y)for(y=s(e.length),t&&(b=new t(y)),r=0;r<y;++r)S=x?p.call(x,k,e[r],r):e[r],t?(h.value=S,d(b,r,h)):b[r]=S;return t&&(h.value=null,b.length=y),b}},{"../../function/is-arguments":26,"../../function/is-function":27,"../../number/to-pos-integer":36,"../../object/is-value":45,"../../object/valid-callable":55,"../../object/valid-value":56,"../../string/is-string":60,"es6-symbol":74}],26:[function(e,t,r){"use strict";var n=Object.prototype.toString,i=n.call(function(){return arguments}());t.exports=function(e){return n.call(e)===i}},{}],27:[function(e,t,r){"use strict";var n=Object.prototype.toString,i=RegExp.prototype.test.bind(/^[object [A-Za-z0-9]*Function]$/);t.exports=function(e){return"function"==typeof e&&i(n.call(e))}},{}],28:[function(e,t,r){"use strict";t.exports=function(){}},{}],29:[function(e,t,r){"use strict";t.exports=e("./is-implemented")()?Math.sign:e("./shim")},{"./is-implemented":30,"./shim":31}],30:[function(e,t,r){"use strict";t.exports=function(){var e=Math.sign;return"function"==typeof e&&(1===e(10)&&-1===e(-20))}},{}],31:[function(e,t,r){"use strict";t.exports=function(e){return e=Number(e),isNaN(e)||0===e?e:e>0?1:-1}},{}],32:[function(e,t,r){"use strict";t.exports=e("./is-implemented")()?Number.isNaN:e("./shim")},{"./is-implemented":33,"./shim":34}],33:[function(e,t,r){"use strict";t.exports=function(){var e=Number.isNaN;return"function"==typeof e&&(!e({})&&e(NaN)&&!e(34))}},{}],34:[function(e,t,r){"use strict";t.exports=function(e){return e!=e}},{}],35:[function(e,t,r){"use strict";var n=e("../math/sign"),i=Math.abs,o=Math.floor;t.exports=function(e){return isNaN(e)?0:0!==(e=Number(e))&&isFinite(e)?n(e)*o(i(e)):e}},{"../math/sign":29}],36:[function(e,t,r){"use strict";var n=e("./to-integer"),i=Math.max;t.exports=function(e){return i(0,n(e))}},{"./to-integer":35}],37:[function(e,t,r){"use strict";var n=e("./valid-callable"),i=e("./valid-value"),o=Function.prototype.bind,s=Function.prototype.call,a=Object.keys,u=Object.prototype.propertyIsEnumerable;t.exports=function(e,t){return function(r,c){var l,f=arguments[2],p=arguments[3];return r=Object(i(r)),n(c),l=a(r),p&&l.sort("function"==typeof p?o.call(p,r):void 0),"function"!=typeof e&&(e=l[e]),s.call(e,l,function(e,n){return u.call(r,e)?s.call(c,f,r[e],e,r,n):t})}}},{"./valid-callable":55,"./valid-value":56}],38:[function(e,t,r){"use strict";t.exports=e("./is-implemented")()?Object.assign:e("./shim")},{"./is-implemented":39,"./shim":40}],39:[function(e,t,r){"use strict";t.exports=function(){var e,t=Object.assign;return"function"==typeof t&&(t(e={foo:"raz"},{bar:"dwa"},{trzy:"trzy"}),e.foo+e.bar+e.trzy==="razdwatrzy")}},{}],40:[function(e,t,r){"use strict";var n=e("../keys"),i=e("../valid-value"),o=Math.max;t.exports=function(e,t){var r,s,a,u=o(arguments.length,2);for(e=Object(i(e)),a=function(n){try{e[n]=t[n]}catch(e){r||(r=e)}},s=1;s<u;++s)t=arguments[s],n(t).forEach(a);if(void 0!==r)throw r;return e}},{"../keys":46,"../valid-value":56}],41:[function(e,t,r){"use strict";var n=e("../array/from"),i=e("./assign"),o=e("./valid-value");t.exports=function(e){var t=Object(o(e)),r=arguments[1],s=Object(arguments[2]);if(t!==e&&!r)return t;var a={};return r?n(r,function(t){(s.ensure||t in e)&&(a[t]=e[t])}):i(a,e),a}},{"../array/from":23,"./assign":38,"./valid-value":56}],42:[function(e,t,r){"use strict";var n,i,o,s,a=Object.create;e("./set-prototype-of/is-implemented")()||(n=e("./set-prototype-of/shim")),t.exports=n?1!==n.level?a:(i={},o={},s={configurable:!1,enumerable:!1,writable:!0,value:void 0},Object.getOwnPropertyNames(Object.prototype).forEach(function(e){o[e]="__proto__"!==e?s:{configurable:!0,enumerable:!1,writable:!0,value:void 0}}),Object.defineProperties(i,o),Object.defineProperty(n,"nullPolyfill",{configurable:!1,enumerable:!1,writable:!1,value:i}),function(e,t){return a(null===e?i:e,t)}):a},{"./set-prototype-of/is-implemented":53,"./set-prototype-of/shim":54}],43:[function(e,t,r){"use strict";t.exports=e("./_iterate")("forEach")},{"./_iterate":37}],44:[function(e,t,r){"use strict";var n=e("./is-value"),i={function:!0,object:!0};t.exports=function(e){return n(e)&&i[typeof e]||!1}},{"./is-value":45}],45:[function(e,t,r){"use strict";var n=e("../function/noop")();t.exports=function(e){return e!==n&&null!==e}},{"../function/noop":28}],46:[function(e,t,r){"use strict";t.exports=e("./is-implemented")()?Object.keys:e("./shim")},{"./is-implemented":47,"./shim":48}],47:[function(e,t,r){"use strict";t.exports=function(){try{return Object.keys("primitive"),!0}catch(e){return!1}}},{}],48:[function(e,t,r){"use strict";var n=e("../is-value"),i=Object.keys;t.exports=function(e){return i(n(e)?Object(e):e)}},{"../is-value":45}],49:[function(e,t,r){"use strict";var n=e("./valid-callable"),i=e("./for-each"),o=Function.prototype.call;t.exports=function(e,t){var r={},s=arguments[2];return n(t),i(e,function(e,n,i,a){r[n]=o.call(t,s,e,n,i,a)}),r}},{"./for-each":43,"./valid-callable":55}],50:[function(e,t,r){"use strict";var n=e("./is-value"),i=Array.prototype.forEach,o=Object.create;t.exports=function(e){var t=o(null);return i.call(arguments,function(e){n(e)&&function(e,t){var r;for(r in e)t[r]=e[r]}(Object(e),t)}),t}},{"./is-value":45}],51:[function(e,t,r){"use strict";var n=Array.prototype.forEach,i=Object.create;t.exports=function(e){var t=i(null);return n.call(arguments,function(e){t[e]=!0}),t}},{}],52:[function(e,t,r){"use strict";t.exports=e("./is-implemented")()?Object.setPrototypeOf:e("./shim")},{"./is-implemented":53,"./shim":54}],53:[function(e,t,r){"use strict";var n=Object.create,i=Object.getPrototypeOf,o={};t.exports=function(){var e=Object.setPrototypeOf,t=arguments[0]||n;return"function"==typeof e&&i(e(t(null),o))===o}},{}],54:[function(e,t,r){"use strict";var n,i,o,s,a=e("../is-object"),u=e("../valid-value"),c=Object.prototype.isPrototypeOf,l=Object.defineProperty,f={configurable:!0,enumerable:!1,writable:!0,value:void 0};n=function(e,t){if(u(e),null===t||a(t))return e;throw new TypeError("Prototype must be null or an object")},t.exports=(i=function(){var e,t=Object.create(null),r={},n=Object.getOwnPropertyDescriptor(Object.prototype,"__proto__");if(n){try{(e=n.set).call(t,r)}catch(e){}if(Object.getPrototypeOf(t)===r)return{set:e,level:2}}return t.__proto__=r,Object.getPrototypeOf(t)===r?{level:2}:((t={}).__proto__=r,Object.getPrototypeOf(t)===r&&{level:1})}())?(2===i.level?i.set?(s=i.set,o=function(e,t){return s.call(n(e,t),t),e}):o=function(e,t){return n(e,t).__proto__=t,e}:o=function e(t,r){var i;return n(t,r),(i=c.call(e.nullPolyfill,t))&&delete e.nullPolyfill.__proto__,null===r&&(r=e.nullPolyfill),t.__proto__=r,i&&l(e.nullPolyfill,"__proto__",f),t},Object.defineProperty(o,"level",{configurable:!1,enumerable:!1,writable:!1,value:i.level})):null,e("../create")},{"../create":42,"../is-object":44,"../valid-value":56}],55:[function(e,t,r){"use strict";t.exports=function(e){if("function"!=typeof e)throw new TypeError(e+" is not a function");return e}},{}],56:[function(e,t,r){"use strict";var n=e("./is-value");t.exports=function(e){if(!n(e))throw new TypeError("Cannot use null or undefined");return e}},{"./is-value":45}],57:[function(e,t,r){"use strict";t.exports=e("./is-implemented")()?String.prototype.contains:e("./shim")},{"./is-implemented":58,"./shim":59}],58:[function(e,t,r){"use strict";var n="razdwatrzy";t.exports=function(){return"function"==typeof n.contains&&(!0===n.contains("dwa")&&!1===n.contains("foo"))}},{}],59:[function(e,t,r){"use strict";var n=String.prototype.indexOf;t.exports=function(e){return n.call(this,e,arguments[1])>-1}},{}],60:[function(e,t,r){"use strict";var n=Object.prototype.toString,i=n.call("");t.exports=function(e){return"string"==typeof e||e&&"object"==typeof e&&(e instanceof String||n.call(e)===i)||!1}},{}],61:[function(e,t,r){"use strict";var n,i=e("es5-ext/object/set-prototype-of"),o=e("es5-ext/string/#/contains"),s=e("d"),a=e("es6-symbol"),u=e("./"),c=Object.defineProperty;n=t.exports=function(e,t){if(!(this instanceof n))throw new TypeError("Constructor requires 'new'");u.call(this,e),t=t?o.call(t,"key+value")?"key+value":o.call(t,"key")?"key":"value":"value",c(this,"__kind__",s("",t))},i&&i(n,u),delete n.prototype.constructor,n.prototype=Object.create(u.prototype,{_resolve:s(function(e){return"value"===this.__kind__?this.__list__[e]:"key+value"===this.__kind__?[e,this.__list__[e]]:e})}),c(n.prototype,a.toStringTag,s("c","Array Iterator"))},{"./":64,d:15,"es5-ext/object/set-prototype-of":52,"es5-ext/string/#/contains":57,"es6-symbol":74}],62:[function(e,t,r){"use strict";var n=e("es5-ext/function/is-arguments"),i=e("es5-ext/object/valid-callable"),o=e("es5-ext/string/is-string"),s=e("./get"),a=Array.isArray,u=Function.prototype.call,c=Array.prototype.some;t.exports=function(e,t){var r,l,f,p,h,d,g,b,y=arguments[2];if(a(e)||n(e)?r="array":o(e)?r="string":e=s(e),i(t),f=function(){p=!0},"array"!==r)if("string"!==r)for(l=e.next();!l.done;){if(u.call(t,y,l.value,f),p)return;l=e.next()}else for(d=e.length,h=0;h<d&&(g=e[h],h+1<d&&(b=g.charCodeAt(0))>=55296&&b<=56319&&(g+=e[++h]),u.call(t,y,g,f),!p);++h);else c.call(e,function(e){return u.call(t,y,e,f),p})}},{"./get":63,"es5-ext/function/is-arguments":26,"es5-ext/object/valid-callable":55,"es5-ext/string/is-string":60}],63:[function(e,t,r){"use strict";var n=e("es5-ext/function/is-arguments"),i=e("es5-ext/string/is-string"),o=e("./array"),s=e("./string"),a=e("./valid-iterable"),u=e("es6-symbol").iterator;t.exports=function(e){return"function"==typeof a(e)[u]?e[u]():n(e)?new o(e):i(e)?new s(e):new o(e)}},{"./array":61,"./string":66,"./valid-iterable":67,"es5-ext/function/is-arguments":26,"es5-ext/string/is-string":60,"es6-symbol":74}],64:[function(e,t,r){"use strict";var n,i=e("es5-ext/array/#/clear"),o=e("es5-ext/object/assign"),s=e("es5-ext/object/valid-callable"),a=e("es5-ext/object/valid-value"),u=e("d"),c=e("d/auto-bind"),l=e("es6-symbol"),f=Object.defineProperty,p=Object.defineProperties;t.exports=n=function(e,t){if(!(this instanceof n))throw new TypeError("Constructor requires 'new'");p(this,{__list__:u("w",a(e)),__context__:u("w",t),__nextIndex__:u("w",0)}),t&&(s(t.on),t.on("_add",this._onAdd),t.on("_delete",this._onDelete),t.on("_clear",this._onClear))},delete n.prototype.constructor,p(n.prototype,o({_next:u(function(){var e;if(this.__list__)return this.__redo__&&void 0!==(e=this.__redo__.shift())?e:this.__nextIndex__<this.__list__.length?this.__nextIndex__++:void this._unBind()}),next:u(function(){return this._createResult(this._next())}),_createResult:u(function(e){return void 0===e?{done:!0,value:void 0}:{done:!1,value:this._resolve(e)}}),_resolve:u(function(e){return this.__list__[e]}),_unBind:u(function(){this.__list__=null,delete this.__redo__,this.__context__&&(this.__context__.off("_add",this._onAdd),this.__context__.off("_delete",this._onDelete),this.__context__.off("_clear",this._onClear),this.__context__=null)}),toString:u(function(){return"[object "+(this[l.toStringTag]||"Object")+"]"})},c({_onAdd:u(function(e){e>=this.__nextIndex__||(++this.__nextIndex__,this.__redo__?(this.__redo__.forEach(function(t,r){t>=e&&(this.__redo__[r]=++t)},this),this.__redo__.push(e)):f(this,"__redo__",u("c",[e])))}),_onDelete:u(function(e){var t;e>=this.__nextIndex__||(--this.__nextIndex__,this.__redo__&&(-1!==(t=this.__redo__.indexOf(e))&&this.__redo__.splice(t,1),this.__redo__.forEach(function(t,r){t>e&&(this.__redo__[r]=--t)},this)))}),_onClear:u(function(){this.__redo__&&i.call(this.__redo__),this.__nextIndex__=0})}))),f(n.prototype,l.iterator,u(function(){return this}))},{d:15,"d/auto-bind":14,"es5-ext/array/#/clear":21,"es5-ext/object/assign":38,"es5-ext/object/valid-callable":55,"es5-ext/object/valid-value":56,"es6-symbol":74}],65:[function(e,t,r){"use strict";var n=e("es5-ext/function/is-arguments"),i=e("es5-ext/object/is-value"),o=e("es5-ext/string/is-string"),s=e("es6-symbol").iterator,a=Array.isArray;t.exports=function(e){return!!i(e)&&(!!a(e)||(!!o(e)||(!!n(e)||"function"==typeof e[s])))}},{"es5-ext/function/is-arguments":26,"es5-ext/object/is-value":45,"es5-ext/string/is-string":60,"es6-symbol":74}],66:[function(e,t,r){"use strict";var n,i=e("es5-ext/object/set-prototype-of"),o=e("d"),s=e("es6-symbol"),a=e("./"),u=Object.defineProperty;n=t.exports=function(e){if(!(this instanceof n))throw new TypeError("Constructor requires 'new'");e=String(e),a.call(this,e),u(this,"__length__",o("",e.length))},i&&i(n,a),delete n.prototype.constructor,n.prototype=Object.create(a.prototype,{_next:o(function(){if(this.__list__)return this.__nextIndex__<this.__length__?this.__nextIndex__++:void this._unBind()}),_resolve:o(function(e){var t,r=this.__list__[e];return this.__nextIndex__===this.__length__?r:(t=r.charCodeAt(0))>=55296&&t<=56319?r+this.__list__[this.__nextIndex__++]:r})}),u(n.prototype,s.toStringTag,o("c","String Iterator"))},{"./":64,d:15,"es5-ext/object/set-prototype-of":52,"es6-symbol":74}],67:[function(e,t,r){"use strict";var n=e("./is-iterable");t.exports=function(e){if(!n(e))throw new TypeError(e+" is not iterable");return e}},{"./is-iterable":65}],68:[function(e,t,r){"use strict";t.exports=e("./is-implemented")()?Map:e("./polyfill")},{"./is-implemented":69,"./polyfill":73}],69:[function(e,t,r){"use strict";t.exports=function(){var e,t;if("function"!=typeof Map)return!1;try{e=new Map([["raz","one"],["dwa","two"],["trzy","three"]])}catch(e){return!1}return"[object Map]"===String(e)&&(3===e.size&&("function"==typeof e.clear&&("function"==typeof e.delete&&("function"==typeof e.entries&&("function"==typeof e.forEach&&("function"==typeof e.get&&("function"==typeof e.has&&("function"==typeof e.keys&&("function"==typeof e.set&&("function"==typeof e.values&&(!1===(t=e.entries().next()).done&&(!!t.value&&("raz"===t.value[0]&&"one"===t.value[1])))))))))))))}},{}],70:[function(e,t,r){"use strict";t.exports="undefined"!=typeof Map&&"[object Map]"===Object.prototype.toString.call(new Map)},{}],71:[function(e,t,r){"use strict";t.exports=e("es5-ext/object/primitive-set")("key","value","key+value")},{"es5-ext/object/primitive-set":51}],72:[function(e,t,r){"use strict";var n,i=e("es5-ext/object/set-prototype-of"),o=e("d"),s=e("es6-iterator"),a=e("es6-symbol").toStringTag,u=e("./iterator-kinds"),c=Object.defineProperties,l=s.prototype._unBind;n=t.exports=function(e,t){if(!(this instanceof n))return new n(e,t);s.call(this,e.__mapKeysData__,e),t&&u[t]||(t="key+value"),c(this,{__kind__:o("",t),__values__:o("w",e.__mapValuesData__)})},i&&i(n,s),n.prototype=Object.create(s.prototype,{constructor:o(n),_resolve:o(function(e){return"value"===this.__kind__?this.__values__[e]:"key"===this.__kind__?this.__list__[e]:[this.__list__[e],this.__values__[e]]}),_unBind:o(function(){this.__values__=null,l.call(this)}),toString:o(function(){return"[object Map Iterator]"})}),Object.defineProperty(n.prototype,a,o("c","Map Iterator"))},{"./iterator-kinds":71,d:15,"es5-ext/object/set-prototype-of":52,"es6-iterator":64,"es6-symbol":74}],73:[function(e,t,r){"use strict";var n,i=e("es5-ext/array/#/clear"),o=e("es5-ext/array/#/e-index-of"),s=e("es5-ext/object/set-prototype-of"),a=e("es5-ext/object/valid-callable"),u=e("es5-ext/object/valid-value"),c=e("d"),l=e("event-emitter"),f=e("es6-symbol"),p=e("es6-iterator/valid-iterable"),h=e("es6-iterator/for-of"),d=e("./lib/iterator"),g=e("./is-native-implemented"),b=Function.prototype.call,y=Object.defineProperties,m=Object.getPrototypeOf;t.exports=n=function(){var e,t,r,i=arguments[0];if(!(this instanceof n))throw new TypeError("Constructor requires 'new'");return r=g&&s&&Map!==n?s(new Map,m(this)):this,null!=i&&p(i),y(r,{__mapKeysData__:c("c",e=[]),__mapValuesData__:c("c",t=[])}),i?(h(i,function(r){var n=u(r)[0];r=r[1],-1===o.call(e,n)&&(e.push(n),t.push(r))},r),r):r},g&&(s&&s(n,Map),n.prototype=Object.create(Map.prototype,{constructor:c(n)})),l(y(n.prototype,{clear:c(function(){this.__mapKeysData__.length&&(i.call(this.__mapKeysData__),i.call(this.__mapValuesData__),this.emit("_clear"))}),delete:c(function(e){var t=o.call(this.__mapKeysData__,e);return-1!==t&&(this.__mapKeysData__.splice(t,1),this.__mapValuesData__.splice(t,1),this.emit("_delete",t,e),!0)}),entries:c(function(){return new d(this,"key+value")}),forEach:c(function(e){var t,r,n=arguments[1];for(a(e),r=(t=this.entries())._next();void 0!==r;)b.call(e,n,this.__mapValuesData__[r],this.__mapKeysData__[r],this),r=t._next()}),get:c(function(e){var t=o.call(this.__mapKeysData__,e);if(-1!==t)return this.__mapValuesData__[t]}),has:c(function(e){return-1!==o.call(this.__mapKeysData__,e)}),keys:c(function(){return new d(this,"key")}),set:c(function(e,t){var r,n=o.call(this.__mapKeysData__,e);return-1===n&&(n=this.__mapKeysData__.push(e)-1,r=!0),this.__mapValuesData__[n]=t,r&&this.emit("_add",n,e),this}),size:c.gs(function(){return this.__mapKeysData__.length}),values:c(function(){return new d(this,"value")}),toString:c(function(){return"[object Map]"})})),Object.defineProperty(n.prototype,f.iterator,c(function(){return this.entries()})),Object.defineProperty(n.prototype,f.toStringTag,c("c","Map"))},{"./is-native-implemented":70,"./lib/iterator":72,d:15,"es5-ext/array/#/clear":21,"es5-ext/array/#/e-index-of":22,"es5-ext/object/set-prototype-of":52,"es5-ext/object/valid-callable":55,"es5-ext/object/valid-value":56,"es6-iterator/for-of":62,"es6-iterator/valid-iterable":67,"es6-symbol":74,"event-emitter":82}],74:[function(e,t,r){"use strict";t.exports=e("./is-implemented")()?e("ext/global-this").Symbol:e("./polyfill")},{"./is-implemented":75,"./polyfill":80,"ext/global-this":85}],75:[function(e,t,r){"use strict";var n=e("ext/global-this"),i={object:!0,symbol:!0};t.exports=function(){var e,t=n.Symbol;if("function"!=typeof t)return!1;e=t("test symbol");try{String(e)}catch(e){return!1}return!!i[typeof t.iterator]&&(!!i[typeof t.toPrimitive]&&!!i[typeof t.toStringTag])}},{"ext/global-this":85}],76:[function(e,t,r){"use strict";t.exports=function(e){return!!e&&("symbol"==typeof e||!!e.constructor&&("Symbol"===e.constructor.name&&"Symbol"===e[e.constructor.toStringTag]))}},{}],77:[function(e,t,r){"use strict";var n=e("d"),i=Object.create,o=Object.defineProperty,s=Object.prototype,a=i(null);t.exports=function(e){for(var t,r,i=0;a[e+(i||"")];)++i;return a[e+=i||""]=!0,o(s,t="@@"+e,n.gs(null,function(e){r||(r=!0,o(this,t,n(e)),r=!1)})),t}},{d:15}],78:[function(e,t,r){"use strict";var n=e("d"),i=e("ext/global-this").Symbol;t.exports=function(e){return Object.defineProperties(e,{hasInstance:n("",i&&i.hasInstance||e("hasInstance")),isConcatSpreadable:n("",i&&i.isConcatSpreadable||e("isConcatSpreadable")),iterator:n("",i&&i.iterator||e("iterator")),match:n("",i&&i.match||e("match")),replace:n("",i&&i.replace||e("replace")),search:n("",i&&i.search||e("search")),species:n("",i&&i.species||e("species")),split:n("",i&&i.split||e("split")),toPrimitive:n("",i&&i.toPrimitive||e("toPrimitive")),toStringTag:n("",i&&i.toStringTag||e("toStringTag")),unscopables:n("",i&&i.unscopables||e("unscopables"))})}},{d:15,"ext/global-this":85}],79:[function(e,t,r){"use strict";var n=e("d"),i=e("../../../validate-symbol"),o=Object.create(null);t.exports=function(e){return Object.defineProperties(e,{for:n(function(t){return o[t]?o[t]:o[t]=e(String(t))}),keyFor:n(function(e){var t;for(t in i(e),o)if(o[t]===e)return t})})}},{"../../../validate-symbol":81,d:15}],80:[function(e,t,r){"use strict";var n,i,o,s=e("d"),a=e("./validate-symbol"),u=e("ext/global-this").Symbol,c=e("./lib/private/generate-name"),l=e("./lib/private/setup/standard-symbols"),f=e("./lib/private/setup/symbol-registry"),p=Object.create,h=Object.defineProperties,d=Object.defineProperty;if("function"==typeof u)try{String(u()),o=!0}catch(e){}else u=null;i=function(e){if(this instanceof i)throw new TypeError("Symbol is not a constructor");return n(e)},t.exports=n=function e(t){var r;if(this instanceof e)throw new TypeError("Symbol is not a constructor");return o?u(t):(r=p(i.prototype),t=void 0===t?"":String(t),h(r,{__description__:s("",t),__name__:s("",c(t))}))},l(n),f(n),h(i.prototype,{constructor:s(n),toString:s("",function(){return this.__name__})}),h(n.prototype,{toString:s(function(){return"Symbol ("+a(this).__description__+")"}),valueOf:s(function(){return a(this)})}),d(n.prototype,n.toPrimitive,s("",function(){var e=a(this);return"symbol"==typeof e?e:e.toString()})),d(n.prototype,n.toStringTag,s("c","Symbol")),d(i.prototype,n.toStringTag,s("c",n.prototype[n.toStringTag])),d(i.prototype,n.toPrimitive,s("c",n.prototype[n.toPrimitive]))},{"./lib/private/generate-name":77,"./lib/private/setup/standard-symbols":78,"./lib/private/setup/symbol-registry":79,"./validate-symbol":81,d:15,"ext/global-this":85}],81:[function(e,t,r){"use strict";var n=e("./is-symbol");t.exports=function(e){if(!n(e))throw new TypeError(e+" is not a symbol");return e}},{"./is-symbol":76}],82:[function(e,t,r){"use strict";var n,i,o,s,a,u,c,l=e("d"),f=e("es5-ext/object/valid-callable"),p=Function.prototype.apply,h=Function.prototype.call,d=Object.create,g=Object.defineProperty,b=Object.defineProperties,y=Object.prototype.hasOwnProperty,m={configurable:!0,enumerable:!1,writable:!0};a={on:n=function(e,t){var r;return f(t),y.call(this,"__ee__")?r=this.__ee__:(r=m.value=d(null),g(this,"__ee__",m),m.value=null),r[e]?"object"==typeof r[e]?r[e].push(t):r[e]=[r[e],t]:r[e]=t,this},once:i=function(e,t){var r,i;return f(t),i=this,n.call(this,e,r=function(){o.call(i,e,r),p.call(t,this,arguments)}),r.__eeOnceListener__=t,this},off:o=function(e,t){var r,n,i,o;if(f(t),!y.call(this,"__ee__"))return this;if(!(r=this.__ee__)[e])return this;if("object"==typeof(n=r[e]))for(o=0;i=n[o];++o)i!==t&&i.__eeOnceListener__!==t||(2===n.length?r[e]=n[o?0:1]:n.splice(o,1));else n!==t&&n.__eeOnceListener__!==t||delete r[e];return this},emit:s=function(e){var t,r,n,i,o;if(y.call(this,"__ee__")&&(i=this.__ee__[e]))if("object"==typeof i){for(r=arguments.length,o=new Array(r-1),t=1;t<r;++t)o[t-1]=arguments[t];for(i=i.slice(),t=0;n=i[t];++t)p.call(n,this,o)}else switch(arguments.length){case 1:h.call(i,this);break;case 2:h.call(i,this,arguments[1]);break;case 3:h.call(i,this,arguments[1],arguments[2]);break;default:for(r=arguments.length,o=new Array(r-1),t=1;t<r;++t)o[t-1]=arguments[t];p.call(i,this,o)}}},u={on:l(n),once:l(i),off:l(o),emit:l(s)},c=b({},u),t.exports=r=function(e){return null==e?d(c):b(Object(e),u)},r.methods=a},{d:15,"es5-ext/object/valid-callable":55}],83:[function(e,t,r){var n=Object.create||function(e){var t=function(){};return t.prototype=e,new t},i=Object.keys||function(e){var t=[];for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.push(r);return r},o=Function.prototype.bind||function(e){var t=this;return function(){return t.apply(e,arguments)}};function s(){this._events&&Object.prototype.hasOwnProperty.call(this,"_events")||(this._events=n(null),this._eventsCount=0),this._maxListeners=this._maxListeners||void 0}t.exports=s,s.EventEmitter=s,s.prototype._events=void 0,s.prototype._maxListeners=void 0;var a,u=10;try{var c={};Object.defineProperty&&Object.defineProperty(c,"x",{value:0}),a=0===c.x}catch(e){a=!1}function l(e){return void 0===e._maxListeners?s.defaultMaxListeners:e._maxListeners}function f(e,t,r,i){var o,s,a;if("function"!=typeof r)throw new TypeError('"listener" argument must be a function');if((s=e._events)?(s.newListener&&(e.emit("newListener",t,r.listener?r.listener:r),s=e._events),a=s[t]):(s=e._events=n(null),e._eventsCount=0),a){if("function"==typeof a?a=s[t]=i?[r,a]:[a,r]:i?a.unshift(r):a.push(r),!a.warned&&(o=l(e))&&o>0&&a.length>o){a.warned=!0;var u=new Error("Possible EventEmitter memory leak detected. "+a.length+' "'+String(t)+'" listeners added. Use emitter.setMaxListeners() to increase limit.');u.name="MaxListenersExceededWarning",u.emitter=e,u.type=t,u.count=a.length,"object"==typeof console&&console.warn&&console.warn("%s: %s",u.name,u.message)}}else a=s[t]=r,++e._eventsCount;return e}function p(){if(!this.fired)switch(this.target.removeListener(this.type,this.wrapFn),this.fired=!0,arguments.length){case 0:return this.listener.call(this.target);case 1:return this.listener.call(this.target,arguments[0]);case 2:return this.listener.call(this.target,arguments[0],arguments[1]);case 3:return this.listener.call(this.target,arguments[0],arguments[1],arguments[2]);default:for(var e=new Array(arguments.length),t=0;t<e.length;++t)e[t]=arguments[t];this.listener.apply(this.target,e)}}function h(e,t,r){var n={fired:!1,wrapFn:void 0,target:e,type:t,listener:r},i=o.call(p,n);return i.listener=r,n.wrapFn=i,i}function d(e,t,r){var n=e._events;if(!n)return[];var i=n[t];return i?"function"==typeof i?r?[i.listener||i]:[i]:r?function(e){for(var t=new Array(e.length),r=0;r<t.length;++r)t[r]=e[r].listener||e[r];return t}(i):b(i,i.length):[]}function g(e){var t=this._events;if(t){var r=t[e];if("function"==typeof r)return 1;if(r)return r.length}return 0}function b(e,t){for(var r=new Array(t),n=0;n<t;++n)r[n]=e[n];return r}a?Object.defineProperty(s,"defaultMaxListeners",{enumerable:!0,get:function(){return u},set:function(e){if("number"!=typeof e||e<0||e!=e)throw new TypeError('"defaultMaxListeners" must be a positive number');u=e}}):s.defaultMaxListeners=u,s.prototype.setMaxListeners=function(e){if("number"!=typeof e||e<0||isNaN(e))throw new TypeError('"n" argument must be a positive number');return this._maxListeners=e,this},s.prototype.getMaxListeners=function(){return l(this)},s.prototype.emit=function(e){var t,r,n,i,o,s,a="error"===e;if(s=this._events)a=a&&null==s.error;else if(!a)return!1;if(a){if(arguments.length>1&&(t=arguments[1]),t instanceof Error)throw t;var u=new Error('Unhandled "error" event. ('+t+")");throw u.context=t,u}if(!(r=s[e]))return!1;var c="function"==typeof r;switch(n=arguments.length){case 1:!function(e,t,r){if(t)e.call(r);else for(var n=e.length,i=b(e,n),o=0;o<n;++o)i[o].call(r)}(r,c,this);break;case 2:!function(e,t,r,n){if(t)e.call(r,n);else for(var i=e.length,o=b(e,i),s=0;s<i;++s)o[s].call(r,n)}(r,c,this,arguments[1]);break;case 3:!function(e,t,r,n,i){if(t)e.call(r,n,i);else for(var o=e.length,s=b(e,o),a=0;a<o;++a)s[a].call(r,n,i)}(r,c,this,arguments[1],arguments[2]);break;case 4:!function(e,t,r,n,i,o){if(t)e.call(r,n,i,o);else for(var s=e.length,a=b(e,s),u=0;u<s;++u)a[u].call(r,n,i,o)}(r,c,this,arguments[1],arguments[2],arguments[3]);break;default:for(i=new Array(n-1),o=1;o<n;o++)i[o-1]=arguments[o];!function(e,t,r,n){if(t)e.apply(r,n);else for(var i=e.length,o=b(e,i),s=0;s<i;++s)o[s].apply(r,n)}(r,c,this,i)}return!0},s.prototype.addListener=function(e,t){return f(this,e,t,!1)},s.prototype.on=s.prototype.addListener,s.prototype.prependListener=function(e,t){return f(this,e,t,!0)},s.prototype.once=function(e,t){if("function"!=typeof t)throw new TypeError('"listener" argument must be a function');return this.on(e,h(this,e,t)),this},s.prototype.prependOnceListener=function(e,t){if("function"!=typeof t)throw new TypeError('"listener" argument must be a function');return this.prependListener(e,h(this,e,t)),this},s.prototype.removeListener=function(e,t){var r,i,o,s,a;if("function"!=typeof t)throw new TypeError('"listener" argument must be a function');if(!(i=this._events))return this;if(!(r=i[e]))return this;if(r===t||r.listener===t)0==--this._eventsCount?this._events=n(null):(delete i[e],i.removeListener&&this.emit("removeListener",e,r.listener||t));else if("function"!=typeof r){for(o=-1,s=r.length-1;s>=0;s--)if(r[s]===t||r[s].listener===t){a=r[s].listener,o=s;break}if(o<0)return this;0===o?r.shift():function(e,t){for(var r=t,n=r+1,i=e.length;n<i;r+=1,n+=1)e[r]=e[n];e.pop()}(r,o),1===r.length&&(i[e]=r[0]),i.removeListener&&this.emit("removeListener",e,a||t)}return this},s.prototype.removeAllListeners=function(e){var t,r,o;if(!(r=this._events))return this;if(!r.removeListener)return 0===arguments.length?(this._events=n(null),this._eventsCount=0):r[e]&&(0==--this._eventsCount?this._events=n(null):delete r[e]),this;if(0===arguments.length){var s,a=i(r);for(o=0;o<a.length;++o)"removeListener"!==(s=a[o])&&this.removeAllListeners(s);return this.removeAllListeners("removeListener"),this._events=n(null),this._eventsCount=0,this}if("function"==typeof(t=r[e]))this.removeListener(e,t);else if(t)for(o=t.length-1;o>=0;o--)this.removeListener(e,t[o]);return this},s.prototype.listeners=function(e){return d(this,e,!0)},s.prototype.rawListeners=function(e){return d(this,e,!1)},s.listenerCount=function(e,t){return"function"==typeof e.listenerCount?e.listenerCount(t):g.call(e,t)},s.prototype.listenerCount=g,s.prototype.eventNames=function(){return this._eventsCount>0?Reflect.ownKeys(this._events):[]}},{}],84:[function(e,t,r){var n=function(){if("object"==typeof self&&self)return self;if("object"==typeof window&&window)return window;throw new Error("Unable to resolve global `this`")};t.exports=function(){if(this)return this;try{Object.defineProperty(Object.prototype,"__global__",{get:function(){return this},configurable:!0})}catch(e){return n()}try{return __global__||n()}finally{delete Object.prototype.__global__}}()},{}],85:[function(e,t,r){"use strict";t.exports=e("./is-implemented")()?globalThis:e("./implementation")},{"./implementation":84,"./is-implemented":86}],86:[function(e,t,r){"use strict";t.exports=function(){return"object"==typeof globalThis&&(!!globalThis&&globalThis.Array===Array)}},{}],87:[function(e,t,r){r.read=function(e,t,r,n,i){var o,s,a=8*i-n-1,u=(1<<a)-1,c=u>>1,l=-7,f=r?i-1:0,p=r?-1:1,h=e[t+f];for(f+=p,o=h&(1<<-l)-1,h>>=-l,l+=a;l>0;o=256*o+e[t+f],f+=p,l-=8);for(s=o&(1<<-l)-1,o>>=-l,l+=n;l>0;s=256*s+e[t+f],f+=p,l-=8);if(0===o)o=1-c;else{if(o===u)return s?NaN:1/0*(h?-1:1);s+=Math.pow(2,n),o-=c}return(h?-1:1)*s*Math.pow(2,o-n)},r.write=function(e,t,r,n,i,o){var s,a,u,c=8*o-i-1,l=(1<<c)-1,f=l>>1,p=23===i?Math.pow(2,-24)-Math.pow(2,-77):0,h=n?0:o-1,d=n?1:-1,g=t<0||0===t&&1/t<0?1:0;for(t=Math.abs(t),isNaN(t)||t===1/0?(a=isNaN(t)?1:0,s=l):(s=Math.floor(Math.log(t)/Math.LN2),t*(u=Math.pow(2,-s))<1&&(s--,u*=2),(t+=s+f>=1?p/u:p*Math.pow(2,1-f))*u>=2&&(s++,u/=2),s+f>=l?(a=0,s=l):s+f>=1?(a=(t*u-1)*Math.pow(2,i),s+=f):(a=t*Math.pow(2,f-1)*Math.pow(2,i),s=0));i>=8;e[r+h]=255&a,h+=d,a/=256,i-=8);for(s=s<<i|a,c+=i;c>0;e[r+h]=255&s,h+=d,s/=256,c-=8);e[r+h-d]|=128*g}},{}],88:[function(e,t,r){"function"==typeof Object.create?t.exports=function(e,t){e.super_=t,e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}})}:t.exports=function(e,t){e.super_=t;var r=function(){};r.prototype=t.prototype,e.prototype=new r,e.prototype.constructor=e}},{}],89:[function(e,t,r){function n(e){return!!e.constructor&&"function"==typeof e.constructor.isBuffer&&e.constructor.isBuffer(e)}t.exports=function(e){return null!=e&&(n(e)||function(e){return"function"==typeof e.readFloatLE&&"function"==typeof e.slice&&n(e.slice(0,0))}(e)||!!e._isBuffer)}},{}],90:[function(e,t,r){"use strict";var n=e("safe-buffer").Buffer,i=t.exports;for(var o in i.types={0:"reserved",1:"connect",2:"connack",3:"publish",4:"puback",5:"pubrec",6:"pubrel",7:"pubcomp",8:"subscribe",9:"suback",10:"unsubscribe",11:"unsuback",12:"pingreq",13:"pingresp",14:"disconnect",15:"auth"},i.codes={},i.types){var s=i.types[o];i.codes[s]=o}for(var a in i.CMD_SHIFT=4,i.CMD_MASK=240,i.DUP_MASK=8,i.QOS_MASK=3,i.QOS_SHIFT=1,i.RETAIN_MASK=1,i.LENGTH_MASK=127,i.LENGTH_FIN_MASK=128,i.SESSIONPRESENT_MASK=1,i.SESSIONPRESENT_HEADER=n.from([i.SESSIONPRESENT_MASK]),i.CONNACK_HEADER=n.from([i.codes.connack<<i.CMD_SHIFT]),i.USERNAME_MASK=128,i.PASSWORD_MASK=64,i.WILL_RETAIN_MASK=32,i.WILL_QOS_MASK=24,i.WILL_QOS_SHIFT=3,i.WILL_FLAG_MASK=4,i.CLEAN_SESSION_MASK=2,i.CONNECT_HEADER=n.from([i.codes.connect<<i.CMD_SHIFT]),i.properties={sessionExpiryInterval:17,willDelayInterval:24,receiveMaximum:33,maximumPacketSize:39,topicAliasMaximum:34,requestResponseInformation:25,requestProblemInformation:23,userProperties:38,authenticationMethod:21,authenticationData:22,payloadFormatIndicator:1,messageExpiryInterval:2,contentType:3,responseTopic:8,correlationData:9,maximumQoS:36,retainAvailable:37,assignedClientIdentifier:18,reasonString:31,wildcardSubscriptionAvailable:40,subscriptionIdentifiersAvailable:41,sharedSubscriptionAvailable:42,serverKeepAlive:19,responseInformation:26,serverReference:28,topicAlias:35,subscriptionIdentifier:11},i.propertiesCodes={},i.properties){var u=i.properties[a];i.propertiesCodes[u]=a}function c(e){return[0,1,2].map(function(t){return[0,1].map(function(r){return[0,1].map(function(o){var s=new n(1);return s.writeUInt8(i.codes[e]<<i.CMD_SHIFT|(r?i.DUP_MASK:0)|t<<i.QOS_SHIFT|o,0,!0),s})})})}i.propertiesTypes={sessionExpiryInterval:"int32",willDelayInterval:"int32",receiveMaximum:"int16",maximumPacketSize:"int32",topicAliasMaximum:"int16",requestResponseInformation:"byte",requestProblemInformation:"byte",userProperties:"pair",authenticationMethod:"string",authenticationData:"binary",payloadFormatIndicator:"byte",messageExpiryInterval:"int32",contentType:"string",responseTopic:"string",correlationData:"binary",maximumQoS:"int8",retainAvailable:"byte",assignedClientIdentifier:"string",reasonString:"string",wildcardSubscriptionAvailable:"byte",subscriptionIdentifiersAvailable:"byte",sharedSubscriptionAvailable:"byte",serverKeepAlive:"int32",responseInformation:"string",serverReference:"string",topicAlias:"int16",subscriptionIdentifier:"var"},i.PUBLISH_HEADER=c("publish"),i.SUBSCRIBE_HEADER=c("subscribe"),i.SUBSCRIBE_OPTIONS_QOS_MASK=3,i.SUBSCRIBE_OPTIONS_NL_MASK=1,i.SUBSCRIBE_OPTIONS_NL_SHIFT=2,i.SUBSCRIBE_OPTIONS_RAP_MASK=1,i.SUBSCRIBE_OPTIONS_RAP_SHIFT=3,i.SUBSCRIBE_OPTIONS_RH_MASK=3,i.SUBSCRIBE_OPTIONS_RH_SHIFT=4,i.SUBSCRIBE_OPTIONS_RH=[0,16,32],i.SUBSCRIBE_OPTIONS_NL=4,i.SUBSCRIBE_OPTIONS_RAP=8,i.SUBSCRIBE_OPTIONS_QOS=[0,1,2],i.UNSUBSCRIBE_HEADER=c("unsubscribe"),i.ACKS={unsuback:c("unsuback"),puback:c("puback"),pubcomp:c("pubcomp"),pubrel:c("pubrel"),pubrec:c("pubrec")},i.SUBACK_HEADER=n.from([i.codes.suback<<i.CMD_SHIFT]),i.VERSION3=n.from([3]),i.VERSION4=n.from([4]),i.VERSION5=n.from([5]),i.QOS=[0,1,2].map(function(e){return n.from([e])}),i.EMPTY={pingreq:n.from([i.codes.pingreq<<4,0]),pingresp:n.from([i.codes.pingresp<<4,0]),disconnect:n.from([i.codes.disconnect<<4,0])}},{"safe-buffer":118}],91:[function(e,t,r){"use strict";var n=e("safe-buffer").Buffer,i=e("./writeToStream"),o=e("events").EventEmitter;function s(){this._array=new Array(20),this._i=0}e("inherits")(s,o),s.prototype.write=function(e){return this._array[this._i++]=e,!0},s.prototype.concat=function(){var e,t,r=0,i=new Array(this._array.length),o=this._array,s=0;for(e=0;e<o.length&&void 0!==o[e];e++)"string"!=typeof o[e]?i[e]=o[e].length:i[e]=n.byteLength(o[e]),r+=i[e];for(t=n.allocUnsafe(r),e=0;e<o.length&&void 0!==o[e];e++)"string"!=typeof o[e]?(o[e].copy(t,s),s+=i[e]):(t.write(o[e],s),s+=i[e]);return t},t.exports=function(e,t){var r=new s;return i(e,r,t),r.concat()}},{"./writeToStream":97,events:83,inherits:88,"safe-buffer":118}],92:[function(e,t,r){"use strict";r.parser=e("./parser"),r.generate=e("./generate"),r.writeToStream=e("./writeToStream")},{"./generate":91,"./parser":96,"./writeToStream":97}],93:[function(e,t,r){var n=e("readable-stream/duplex"),i=e("util"),o=e("safe-buffer").Buffer;function s(e){if(!(this instanceof s))return new s(e);if(this._bufs=[],this.length=0,"function"==typeof e){this._callback=e;var t=function(e){this._callback&&(this._callback(e),this._callback=null)}.bind(this);this.on("pipe",function(e){e.on("error",t)}),this.on("unpipe",function(e){e.removeListener("error",t)})}else this.append(e);n.call(this)}i.inherits(s,n),s.prototype._offset=function(e){var t,r=0,n=0;if(0===e)return[0,0];for(;n<this._bufs.length;n++){if(e<(t=r+this._bufs[n].length)||n==this._bufs.length-1)return[n,e-r];r=t}},s.prototype.append=function(e){var t=0;if(o.isBuffer(e))this._appendBuffer(e);else if(Array.isArray(e))for(;t<e.length;t++)this.append(e[t]);else if(e instanceof s)for(;t<e._bufs.length;t++)this.append(e._bufs[t]);else null!=e&&("number"==typeof e&&(e=e.toString()),this._appendBuffer(o.from(e)));return this},s.prototype._appendBuffer=function(e){this._bufs.push(e),this.length+=e.length},s.prototype._write=function(e,t,r){this._appendBuffer(e),"function"==typeof r&&r()},s.prototype._read=function(e){if(!this.length)return this.push(null);e=Math.min(e,this.length),this.push(this.slice(0,e)),this.consume(e)},s.prototype.end=function(e){n.prototype.end.call(this,e),this._callback&&(this._callback(null,this.slice()),this._callback=null)},s.prototype.get=function(e){return this.slice(e,e+1)[0]},s.prototype.slice=function(e,t){return"number"==typeof e&&e<0&&(e+=this.length),"number"==typeof t&&t<0&&(t+=this.length),this.copy(null,0,e,t)},s.prototype.copy=function(e,t,r,n){if(("number"!=typeof r||r<0)&&(r=0),("number"!=typeof n||n>this.length)&&(n=this.length),r>=this.length)return e||o.alloc(0);if(n<=0)return e||o.alloc(0);var i,s,a=!!e,u=this._offset(r),c=n-r,l=c,f=a&&t||0,p=u[1];if(0===r&&n==this.length){if(!a)return 1===this._bufs.length?this._bufs[0]:o.concat(this._bufs,this.length);for(s=0;s<this._bufs.length;s++)this._bufs[s].copy(e,f),f+=this._bufs[s].length;return e}if(l<=this._bufs[u[0]].length-p)return a?this._bufs[u[0]].copy(e,t,p,p+l):this._bufs[u[0]].slice(p,p+l);for(a||(e=o.allocUnsafe(c)),s=u[0];s<this._bufs.length;s++){if(!(l>(i=this._bufs[s].length-p))){this._bufs[s].copy(e,f,p,p+l);break}this._bufs[s].copy(e,f,p),f+=i,l-=i,p&&(p=0)}return e},s.prototype.shallowSlice=function(e,t){e=e||0,t=t||this.length,e<0&&(e+=this.length),t<0&&(t+=this.length);var r=this._offset(e),n=this._offset(t),i=this._bufs.slice(r[0],n[0]+1);return 0==n[1]?i.pop():i[i.length-1]=i[i.length-1].slice(0,n[1]),0!=r[1]&&(i[0]=i[0].slice(r[1])),new s(i)},s.prototype.toString=function(e,t,r){return this.slice(t,r).toString(e)},s.prototype.consume=function(e){for(;this._bufs.length;){if(!(e>=this._bufs[0].length)){this._bufs[0]=this._bufs[0].slice(e),this.length-=e;break}e-=this._bufs[0].length,this.length-=this._bufs[0].length,this._bufs.shift()}return this},s.prototype.duplicate=function(){for(var e=0,t=new s;e<this._bufs.length;e++)t.append(this._bufs[e]);return t},s.prototype.destroy=function(){this._bufs.length=0,this.length=0,this.push(null)},function(){var e={readDoubleBE:8,readDoubleLE:8,readFloatBE:4,readFloatLE:4,readInt32BE:4,readInt32LE:4,readUInt32BE:4,readUInt32LE:4,readInt16BE:2,readInt16LE:2,readUInt16BE:2,readUInt16LE:2,readInt8:1,readUInt8:1};for(var t in e)!function(t){s.prototype[t]=function(r){return this.slice(r,r+e[t])[t](0)}}(t)}(),t.exports=s},{"readable-stream/duplex":105,"safe-buffer":118,util:136}],94:[function(e,t,r){"use strict";var n=e("safe-buffer").Buffer,i=65536,o={};function s(e){var t=n.allocUnsafe(2);return t.writeUInt8(e>>8,0),t.writeUInt8(255&e,1),t}t.exports={cache:o,generateCache:function(){for(var e=0;e<i;e++)o[e]=s(e)},generateNumber:s,genBufVariableByteInt:function(e){var t=0,r=0,i=function(e){return e>=0&&e<128?1:e>=128&&e<16384?2:e>=16384&&e<2097152?3:e>=2097152&&e<268435456?4:0}(e),o=n.allocUnsafe(i);do{t=e%128|0,(e=e/128|0)>0&&(t|=128),o.writeUInt8(t,r++)}while(e>0);return{data:o,length:i}},generate4ByteBuffer:function(e){var t=n.allocUnsafe(4);return t.writeUInt32BE(e,0),t}}},{"safe-buffer":118}],95:[function(e,t,r){t.exports=function(){this.cmd=null,this.retain=!1,this.qos=0,this.dup=!1,this.length=-1,this.topic=null,this.payload=null}},{}],96:[function(e,t,r){"use strict";var n=e("bl"),i=e("inherits"),o=e("events").EventEmitter,s=e("./packet"),a=e("./constants");function u(e){if(!(this instanceof u))return new u(e);this.settings=e||{},this._states=["_parseHeader","_parseLength","_parsePayload","_newPacket"],this._resetState()}i(u,o),u.prototype._resetState=function(){this.packet=new s,this.error=null,this._list=n(),this._stateCounter=0},u.prototype.parse=function(e){for(this.error&&this._resetState(),this._list.append(e);(-1!==this.packet.length||this._list.length>0)&&this[this._states[this._stateCounter]]()&&!this.error;)this._stateCounter++,this._stateCounter>=this._states.length&&(this._stateCounter=0);return this._list.length},u.prototype._parseHeader=function(){var e=this._list.readUInt8(0);return this.packet.cmd=a.types[e>>a.CMD_SHIFT],this.packet.retain=0!=(e&a.RETAIN_MASK),this.packet.qos=e>>a.QOS_SHIFT&a.QOS_MASK,this.packet.dup=0!=(e&a.DUP_MASK),this._list.consume(1),!0},u.prototype._parseLength=function(){var e=this._parseVarByteNum(!0);return e&&(this.packet.length=e.value,this._list.consume(e.bytes)),!!e},u.prototype._parsePayload=function(){var e=!1;if(0===this.packet.length||this._list.length>=this.packet.length){switch(this._pos=0,this.packet.cmd){case"connect":this._parseConnect();break;case"connack":this._parseConnack();break;case"publish":this._parsePublish();break;case"puback":case"pubrec":case"pubrel":case"pubcomp":this._parseConfirmation();break;case"subscribe":this._parseSubscribe();break;case"suback":this._parseSuback();break;case"unsubscribe":this._parseUnsubscribe();break;case"unsuback":this._parseUnsuback();break;case"pingreq":case"pingresp":break;case"disconnect":this._parseDisconnect();break;case"auth":this._parseAuth();break;default:this._emitError(new Error("Not supported"))}e=!0}return e},u.prototype._parseConnect=function(){var e,t,r,n,i,o,s={},u=this.packet;if(null===(e=this._parseString()))return this._emitError(new Error("Cannot parse protocolId"));if("MQTT"!==e&&"MQIsdp"!==e)return this._emitError(new Error("Invalid protocolId"));if(u.protocolId=e,this._pos>=this._list.length)return this._emitError(new Error("Packet too short"));if(u.protocolVersion=this._list.readUInt8(this._pos),3!==u.protocolVersion&&4!==u.protocolVersion&&5!==u.protocolVersion)return this._emitError(new Error("Invalid protocol version"));if(this._pos++,this._pos>=this._list.length)return this._emitError(new Error("Packet too short"));if(s.username=this._list.readUInt8(this._pos)&a.USERNAME_MASK,s.password=this._list.readUInt8(this._pos)&a.PASSWORD_MASK,s.will=this._list.readUInt8(this._pos)&a.WILL_FLAG_MASK,s.will&&(u.will={},u.will.retain=0!=(this._list.readUInt8(this._pos)&a.WILL_RETAIN_MASK),u.will.qos=(this._list.readUInt8(this._pos)&a.WILL_QOS_MASK)>>a.WILL_QOS_SHIFT),u.clean=0!=(this._list.readUInt8(this._pos)&a.CLEAN_SESSION_MASK),this._pos++,u.keepalive=this._parseNum(),-1===u.keepalive)return this._emitError(new Error("Packet too short"));if(5===u.protocolVersion){var c=this._parseProperties();Object.getOwnPropertyNames(c).length&&(u.properties=c)}if(null===(t=this._parseString()))return this._emitError(new Error("Packet too short"));if(u.clientId=t,s.will){if(5===u.protocolVersion){var l=this._parseProperties();Object.getOwnPropertyNames(l).length&&(u.will.properties=l)}if(null===(r=this._parseString()))return this._emitError(new Error("Cannot parse will topic"));if(u.will.topic=r,null===(n=this._parseBuffer()))return this._emitError(new Error("Cannot parse will payload"));u.will.payload=n}if(s.username){if(null===(o=this._parseString()))return this._emitError(new Error("Cannot parse username"));u.username=o}if(s.password){if(null===(i=this._parseBuffer()))return this._emitError(new Error("Cannot parse password"));u.password=i}return this.settings=u,u},u.prototype._parseConnack=function(){var e=this.packet;if(this._list.length<2)return null;if(e.sessionPresent=!!(this._list.readUInt8(this._pos++)&a.SESSIONPRESENT_MASK),5===this.settings.protocolVersion?e.reasonCode=this._list.readUInt8(this._pos++):e.returnCode=this._list.readUInt8(this._pos++),-1===e.returnCode||-1===e.reasonCode)return this._emitError(new Error("Cannot parse return code"));if(5===this.settings.protocolVersion){var t=this._parseProperties();Object.getOwnPropertyNames(t).length&&(e.properties=t)}},u.prototype._parsePublish=function(){var e=this.packet;if(e.topic=this._parseString(),null===e.topic)return this._emitError(new Error("Cannot parse topic"));if(!(e.qos>0)||this._parseMessageId()){if(5===this.settings.protocolVersion){var t=this._parseProperties();Object.getOwnPropertyNames(t).length&&(e.properties=t)}e.payload=this._list.slice(this._pos,e.length)}},u.prototype._parseSubscribe=function(){var e,t,r,n,i,o,s,u=this.packet;if(1!==u.qos)return this._emitError(new Error("Wrong subscribe header"));if(u.subscriptions=[],this._parseMessageId()){if(5===this.settings.protocolVersion){var c=this._parseProperties();Object.getOwnPropertyNames(c).length&&(u.properties=c)}for(;this._pos<u.length;){if(null===(e=this._parseString()))return this._emitError(new Error("Cannot parse topic"));r=(t=this._parseByte())&a.SUBSCRIBE_OPTIONS_QOS_MASK,o=0!=(t>>a.SUBSCRIBE_OPTIONS_NL_SHIFT&a.SUBSCRIBE_OPTIONS_NL_MASK),i=0!=(t>>a.SUBSCRIBE_OPTIONS_RAP_SHIFT&a.SUBSCRIBE_OPTIONS_RAP_MASK),n=t>>a.SUBSCRIBE_OPTIONS_RH_SHIFT&a.SUBSCRIBE_OPTIONS_RH_MASK,s={topic:e,qos:r},5===this.settings.protocolVersion&&(s.nl=o,s.rap=i,s.rh=n),u.subscriptions.push(s)}}},u.prototype._parseSuback=function(){var e=this.packet;if(this.packet.granted=[],this._parseMessageId()){if(5===this.settings.protocolVersion){var t=this._parseProperties();Object.getOwnPropertyNames(t).length&&(e.properties=t)}for(;this._pos<this.packet.length;)this.packet.granted.push(this._list.readUInt8(this._pos++))}},u.prototype._parseUnsubscribe=function(){var e=this.packet;if(e.unsubscriptions=[],this._parseMessageId()){if(5===this.settings.protocolVersion){var t=this._parseProperties();Object.getOwnPropertyNames(t).length&&(e.properties=t)}for(;this._pos<e.length;){var r;if(null===(r=this._parseString()))return this._emitError(new Error("Cannot parse topic"));e.unsubscriptions.push(r)}}},u.prototype._parseUnsuback=function(){var e=this.packet;if(!this._parseMessageId())return this._emitError(new Error("Cannot parse messageId"));if(5===this.settings.protocolVersion){var t=this._parseProperties();for(Object.getOwnPropertyNames(t).length&&(e.properties=t),e.granted=[];this._pos<this.packet.length;)this.packet.granted.push(this._list.readUInt8(this._pos++))}},u.prototype._parseConfirmation=function(){var e=this.packet;if(this._parseMessageId(),5===this.settings.protocolVersion&&e.length>2){e.reasonCode=this._parseByte();var t=this._parseProperties();Object.getOwnPropertyNames(t).length&&(e.properties=t)}return!0},u.prototype._parseDisconnect=function(){var e=this.packet;if(5===this.settings.protocolVersion){e.reasonCode=this._parseByte();var t=this._parseProperties();Object.getOwnPropertyNames(t).length&&(e.properties=t)}return!0},u.prototype._parseAuth=function(){var e=this.packet;if(5!==this.settings.protocolVersion)return this._emitError(new Error("Not supported auth packet for this version MQTT"));e.reasonCode=this._parseByte();var t=this._parseProperties();return Object.getOwnPropertyNames(t).length&&(e.properties=t),!0},u.prototype._parseMessageId=function(){var e=this.packet;return e.messageId=this._parseNum(),null!==e.messageId||(this._emitError(new Error("Cannot parse messageId")),!1)},u.prototype._parseString=function(e){var t,r=this._parseNum(),n=r+this._pos;return-1===r||n>this._list.length||n>this.packet.length?null:(t=this._list.toString("utf8",this._pos,n),this._pos+=r,t)},u.prototype._parseStringPair=function(){return{name:this._parseString(),value:this._parseString()}},u.prototype._parseBuffer=function(){var e,t=this._parseNum(),r=t+this._pos;return-1===t||r>this._list.length||r>this.packet.length?null:(e=this._list.slice(this._pos,r),this._pos+=t,e)},u.prototype._parseNum=function(){if(this._list.length-this._pos<2)return-1;var e=this._list.readUInt16BE(this._pos);return this._pos+=2,e},u.prototype._parse4ByteNum=function(){if(this._list.length-this._pos<4)return-1;var e=this._list.readUInt32BE(this._pos);return this._pos+=4,e},u.prototype._parseVarByteNum=function(e){for(var t,r=0,n=1,i=0,o=!0,s=this._pos?this._pos:0;r<5&&(i+=n*((t=this._list.readUInt8(s+r++))&a.LENGTH_MASK),n*=128,0!=(t&a.LENGTH_FIN_MASK));)if(this._list.length<=r){o=!1;break}return s&&(this._pos+=r),o=!!o&&(e?{bytes:r,value:i}:i)},u.prototype._parseByte=function(){var e=this._list.readUInt8(this._pos);return this._pos++,e},u.prototype._parseByType=function(e){switch(e){case"byte":return 0!==this._parseByte();case"int8":return this._parseByte();case"int16":return this._parseNum();case"int32":return this._parse4ByteNum();case"var":return this._parseVarByteNum();case"string":return this._parseString();case"pair":return this._parseStringPair();case"binary":return this._parseBuffer()}},u.prototype._parseProperties=function(){for(var e=this._parseVarByteNum(),t=this._pos+e,r={};this._pos<t;){var n=this._parseByte(),i=a.propertiesCodes[n];if(!i)return this._emitError(new Error("Unknown property")),!1;if("userProperties"!==i)r[i]=this._parseByType(a.propertiesTypes[i]);else{r[i]||(r[i]={});var o=this._parseByType(a.propertiesTypes[i]);r[i][o.name]=o.value}}return r},u.prototype._newPacket=function(){return this.packet&&(this._list.consume(this.packet.length),this.emit("packet",this.packet)),this.packet=new s,this._pos=0,!0},u.prototype._emitError=function(e){this.error=e,this.emit("error",e)},t.exports=u},{"./constants":90,"./packet":95,bl:93,events:83,inherits:88}],97:[function(e,t,r){"use strict";var n=e("./constants"),i=e("safe-buffer").Buffer,o=i.allocUnsafe(0),s=i.from([0]),a=e("./numbers"),u=e("process-nextick-args").nextTick,c=a.cache,l=a.generateNumber,f=a.generateCache,p=a.genBufVariableByteInt,h=a.generate4ByteBuffer,d=S,g=!0;function b(e,t,r){switch(t.cork&&(t.cork(),u(y,t)),g&&(g=!1,f()),e.cmd){case"connect":return function(e,t,r){var o=e||{},s=o.protocolId||"MQTT",a=o.protocolVersion||4,u=o.will,c=o.clean,l=o.keepalive||0,f=o.clientId||"",p=o.username,h=o.password,g=o.properties;void 0===c&&(c=!0);var b=0;if(!s||"string"!=typeof s&&!i.isBuffer(s))return t.emit("error",new Error("Invalid protocolId")),!1;b+=s.length+2;if(3!==a&&4!==a&&5!==a)return t.emit("error",new Error("Invalid protocol version")),!1;b+=1;if("string"!=typeof f&&!i.isBuffer(f)||!f&&4!==a||!f&&!c){if(a<4)return t.emit("error",new Error("clientId must be supplied before 3.1.1")),!1;if(1*c==0)return t.emit("error",new Error("clientId must be given if cleanSession set to 0")),!1}else b+=f.length+2;if("number"!=typeof l||l<0||l>65535||l%1!=0)return t.emit("error",new Error("Invalid keepalive")),!1;b+=2;if(b+=1,5===a){var y=I(t,g);b+=y.length}if(u){if("object"!=typeof u)return t.emit("error",new Error("Invalid will")),!1;if(!u.topic||"string"!=typeof u.topic)return t.emit("error",new Error("Invalid will topic")),!1;if(b+=i.byteLength(u.topic)+2,u.payload){if(!(u.payload.length>=0))return t.emit("error",new Error("Invalid will payload")),!1;"string"==typeof u.payload?b+=i.byteLength(u.payload)+2:b+=u.payload.length+2;var m={};5===a&&(m=I(t,u.properties),b+=m.length)}}var w=!1;if(null!=p){if(!T(p))return t.emit("error",new Error("Invalid username")),!1;w=!0,b+=i.byteLength(p)+2}if(null!=h){if(!w)return t.emit("error",new Error("Username is required to use password")),!1;if(!T(h))return t.emit("error",new Error("Invalid password")),!1;b+=j(h)+2}t.write(n.CONNECT_HEADER),_(t,b),E(t,s),t.write(4===a?n.VERSION4:5===a?n.VERSION5:n.VERSION3);var S=0;S|=null!=p?n.USERNAME_MASK:0,S|=null!=h?n.PASSWORD_MASK:0,S|=u&&u.retain?n.WILL_RETAIN_MASK:0,S|=u&&u.qos?u.qos<<n.WILL_QOS_SHIFT:0,S|=u?n.WILL_FLAG_MASK:0,S|=c?n.CLEAN_SESSION_MASK:0,t.write(i.from([S])),d(t,l),5===a&&y.write();E(t,f),u&&(5===a&&m.write(),v(t,u.topic),E(t,u.payload));null!=p&&E(t,p);null!=h&&E(t,h);return!0}(e,t);case"connack":return function(e,t,r){var o=r?r.protocolVersion:4,a=e||{},u=5===o?a.reasonCode:a.returnCode,c=a.properties,l=2;if("number"!=typeof u)return t.emit("error",new Error("Invalid return code")),!1;var f=null;5===o&&(f=I(t,c),l+=f.length);t.write(n.CONNACK_HEADER),_(t,l),t.write(a.sessionPresent?n.SESSIONPRESENT_HEADER:s),t.write(i.from([u])),null!=f&&f.write();return!0}(e,t,r);case"publish":return function(e,t,r){var s=r?r.protocolVersion:4,a=e||{},u=a.qos||0,c=a.retain?n.RETAIN_MASK:0,l=a.topic,f=a.payload||o,p=a.messageId,h=a.properties,g=0;if("string"==typeof l)g+=i.byteLength(l)+2;else{if(!i.isBuffer(l))return t.emit("error",new Error("Invalid topic")),!1;g+=l.length+2}i.isBuffer(f)?g+=f.length:g+=i.byteLength(f);if(u&&"number"!=typeof p)return t.emit("error",new Error("Invalid messageId")),!1;u&&(g+=2);var b=null;5===s&&(b=I(t,h),g+=b.length);t.write(n.PUBLISH_HEADER[u][a.dup?1:0][c?1:0]),_(t,g),d(t,j(l)),t.write(l),u>0&&d(t,p);null!=b&&b.write();return t.write(f)}(e,t,r);case"puback":case"pubrec":case"pubrel":case"pubcomp":return function(e,t,r){var o=r?r.protocolVersion:4,s=e||{},a=s.cmd||"puback",u=s.messageId,c=s.dup&&"pubrel"===a?n.DUP_MASK:0,l=0,f=s.reasonCode,p=s.properties,h=5===o?3:2;"pubrel"===a&&(l=1);if("number"!=typeof u)return t.emit("error",new Error("Invalid messageId")),!1;var g=null;if(5===o){if(!(g=C(t,p,r,h)))return!1;h+=g.length}t.write(n.ACKS[a][l][c][0]),_(t,h),d(t,u),5===o&&t.write(i.from([f]));null!==g&&g.write();return!0}(e,t,r);case"subscribe":return function(e,t,r){var o=r?r.protocolVersion:4,s=e||{},a=s.dup?n.DUP_MASK:0,u=s.messageId,c=s.subscriptions,l=s.properties,f=0;if("number"!=typeof u)return t.emit("error",new Error("Invalid messageId")),!1;f+=2;var p=null;5===o&&(p=I(t,l),f+=p.length);if("object"!=typeof c||!c.length)return t.emit("error",new Error("Invalid subscriptions")),!1;for(var h=0;h<c.length;h+=1){var g=c[h].topic,b=c[h].qos;if("string"!=typeof g)return t.emit("error",new Error("Invalid subscriptions - invalid topic")),!1;if("number"!=typeof b)return t.emit("error",new Error("Invalid subscriptions - invalid qos")),!1;if(5===o){var y=c[h].nl||!1;if("boolean"!=typeof y)return t.emit("error",new Error("Invalid subscriptions - invalid No Local")),!1;var m=c[h].rap||!1;if("boolean"!=typeof m)return t.emit("error",new Error("Invalid subscriptions - invalid Retain as Published")),!1;var w=c[h].rh||0;if("number"!=typeof w||w>2)return t.emit("error",new Error("Invalid subscriptions - invalid Retain Handling")),!1}f+=i.byteLength(g)+2+1}t.write(n.SUBSCRIBE_HEADER[1][a?1:0][0]),_(t,f),d(t,u),null!==p&&p.write();for(var S=!0,x=0;x<c.length;x++){var k,E=c[x],C=E.topic,O=E.qos,j=+E.nl,T=+E.rap,A=E.rh;v(t,C),k=n.SUBSCRIBE_OPTIONS_QOS[O],5===o&&(k|=j?n.SUBSCRIBE_OPTIONS_NL:0,k|=T?n.SUBSCRIBE_OPTIONS_RAP:0,k|=A?n.SUBSCRIBE_OPTIONS_RH[A]:0),S=t.write(i.from([k]))}return S}(e,t,r);case"suback":return function(e,t,r){var o=r?r.protocolVersion:4,s=e||{},a=s.messageId,u=s.granted,c=s.properties,l=0;if("number"!=typeof a)return t.emit("error",new Error("Invalid messageId")),!1;l+=2;if("object"!=typeof u||!u.length)return t.emit("error",new Error("Invalid qos vector")),!1;for(var f=0;f<u.length;f+=1){if("number"!=typeof u[f])return t.emit("error",new Error("Invalid qos vector")),!1;l+=1}var p=null;if(5===o){if(!(p=C(t,c,r,l)))return!1;l+=p.length}t.write(n.SUBACK_HEADER),_(t,l),d(t,a),null!==p&&p.write();return t.write(i.from(u))}(e,t,r);case"unsubscribe":return function(e,t,r){var o=r?r.protocolVersion:4,s=e||{},a=s.messageId,u=s.dup?n.DUP_MASK:0,c=s.unsubscriptions,l=s.properties,f=0;if("number"!=typeof a)return t.emit("error",new Error("Invalid messageId")),!1;f+=2;if("object"!=typeof c||!c.length)return t.emit("error",new Error("Invalid unsubscriptions")),!1;for(var p=0;p<c.length;p+=1){if("string"!=typeof c[p])return t.emit("error",new Error("Invalid unsubscriptions")),!1;f+=i.byteLength(c[p])+2}var h=null;5===o&&(h=I(t,l),f+=h.length);t.write(n.UNSUBSCRIBE_HEADER[1][u?1:0][0]),_(t,f),d(t,a),null!==h&&h.write();for(var g=!0,b=0;b<c.length;b++)g=v(t,c[b]);return g}(e,t,r);case"unsuback":return function(e,t,r){var o=r?r.protocolVersion:4,s=e||{},a=s.messageId,u=s.dup?n.DUP_MASK:0,c=s.granted,l=s.properties,f=s.cmd,p=2;if("number"!=typeof a)return t.emit("error",new Error("Invalid messageId")),!1;if(5===o){if("object"!=typeof c||!c.length)return t.emit("error",new Error("Invalid qos vector")),!1;for(var h=0;h<c.length;h+=1){if("number"!=typeof c[h])return t.emit("error",new Error("Invalid qos vector")),!1;p+=1}}var g=null;if(5===o){if(!(g=C(t,l,r,p)))return!1;p+=g.length}t.write(n.ACKS[f][0][u][0]),_(t,p),d(t,a),null!==g&&g.write();5===o&&t.write(i.from(c));return!0}(e,t,r);case"pingreq":case"pingresp":return function(e,t,r){return t.write(n.EMPTY[e.cmd])}(e,t);case"disconnect":return function(e,t,r){var o=r?r.protocolVersion:4,s=e||{},a=s.reasonCode,u=s.properties,c=5===o?1:0,l=null;if(5===o){if(!(l=C(t,u,r,c)))return!1;c+=l.length}t.write(i.from([n.codes.disconnect<<4])),_(t,c),5===o&&t.write(i.from([a]));null!==l&&l.write();return!0}(e,t,r);case"auth":return function(e,t,r){var o=r?r.protocolVersion:4,s=e||{},a=s.reasonCode,u=s.properties,c=5===o?1:0;5!==o&&t.emit("error",new Error("Invalid mqtt version for auth packet"));var l=C(t,u,r,c);if(!l)return!1;c+=l.length,t.write(i.from([n.codes.auth<<4])),_(t,c),t.write(i.from([a])),null!==l&&l.write();return!0}(e,t,r);default:return t.emit("error",new Error("Unknown command")),!1}}function y(e){e.uncork()}Object.defineProperty(b,"cacheNumbers",{get:function(){return d===S},set:function(e){e?(c&&0!==Object.keys(c).length||(g=!0),d=S):(g=!1,d=x)}});var m={};function _(e,t){var r=m[t];r||(r=p(t).data,t<16384&&(m[t]=r)),e.write(r)}function v(e,t){var r=i.byteLength(t);d(e,r),e.write(t,"utf8")}function w(e,t,r){v(e,t),v(e,r)}function S(e,t){return e.write(c[t])}function x(e,t){return e.write(l(t))}function k(e,t){return e.write(h(t))}function E(e,t){"string"==typeof t?v(e,t):t?(d(e,t.length),e.write(t)):d(e,0)}function I(e,t){if("object"!=typeof t||null!=t.length)return{length:1,write:function(){O(e,{},0)}};var r=0;function o(r){var o=n.propertiesTypes[r],s=t[r],a=0;switch(o){case"byte":if("boolean"!=typeof s)return e.emit("error",new Error("Invalid "+r)),!1;a+=2;break;case"int8":if("number"!=typeof s)return e.emit("error",new Error("Invalid "+r)),!1;a+=2;break;case"binary":if(s&&null===s)return e.emit("error",new Error("Invalid "+r)),!1;a+=1+i.byteLength(s)+2;break;case"int16":if("number"!=typeof s)return e.emit("error",new Error("Invalid "+r)),!1;a+=3;break;case"int32":if("number"!=typeof s)return e.emit("error",new Error("Invalid "+r)),!1;a+=5;break;case"var":if("number"!=typeof s)return e.emit("error",new Error("Invalid "+r)),!1;a+=1+p(s).length;break;case"string":if("string"!=typeof s)return e.emit("error",new Error("Invalid "+r)),!1;a+=3+i.byteLength(s.toString());break;case"pair":if("object"!=typeof s)return e.emit("error",new Error("Invalid "+r)),!1;a+=Object.getOwnPropertyNames(s).reduce(function(e,t){return e+=3+i.byteLength(t.toString())+2+i.byteLength(s[t].toString())},0);break;default:return e.emit("error",new Error("Invalid property "+r)),!1}return a}if(t)for(var s in t){var a=o(s);if(!a)return!1;r+=a}return{length:p(r).length+r,write:function(){O(e,t,r)}}}function C(e,t,r,n){var i=["reasonString","userProperties"],o=r&&r.properties&&r.properties.maximumPacketSize?r.properties.maximumPacketSize:0,s=I(e,t);if(o)for(;n+s.length>o;){var a=i.shift();if(!a||!t[a])return!1;delete t[a],s=I(e,t)}return s}function O(e,t,r){for(var o in _(e,r),t)if(t.hasOwnProperty(o)&&null!==t[o]){var s=t[o];switch(n.propertiesTypes[o]){case"byte":e.write(i.from([n.properties[o]])),e.write(i.from([+s]));break;case"int8":e.write(i.from([n.properties[o]])),e.write(i.from([s]));break;case"binary":e.write(i.from([n.properties[o]])),E(e,s);break;case"int16":e.write(i.from([n.properties[o]])),d(e,s);break;case"int32":e.write(i.from([n.properties[o]])),k(e,s);break;case"var":e.write(i.from([n.properties[o]])),_(e,s);break;case"string":e.write(i.from([n.properties[o]])),v(e,s);break;case"pair":Object.getOwnPropertyNames(s).forEach(function(t){e.write(i.from([n.properties[o]])),w(e,t.toString(),s[t].toString())});break;default:return e.emit("error",new Error("Invalid property "+o)),!1}}}function j(e){return e?e instanceof i?e.length:i.byteLength(e):0}function T(e){return"string"==typeof e||e instanceof i}t.exports=b},{"./constants":90,"./numbers":94,"process-nextick-args":99,"safe-buffer":118}],98:[function(e,t,r){var n=e("wrappy");function i(e){var t=function(){return t.called?t.value:(t.called=!0,t.value=e.apply(this,arguments))};return t.called=!1,t}function o(e){var t=function(){if(t.called)throw new Error(t.onceError);return t.called=!0,t.value=e.apply(this,arguments)},r=e.name||"Function wrapped with `once`";return t.onceError=r+" shouldn't be called more than once",t.called=!1,t}t.exports=n(i),t.exports.strict=n(o),i.proto=i(function(){Object.defineProperty(Function.prototype,"once",{value:function(){return i(this)},configurable:!0}),Object.defineProperty(Function.prototype,"onceStrict",{value:function(){return o(this)},configurable:!0})})},{wrappy:139}],99:[function(e,t,r){(function(e){"use strict";void 0===e||!e.version||0===e.version.indexOf("v0.")||0===e.version.indexOf("v1.")&&0!==e.version.indexOf("v1.8.")?t.exports={nextTick:function(t,r,n,i){if("function"!=typeof t)throw new TypeError('"callback" argument must be a function');var o,s,a=arguments.length;switch(a){case 0:case 1:return e.nextTick(t);case 2:return e.nextTick(function(){t.call(null,r)});case 3:return e.nextTick(function(){t.call(null,r,n)});case 4:return e.nextTick(function(){t.call(null,r,n,i)});default:for(o=new Array(a-1),s=0;s<o.length;)o[s++]=arguments[s];return e.nextTick(function(){t.apply(null,o)})}}}:t.exports=e}).call(this,e("_process"))},{_process:100}],100:[function(e,t,r){var n,i,o=t.exports={};function s(){throw new Error("setTimeout has not been defined")}function a(){throw new Error("clearTimeout has not been defined")}function u(e){if(n===setTimeout)return setTimeout(e,0);if((n===s||!n)&&setTimeout)return n=setTimeout,setTimeout(e,0);try{return n(e,0)}catch(t){try{return n.call(null,e,0)}catch(t){return n.call(this,e,0)}}}!function(){try{n="function"==typeof setTimeout?setTimeout:s}catch(e){n=s}try{i="function"==typeof clearTimeout?clearTimeout:a}catch(e){i=a}}();var c,l=[],f=!1,p=-1;function h(){f&&c&&(f=!1,c.length?l=c.concat(l):p=-1,l.length&&d())}function d(){if(!f){var e=u(h);f=!0;for(var t=l.length;t;){for(c=l,l=[];++p<t;)c&&c[p].run();p=-1,t=l.length}c=null,f=!1,function(e){if(i===clearTimeout)return clearTimeout(e);if((i===a||!i)&&clearTimeout)return i=clearTimeout,clearTimeout(e);try{i(e)}catch(t){try{return i.call(null,e)}catch(t){return i.call(this,e)}}}(e)}}function g(e,t){this.fun=e,this.array=t}function b(){}o.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var r=1;r<arguments.length;r++)t[r-1]=arguments[r];l.push(new g(e,t)),1!==l.length||f||u(d)},g.prototype.run=function(){this.fun.apply(null,this.array)},o.title="browser",o.browser=!0,o.env={},o.argv=[],o.version="",o.versions={},o.on=b,o.addListener=b,o.once=b,o.off=b,o.removeListener=b,o.removeAllListeners=b,o.emit=b,o.prependListener=b,o.prependOnceListener=b,o.listeners=function(e){return[]},o.binding=function(e){throw new Error("process.binding is not supported")},o.cwd=function(){return"/"},o.chdir=function(e){throw new Error("process.chdir is not supported")},o.umask=function(){return 0}},{}],101:[function(e,t,r){(function(e){!function(n){var i="object"==typeof r&&r&&!r.nodeType&&r,o="object"==typeof t&&t&&!t.nodeType&&t,s="object"==typeof e&&e;s.global!==s&&s.window!==s&&s.self!==s||(n=s);var a,u,c=2147483647,l=36,f=1,p=26,h=38,d=700,g=72,b=128,y="-",m=/^xn--/,_=/[^\x20-\x7E]/,v=/[\x2E\u3002\uFF0E\uFF61]/g,w={overflow:"Overflow: input needs wider integers to process","not-basic":"Illegal input >= 0x80 (not a basic code point)","invalid-input":"Invalid input"},S=l-f,x=Math.floor,k=String.fromCharCode;function E(e){throw new RangeError(w[e])}function I(e,t){for(var r=e.length,n=[];r--;)n[r]=t(e[r]);return n}function C(e,t){var r=e.split("@"),n="";return r.length>1&&(n=r[0]+"@",e=r[1]),n+I((e=e.replace(v,".")).split("."),t).join(".")}function O(e){for(var t,r,n=[],i=0,o=e.length;i<o;)(t=e.charCodeAt(i++))>=55296&&t<=56319&&i<o?56320==(64512&(r=e.charCodeAt(i++)))?n.push(((1023&t)<<10)+(1023&r)+65536):(n.push(t),i--):n.push(t);return n}function j(e){return I(e,function(e){var t="";return e>65535&&(t+=k((e-=65536)>>>10&1023|55296),e=56320|1023&e),t+=k(e)}).join("")}function T(e,t){return e+22+75*(e<26)-((0!=t)<<5)}function A(e,t,r){var n=0;for(e=r?x(e/d):e>>1,e+=x(e/t);e>S*p>>1;n+=l)e=x(e/S);return x(n+(S+1)*e/(e+h))}function P(e){var t,r,n,i,o,s,a,u,h,d,m,_=[],v=e.length,w=0,S=b,k=g;for((r=e.lastIndexOf(y))<0&&(r=0),n=0;n<r;++n)e.charCodeAt(n)>=128&&E("not-basic"),_.push(e.charCodeAt(n));for(i=r>0?r+1:0;i<v;){for(o=w,s=1,a=l;i>=v&&E("invalid-input"),((u=(m=e.charCodeAt(i++))-48<10?m-22:m-65<26?m-65:m-97<26?m-97:l)>=l||u>x((c-w)/s))&&E("overflow"),w+=u*s,!(u<(h=a<=k?f:a>=k+p?p:a-k));a+=l)s>x(c/(d=l-h))&&E("overflow"),s*=d;k=A(w-o,t=_.length+1,0==o),x(w/t)>c-S&&E("overflow"),S+=x(w/t),w%=t,_.splice(w++,0,S)}return j(_)}function M(e){var t,r,n,i,o,s,a,u,h,d,m,_,v,w,S,I=[];for(_=(e=O(e)).length,t=b,r=0,o=g,s=0;s<_;++s)(m=e[s])<128&&I.push(k(m));for(n=i=I.length,i&&I.push(y);n<_;){for(a=c,s=0;s<_;++s)(m=e[s])>=t&&m<a&&(a=m);for(a-t>x((c-r)/(v=n+1))&&E("overflow"),r+=(a-t)*v,t=a,s=0;s<_;++s)if((m=e[s])<t&&++r>c&&E("overflow"),m==t){for(u=r,h=l;!(u<(d=h<=o?f:h>=o+p?p:h-o));h+=l)S=u-d,w=l-d,I.push(k(T(d+S%w,0))),u=x(S/w);I.push(k(T(u,0))),o=A(r,v,n==i),r=0,++n}++r,++t}return I.join("")}if(a={version:"1.4.1",ucs2:{decode:O,encode:j},decode:P,encode:M,toASCII:function(e){return C(e,function(e){return _.test(e)?"xn--"+M(e):e})},toUnicode:function(e){return C(e,function(e){return m.test(e)?P(e.slice(4).toLowerCase()):e})}},i&&o)if(t.exports==i)o.exports=a;else for(u in a)a.hasOwnProperty(u)&&(i[u]=a[u]);else n.punycode=a}(this)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],102:[function(e,t,r){"use strict";function n(e,t){return Object.prototype.hasOwnProperty.call(e,t)}t.exports=function(e,t,r,o){t=t||"&",r=r||"=";var s={};if("string"!=typeof e||0===e.length)return s;var a=/\+/g;e=e.split(t);var u=1e3;o&&"number"==typeof o.maxKeys&&(u=o.maxKeys);var c=e.length;u>0&&c>u&&(c=u);for(var l=0;l<c;++l){var f,p,h,d,g=e[l].replace(a,"%20"),b=g.indexOf(r);b>=0?(f=g.substr(0,b),p=g.substr(b+1)):(f=g,p=""),h=decodeURIComponent(f),d=decodeURIComponent(p),n(s,h)?i(s[h])?s[h].push(d):s[h]=[s[h],d]:s[h]=d}return s};var i=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)}},{}],103:[function(e,t,r){"use strict";var n=function(e){switch(typeof e){case"string":return e;case"boolean":return e?"true":"false";case"number":return isFinite(e)?e:"";default:return""}};t.exports=function(e,t,r,a){return t=t||"&",r=r||"=",null===e&&(e=void 0),"object"==typeof e?o(s(e),function(s){var a=encodeURIComponent(n(s))+r;return i(e[s])?o(e[s],function(e){return a+encodeURIComponent(n(e))}).join(t):a+encodeURIComponent(n(e[s]))}).join(t):a?encodeURIComponent(n(a))+r+encodeURIComponent(n(e)):""};var i=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)};function o(e,t){if(e.map)return e.map(t);for(var r=[],n=0;n<e.length;n++)r.push(t(e[n],n));return r}var s=Object.keys||function(e){var t=[];for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.push(r);return t}},{}],104:[function(e,t,r){"use strict";r.decode=r.parse=e("./decode"),r.encode=r.stringify=e("./encode")},{"./decode":102,"./encode":103}],105:[function(e,t,r){t.exports=e("./lib/_stream_duplex.js")},{"./lib/_stream_duplex.js":106}],106:[function(e,t,r){"use strict";var n=e("process-nextick-args"),i=Object.keys||function(e){var t=[];for(var r in e)t.push(r);return t};t.exports=f;var o=e("core-util-is");o.inherits=e("inherits");var s=e("./_stream_readable"),a=e("./_stream_writable");o.inherits(f,s);for(var u=i(a.prototype),c=0;c<u.length;c++){var l=u[c];f.prototype[l]||(f.prototype[l]=a.prototype[l])}function f(e){if(!(this instanceof f))return new f(e);s.call(this,e),a.call(this,e),e&&!1===e.readable&&(this.readable=!1),e&&!1===e.writable&&(this.writable=!1),this.allowHalfOpen=!0,e&&!1===e.allowHalfOpen&&(this.allowHalfOpen=!1),this.once("end",p)}function p(){this.allowHalfOpen||this._writableState.ended||n.nextTick(h,this)}function h(e){e.end()}Object.defineProperty(f.prototype,"writableHighWaterMark",{enumerable:!1,get:function(){return this._writableState.highWaterMark}}),Object.defineProperty(f.prototype,"destroyed",{get:function(){return void 0!==this._readableState&&void 0!==this._writableState&&(this._readableState.destroyed&&this._writableState.destroyed)},set:function(e){void 0!==this._readableState&&void 0!==this._writableState&&(this._readableState.destroyed=e,this._writableState.destroyed=e)}}),f.prototype._destroy=function(e,t){this.push(null),this.end(),n.nextTick(t,e)}},{"./_stream_readable":108,"./_stream_writable":110,"core-util-is":13,inherits:88,"process-nextick-args":99}],107:[function(e,t,r){"use strict";t.exports=o;var n=e("./_stream_transform"),i=e("core-util-is");function o(e){if(!(this instanceof o))return new o(e);n.call(this,e)}i.inherits=e("inherits"),i.inherits(o,n),o.prototype._transform=function(e,t,r){r(null,e)}},{"./_stream_transform":109,"core-util-is":13,inherits:88}],108:[function(e,t,r){(function(r,n){"use strict";var i=e("process-nextick-args");t.exports=_;var o,s=e("isarray");_.ReadableState=m;e("events").EventEmitter;var a=function(e,t){return e.listeners(t).length},u=e("./internal/streams/stream"),c=e("safe-buffer").Buffer,l=n.Uint8Array||function(){};var f=e("core-util-is");f.inherits=e("inherits");var p=e("util"),h=void 0;h=p&&p.debuglog?p.debuglog("stream"):function(){};var d,g=e("./internal/streams/BufferList"),b=e("./internal/streams/destroy");f.inherits(_,u);var y=["error","close","destroy","pause","resume"];function m(t,r){o=o||e("./_stream_duplex"),t=t||{};var n=r instanceof o;this.objectMode=!!t.objectMode,n&&(this.objectMode=this.objectMode||!!t.readableObjectMode);var i=t.highWaterMark,s=t.readableHighWaterMark,a=this.objectMode?16:16384;this.highWaterMark=i||0===i?i:n&&(s||0===s)?s:a,this.highWaterMark=Math.floor(this.highWaterMark),this.buffer=new g,this.length=0,this.pipes=null,this.pipesCount=0,this.flowing=null,this.ended=!1,this.endEmitted=!1,this.reading=!1,this.sync=!0,this.needReadable=!1,this.emittedReadable=!1,this.readableListening=!1,this.resumeScheduled=!1,this.destroyed=!1,this.defaultEncoding=t.defaultEncoding||"utf8",this.awaitDrain=0,this.readingMore=!1,this.decoder=null,this.encoding=null,t.encoding&&(d||(d=e("string_decoder/").StringDecoder),this.decoder=new d(t.encoding),this.encoding=t.encoding)}function _(t){if(o=o||e("./_stream_duplex"),!(this instanceof _))return new _(t);this._readableState=new m(t,this),this.readable=!0,t&&("function"==typeof t.read&&(this._read=t.read),"function"==typeof t.destroy&&(this._destroy=t.destroy)),u.call(this)}function v(e,t,r,n,i){var o,s=e._readableState;null===t?(s.reading=!1,function(e,t){if(t.ended)return;if(t.decoder){var r=t.decoder.end();r&&r.length&&(t.buffer.push(r),t.length+=t.objectMode?1:r.length)}t.ended=!0,k(e)}(e,s)):(i||(o=function(e,t){var r;n=t,c.isBuffer(n)||n instanceof l||"string"==typeof t||void 0===t||e.objectMode||(r=new TypeError("Invalid non-string/buffer chunk"));var n;return r}(s,t)),o?e.emit("error",o):s.objectMode||t&&t.length>0?("string"==typeof t||s.objectMode||Object.getPrototypeOf(t)===c.prototype||(t=function(e){return c.from(e)}(t)),n?s.endEmitted?e.emit("error",new Error("stream.unshift() after end event")):w(e,s,t,!0):s.ended?e.emit("error",new Error("stream.push() after EOF")):(s.reading=!1,s.decoder&&!r?(t=s.decoder.write(t),s.objectMode||0!==t.length?w(e,s,t,!1):I(e,s)):w(e,s,t,!1))):n||(s.reading=!1));return function(e){return!e.ended&&(e.needReadable||e.length<e.highWaterMark||0===e.length)}(s)}function w(e,t,r,n){t.flowing&&0===t.length&&!t.sync?(e.emit("data",r),e.read(0)):(t.length+=t.objectMode?1:r.length,n?t.buffer.unshift(r):t.buffer.push(r),t.needReadable&&k(e)),I(e,t)}Object.defineProperty(_.prototype,"destroyed",{get:function(){return void 0!==this._readableState&&this._readableState.destroyed},set:function(e){this._readableState&&(this._readableState.destroyed=e)}}),_.prototype.destroy=b.destroy,_.prototype._undestroy=b.undestroy,_.prototype._destroy=function(e,t){this.push(null),t(e)},_.prototype.push=function(e,t){var r,n=this._readableState;return n.objectMode?r=!0:"string"==typeof e&&((t=t||n.defaultEncoding)!==n.encoding&&(e=c.from(e,t),t=""),r=!0),v(this,e,t,!1,r)},_.prototype.unshift=function(e){return v(this,e,null,!0,!1)},_.prototype.isPaused=function(){return!1===this._readableState.flowing},_.prototype.setEncoding=function(t){return d||(d=e("string_decoder/").StringDecoder),this._readableState.decoder=new d(t),this._readableState.encoding=t,this};var S=8388608;function x(e,t){return e<=0||0===t.length&&t.ended?0:t.objectMode?1:e!=e?t.flowing&&t.length?t.buffer.head.data.length:t.length:(e>t.highWaterMark&&(t.highWaterMark=function(e){return e>=S?e=S:(e--,e|=e>>>1,e|=e>>>2,e|=e>>>4,e|=e>>>8,e|=e>>>16,e++),e}(e)),e<=t.length?e:t.ended?t.length:(t.needReadable=!0,0))}function k(e){var t=e._readableState;t.needReadable=!1,t.emittedReadable||(h("emitReadable",t.flowing),t.emittedReadable=!0,t.sync?i.nextTick(E,e):E(e))}function E(e){h("emit readable"),e.emit("readable"),T(e)}function I(e,t){t.readingMore||(t.readingMore=!0,i.nextTick(C,e,t))}function C(e,t){for(var r=t.length;!t.reading&&!t.flowing&&!t.ended&&t.length<t.highWaterMark&&(h("maybeReadMore read 0"),e.read(0),r!==t.length);)r=t.length;t.readingMore=!1}function O(e){h("readable nexttick read 0"),e.read(0)}function j(e,t){t.reading||(h("resume read 0"),e.read(0)),t.resumeScheduled=!1,t.awaitDrain=0,e.emit("resume"),T(e),t.flowing&&!t.reading&&e.read(0)}function T(e){var t=e._readableState;for(h("flow",t.flowing);t.flowing&&null!==e.read(););}function A(e,t){return 0===t.length?null:(t.objectMode?r=t.buffer.shift():!e||e>=t.length?(r=t.decoder?t.buffer.join(""):1===t.buffer.length?t.buffer.head.data:t.buffer.concat(t.length),t.buffer.clear()):r=function(e,t,r){var n;e<t.head.data.length?(n=t.head.data.slice(0,e),t.head.data=t.head.data.slice(e)):n=e===t.head.data.length?t.shift():r?function(e,t){var r=t.head,n=1,i=r.data;e-=i.length;for(;r=r.next;){var o=r.data,s=e>o.length?o.length:e;if(s===o.length?i+=o:i+=o.slice(0,e),0===(e-=s)){s===o.length?(++n,r.next?t.head=r.next:t.head=t.tail=null):(t.head=r,r.data=o.slice(s));break}++n}return t.length-=n,i}(e,t):function(e,t){var r=c.allocUnsafe(e),n=t.head,i=1;n.data.copy(r),e-=n.data.length;for(;n=n.next;){var o=n.data,s=e>o.length?o.length:e;if(o.copy(r,r.length-e,0,s),0===(e-=s)){s===o.length?(++i,n.next?t.head=n.next:t.head=t.tail=null):(t.head=n,n.data=o.slice(s));break}++i}return t.length-=i,r}(e,t);return n}(e,t.buffer,t.decoder),r);var r}function P(e){var t=e._readableState;if(t.length>0)throw new Error('"endReadable()" called on non-empty stream');t.endEmitted||(t.ended=!0,i.nextTick(M,t,e))}function M(e,t){e.endEmitted||0!==e.length||(e.endEmitted=!0,t.readable=!1,t.emit("end"))}function B(e,t){for(var r=0,n=e.length;r<n;r++)if(e[r]===t)return r;return-1}_.prototype.read=function(e){h("read",e),e=parseInt(e,10);var t=this._readableState,r=e;if(0!==e&&(t.emittedReadable=!1),0===e&&t.needReadable&&(t.length>=t.highWaterMark||t.ended))return h("read: emitReadable",t.length,t.ended),0===t.length&&t.ended?P(this):k(this),null;if(0===(e=x(e,t))&&t.ended)return 0===t.length&&P(this),null;var n,i=t.needReadable;return h("need readable",i),(0===t.length||t.length-e<t.highWaterMark)&&h("length less than watermark",i=!0),t.ended||t.reading?h("reading or ended",i=!1):i&&(h("do read"),t.reading=!0,t.sync=!0,0===t.length&&(t.needReadable=!0),this._read(t.highWaterMark),t.sync=!1,t.reading||(e=x(r,t))),null===(n=e>0?A(e,t):null)?(t.needReadable=!0,e=0):t.length-=e,0===t.length&&(t.ended||(t.needReadable=!0),r!==e&&t.ended&&P(this)),null!==n&&this.emit("data",n),n},_.prototype._read=function(e){this.emit("error",new Error("_read() is not implemented"))},_.prototype.pipe=function(e,t){var n=this,o=this._readableState;switch(o.pipesCount){case 0:o.pipes=e;break;case 1:o.pipes=[o.pipes,e];break;default:o.pipes.push(e)}o.pipesCount+=1,h("pipe count=%d opts=%j",o.pipesCount,t);var u=(!t||!1!==t.end)&&e!==r.stdout&&e!==r.stderr?l:_;function c(t,r){h("onunpipe"),t===n&&r&&!1===r.hasUnpiped&&(r.hasUnpiped=!0,h("cleanup"),e.removeListener("close",y),e.removeListener("finish",m),e.removeListener("drain",f),e.removeListener("error",b),e.removeListener("unpipe",c),n.removeListener("end",l),n.removeListener("end",_),n.removeListener("data",g),p=!0,!o.awaitDrain||e._writableState&&!e._writableState.needDrain||f())}function l(){h("onend"),e.end()}o.endEmitted?i.nextTick(u):n.once("end",u),e.on("unpipe",c);var f=function(e){return function(){var t=e._readableState;h("pipeOnDrain",t.awaitDrain),t.awaitDrain&&t.awaitDrain--,0===t.awaitDrain&&a(e,"data")&&(t.flowing=!0,T(e))}}(n);e.on("drain",f);var p=!1;var d=!1;function g(t){h("ondata"),d=!1,!1!==e.write(t)||d||((1===o.pipesCount&&o.pipes===e||o.pipesCount>1&&-1!==B(o.pipes,e))&&!p&&(h("false write response, pause",n._readableState.awaitDrain),n._readableState.awaitDrain++,d=!0),n.pause())}function b(t){h("onerror",t),_(),e.removeListener("error",b),0===a(e,"error")&&e.emit("error",t)}function y(){e.removeListener("finish",m),_()}function m(){h("onfinish"),e.removeListener("close",y),_()}function _(){h("unpipe"),n.unpipe(e)}return n.on("data",g),function(e,t,r){if("function"==typeof e.prependListener)return e.prependListener(t,r);e._events&&e._events[t]?s(e._events[t])?e._events[t].unshift(r):e._events[t]=[r,e._events[t]]:e.on(t,r)}(e,"error",b),e.once("close",y),e.once("finish",m),e.emit("pipe",n),o.flowing||(h("pipe resume"),n.resume()),e},_.prototype.unpipe=function(e){var t=this._readableState,r={hasUnpiped:!1};if(0===t.pipesCount)return this;if(1===t.pipesCount)return e&&e!==t.pipes?this:(e||(e=t.pipes),t.pipes=null,t.pipesCount=0,t.flowing=!1,e&&e.emit("unpipe",this,r),this);if(!e){var n=t.pipes,i=t.pipesCount;t.pipes=null,t.pipesCount=0,t.flowing=!1;for(var o=0;o<i;o++)n[o].emit("unpipe",this,r);return this}var s=B(t.pipes,e);return-1===s?this:(t.pipes.splice(s,1),t.pipesCount-=1,1===t.pipesCount&&(t.pipes=t.pipes[0]),e.emit("unpipe",this,r),this)},_.prototype.on=function(e,t){var r=u.prototype.on.call(this,e,t);if("data"===e)!1!==this._readableState.flowing&&this.resume();else if("readable"===e){var n=this._readableState;n.endEmitted||n.readableListening||(n.readableListening=n.needReadable=!0,n.emittedReadable=!1,n.reading?n.length&&k(this):i.nextTick(O,this))}return r},_.prototype.addListener=_.prototype.on,_.prototype.resume=function(){var e=this._readableState;return e.flowing||(h("resume"),e.flowing=!0,function(e,t){t.resumeScheduled||(t.resumeScheduled=!0,i.nextTick(j,e,t))}(this,e)),this},_.prototype.pause=function(){return h("call pause flowing=%j",this._readableState.flowing),!1!==this._readableState.flowing&&(h("pause"),this._readableState.flowing=!1,this.emit("pause")),this},_.prototype.wrap=function(e){var t=this,r=this._readableState,n=!1;for(var i in e.on("end",function(){if(h("wrapped end"),r.decoder&&!r.ended){var e=r.decoder.end();e&&e.length&&t.push(e)}t.push(null)}),e.on("data",function(i){(h("wrapped data"),r.decoder&&(i=r.decoder.write(i)),!r.objectMode||null!==i&&void 0!==i)&&((r.objectMode||i&&i.length)&&(t.push(i)||(n=!0,e.pause())))}),e)void 0===this[i]&&"function"==typeof e[i]&&(this[i]=function(t){return function(){return e[t].apply(e,arguments)}}(i));for(var o=0;o<y.length;o++)e.on(y[o],this.emit.bind(this,y[o]));return this._read=function(t){h("wrapped _read",t),n&&(n=!1,e.resume())},this},Object.defineProperty(_.prototype,"readableHighWaterMark",{enumerable:!1,get:function(){return this._readableState.highWaterMark}}),_._fromList=A}).call(this,e("_process"),"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./_stream_duplex":106,"./internal/streams/BufferList":111,"./internal/streams/destroy":112,"./internal/streams/stream":113,_process:100,"core-util-is":13,events:83,inherits:88,isarray:114,"process-nextick-args":99,"safe-buffer":118,"string_decoder/":115,util:11}],109:[function(e,t,r){"use strict";t.exports=o;var n=e("./_stream_duplex"),i=e("core-util-is");function o(e){if(!(this instanceof o))return new o(e);n.call(this,e),this._transformState={afterTransform:function(e,t){var r=this._transformState;r.transforming=!1;var n=r.writecb;if(!n)return this.emit("error",new Error("write callback called multiple times"));r.writechunk=null,r.writecb=null,null!=t&&this.push(t),n(e);var i=this._readableState;i.reading=!1,(i.needReadable||i.length<i.highWaterMark)&&this._read(i.highWaterMark)}.bind(this),needTransform:!1,transforming:!1,writecb:null,writechunk:null,writeencoding:null},this._readableState.needReadable=!0,this._readableState.sync=!1,e&&("function"==typeof e.transform&&(this._transform=e.transform),"function"==typeof e.flush&&(this._flush=e.flush)),this.on("prefinish",s)}function s(){var e=this;"function"==typeof this._flush?this._flush(function(t,r){a(e,t,r)}):a(this,null,null)}function a(e,t,r){if(t)return e.emit("error",t);if(null!=r&&e.push(r),e._writableState.length)throw new Error("Calling transform done when ws.length != 0");if(e._transformState.transforming)throw new Error("Calling transform done when still transforming");return e.push(null)}i.inherits=e("inherits"),i.inherits(o,n),o.prototype.push=function(e,t){return this._transformState.needTransform=!1,n.prototype.push.call(this,e,t)},o.prototype._transform=function(e,t,r){throw new Error("_transform() is not implemented")},o.prototype._write=function(e,t,r){var n=this._transformState;if(n.writecb=r,n.writechunk=e,n.writeencoding=t,!n.transforming){var i=this._readableState;(n.needTransform||i.needReadable||i.length<i.highWaterMark)&&this._read(i.highWaterMark)}},o.prototype._read=function(e){var t=this._transformState;null!==t.writechunk&&t.writecb&&!t.transforming?(t.transforming=!0,this._transform(t.writechunk,t.writeencoding,t.afterTransform)):t.needTransform=!0},o.prototype._destroy=function(e,t){var r=this;n.prototype._destroy.call(this,e,function(e){t(e),r.emit("close")})}},{"./_stream_duplex":106,"core-util-is":13,inherits:88}],110:[function(e,t,r){(function(r,n,i){"use strict";var o=e("process-nextick-args");function s(e){var t=this;this.next=null,this.entry=null,this.finish=function(){!function(e,t,r){var n=e.entry;e.entry=null;for(;n;){var i=n.callback;t.pendingcb--,i(r),n=n.next}t.corkedRequestsFree?t.corkedRequestsFree.next=e:t.corkedRequestsFree=e}(t,e)}}t.exports=m;var a,u=!r.browser&&["v0.10","v0.9."].indexOf(r.version.slice(0,5))>-1?i:o.nextTick;m.WritableState=y;var c=e("core-util-is");c.inherits=e("inherits");var l={deprecate:e("util-deprecate")},f=e("./internal/streams/stream"),p=e("safe-buffer").Buffer,h=n.Uint8Array||function(){};var d,g=e("./internal/streams/destroy");function b(){}function y(t,r){a=a||e("./_stream_duplex"),t=t||{};var n=r instanceof a;this.objectMode=!!t.objectMode,n&&(this.objectMode=this.objectMode||!!t.writableObjectMode);var i=t.highWaterMark,c=t.writableHighWaterMark,l=this.objectMode?16:16384;this.highWaterMark=i||0===i?i:n&&(c||0===c)?c:l,this.highWaterMark=Math.floor(this.highWaterMark),this.finalCalled=!1,this.needDrain=!1,this.ending=!1,this.ended=!1,this.finished=!1,this.destroyed=!1;var f=!1===t.decodeStrings;this.decodeStrings=!f,this.defaultEncoding=t.defaultEncoding||"utf8",this.length=0,this.writing=!1,this.corked=0,this.sync=!0,this.bufferProcessing=!1,this.onwrite=function(e){!function(e,t){var r=e._writableState,n=r.sync,i=r.writecb;if(function(e){e.writing=!1,e.writecb=null,e.length-=e.writelen,e.writelen=0}(r),t)!function(e,t,r,n,i){--t.pendingcb,r?(o.nextTick(i,n),o.nextTick(k,e,t),e._writableState.errorEmitted=!0,e.emit("error",n)):(i(n),e._writableState.errorEmitted=!0,e.emit("error",n),k(e,t))}(e,r,n,t,i);else{var s=S(r);s||r.corked||r.bufferProcessing||!r.bufferedRequest||w(e,r),n?u(v,e,r,s,i):v(e,r,s,i)}}(r,e)},this.writecb=null,this.writelen=0,this.bufferedRequest=null,this.lastBufferedRequest=null,this.pendingcb=0,this.prefinished=!1,this.errorEmitted=!1,this.bufferedRequestCount=0,this.corkedRequestsFree=new s(this)}function m(t){if(a=a||e("./_stream_duplex"),!(d.call(m,this)||this instanceof a))return new m(t);this._writableState=new y(t,this),this.writable=!0,t&&("function"==typeof t.write&&(this._write=t.write),"function"==typeof t.writev&&(this._writev=t.writev),"function"==typeof t.destroy&&(this._destroy=t.destroy),"function"==typeof t.final&&(this._final=t.final)),f.call(this)}function _(e,t,r,n,i,o,s){t.writelen=n,t.writecb=s,t.writing=!0,t.sync=!0,r?e._writev(i,t.onwrite):e._write(i,o,t.onwrite),t.sync=!1}function v(e,t,r,n){r||function(e,t){0===t.length&&t.needDrain&&(t.needDrain=!1,e.emit("drain"))}(e,t),t.pendingcb--,n(),k(e,t)}function w(e,t){t.bufferProcessing=!0;var r=t.bufferedRequest;if(e._writev&&r&&r.next){var n=t.bufferedRequestCount,i=new Array(n),o=t.corkedRequestsFree;o.entry=r;for(var a=0,u=!0;r;)i[a]=r,r.isBuf||(u=!1),r=r.next,a+=1;i.allBuffers=u,_(e,t,!0,t.length,i,"",o.finish),t.pendingcb++,t.lastBufferedRequest=null,o.next?(t.corkedRequestsFree=o.next,o.next=null):t.corkedRequestsFree=new s(t),t.bufferedRequestCount=0}else{for(;r;){var c=r.chunk,l=r.encoding,f=r.callback;if(_(e,t,!1,t.objectMode?1:c.length,c,l,f),r=r.next,t.bufferedRequestCount--,t.writing)break}null===r&&(t.lastBufferedRequest=null)}t.bufferedRequest=r,t.bufferProcessing=!1}function S(e){return e.ending&&0===e.length&&null===e.bufferedRequest&&!e.finished&&!e.writing}function x(e,t){e._final(function(r){t.pendingcb--,r&&e.emit("error",r),t.prefinished=!0,e.emit("prefinish"),k(e,t)})}function k(e,t){var r=S(t);return r&&(!function(e,t){t.prefinished||t.finalCalled||("function"==typeof e._final?(t.pendingcb++,t.finalCalled=!0,o.nextTick(x,e,t)):(t.prefinished=!0,e.emit("prefinish")))}(e,t),0===t.pendingcb&&(t.finished=!0,e.emit("finish"))),r}c.inherits(m,f),y.prototype.getBuffer=function(){for(var e=this.bufferedRequest,t=[];e;)t.push(e),e=e.next;return t},function(){try{Object.defineProperty(y.prototype,"buffer",{get:l.deprecate(function(){return this.getBuffer()},"_writableState.buffer is deprecated. Use _writableState.getBuffer instead.","DEP0003")})}catch(e){}}(),"function"==typeof Symbol&&Symbol.hasInstance&&"function"==typeof Function.prototype[Symbol.hasInstance]?(d=Function.prototype[Symbol.hasInstance],Object.defineProperty(m,Symbol.hasInstance,{value:function(e){return!!d.call(this,e)||this===m&&(e&&e._writableState instanceof y)}})):d=function(e){return e instanceof this},m.prototype.pipe=function(){this.emit("error",new Error("Cannot pipe, not readable"))},m.prototype.write=function(e,t,r){var n,i=this._writableState,s=!1,a=!i.objectMode&&(n=e,p.isBuffer(n)||n instanceof h);return a&&!p.isBuffer(e)&&(e=function(e){return p.from(e)}(e)),"function"==typeof t&&(r=t,t=null),a?t="buffer":t||(t=i.defaultEncoding),"function"!=typeof r&&(r=b),i.ended?function(e,t){var r=new Error("write after end");e.emit("error",r),o.nextTick(t,r)}(this,r):(a||function(e,t,r,n){var i=!0,s=!1;return null===r?s=new TypeError("May not write null values to stream"):"string"==typeof r||void 0===r||t.objectMode||(s=new TypeError("Invalid non-string/buffer chunk")),s&&(e.emit("error",s),o.nextTick(n,s),i=!1),i}(this,i,e,r))&&(i.pendingcb++,s=function(e,t,r,n,i,o){if(!r){var s=function(e,t,r){e.objectMode||!1===e.decodeStrings||"string"!=typeof t||(t=p.from(t,r));return t}(t,n,i);n!==s&&(r=!0,i="buffer",n=s)}var a=t.objectMode?1:n.length;t.length+=a;var u=t.length<t.highWaterMark;u||(t.needDrain=!0);if(t.writing||t.corked){var c=t.lastBufferedRequest;t.lastBufferedRequest={chunk:n,encoding:i,isBuf:r,callback:o,next:null},c?c.next=t.lastBufferedRequest:t.bufferedRequest=t.lastBufferedRequest,t.bufferedRequestCount+=1}else _(e,t,!1,a,n,i,o);return u}(this,i,a,e,t,r)),s},m.prototype.cork=function(){this._writableState.corked++},m.prototype.uncork=function(){var e=this._writableState;e.corked&&(e.corked--,e.writing||e.corked||e.finished||e.bufferProcessing||!e.bufferedRequest||w(this,e))},m.prototype.setDefaultEncoding=function(e){if("string"==typeof e&&(e=e.toLowerCase()),!(["hex","utf8","utf-8","ascii","binary","base64","ucs2","ucs-2","utf16le","utf-16le","raw"].indexOf((e+"").toLowerCase())>-1))throw new TypeError("Unknown encoding: "+e);return this._writableState.defaultEncoding=e,this},Object.defineProperty(m.prototype,"writableHighWaterMark",{enumerable:!1,get:function(){return this._writableState.highWaterMark}}),m.prototype._write=function(e,t,r){r(new Error("_write() is not implemented"))},m.prototype._writev=null,m.prototype.end=function(e,t,r){var n=this._writableState;"function"==typeof e?(r=e,e=null,t=null):"function"==typeof t&&(r=t,t=null),null!==e&&void 0!==e&&this.write(e,t),n.corked&&(n.corked=1,this.uncork()),n.ending||n.finished||function(e,t,r){t.ending=!0,k(e,t),r&&(t.finished?o.nextTick(r):e.once("finish",r));t.ended=!0,e.writable=!1}(this,n,r)},Object.defineProperty(m.prototype,"destroyed",{get:function(){return void 0!==this._writableState&&this._writableState.destroyed},set:function(e){this._writableState&&(this._writableState.destroyed=e)}}),m.prototype.destroy=g.destroy,m.prototype._undestroy=g.undestroy,m.prototype._destroy=function(e,t){this.end(),t(e)}}).call(this,e("_process"),"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},e("timers").setImmediate)},{"./_stream_duplex":106,"./internal/streams/destroy":112,"./internal/streams/stream":113,_process:100,"core-util-is":13,inherits:88,"process-nextick-args":99,"safe-buffer":118,timers:120,"util-deprecate":134}],111:[function(e,t,r){"use strict";var n=e("safe-buffer").Buffer,i=e("util");t.exports=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.head=null,this.tail=null,this.length=0}return e.prototype.push=function(e){var t={data:e,next:null};this.length>0?this.tail.next=t:this.head=t,this.tail=t,++this.length},e.prototype.unshift=function(e){var t={data:e,next:this.head};0===this.length&&(this.tail=t),this.head=t,++this.length},e.prototype.shift=function(){if(0!==this.length){var e=this.head.data;return 1===this.length?this.head=this.tail=null:this.head=this.head.next,--this.length,e}},e.prototype.clear=function(){this.head=this.tail=null,this.length=0},e.prototype.join=function(e){if(0===this.length)return"";for(var t=this.head,r=""+t.data;t=t.next;)r+=e+t.data;return r},e.prototype.concat=function(e){if(0===this.length)return n.alloc(0);if(1===this.length)return this.head.data;for(var t,r,i,o=n.allocUnsafe(e>>>0),s=this.head,a=0;s;)t=s.data,r=o,i=a,t.copy(r,i),a+=s.data.length,s=s.next;return o},e}(),i&&i.inspect&&i.inspect.custom&&(t.exports.prototype[i.inspect.custom]=function(){var e=i.inspect({length:this.length});return this.constructor.name+" "+e})},{"safe-buffer":118,util:11}],112:[function(e,t,r){"use strict";var n=e("process-nextick-args");function i(e,t){e.emit("error",t)}t.exports={destroy:function(e,t){var r=this,o=this._readableState&&this._readableState.destroyed,s=this._writableState&&this._writableState.destroyed;return o||s?(t?t(e):!e||this._writableState&&this._writableState.errorEmitted||n.nextTick(i,this,e),this):(this._readableState&&(this._readableState.destroyed=!0),this._writableState&&(this._writableState.destroyed=!0),this._destroy(e||null,function(e){!t&&e?(n.nextTick(i,r,e),r._writableState&&(r._writableState.errorEmitted=!0)):t&&t(e)}),this)},undestroy:function(){this._readableState&&(this._readableState.destroyed=!1,this._readableState.reading=!1,this._readableState.ended=!1,this._readableState.endEmitted=!1),this._writableState&&(this._writableState.destroyed=!1,this._writableState.ended=!1,this._writableState.ending=!1,this._writableState.finished=!1,this._writableState.errorEmitted=!1)}}},{"process-nextick-args":99}],113:[function(e,t,r){t.exports=e("events").EventEmitter},{events:83}],114:[function(e,t,r){var n={}.toString;t.exports=Array.isArray||function(e){return"[object Array]"==n.call(e)}},{}],115:[function(e,t,r){"use strict";var n=e("safe-buffer").Buffer,i=n.isEncoding||function(e){switch((e=""+e)&&e.toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":case"raw":return!0;default:return!1}};function o(e){var t;switch(this.encoding=function(e){var t=function(e){if(!e)return"utf8";for(var t;;)switch(e){case"utf8":case"utf-8":return"utf8";case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return"utf16le";case"latin1":case"binary":return"latin1";case"base64":case"ascii":case"hex":return e;default:if(t)return;e=(""+e).toLowerCase(),t=!0}}(e);if("string"!=typeof t&&(n.isEncoding===i||!i(e)))throw new Error("Unknown encoding: "+e);return t||e}(e),this.encoding){case"utf16le":this.text=u,this.end=c,t=4;break;case"utf8":this.fillLast=a,t=4;break;case"base64":this.text=l,this.end=f,t=3;break;default:return this.write=p,void(this.end=h)}this.lastNeed=0,this.lastTotal=0,this.lastChar=n.allocUnsafe(t)}function s(e){return e<=127?0:e>>5==6?2:e>>4==14?3:e>>3==30?4:e>>6==2?-1:-2}function a(e){var t=this.lastTotal-this.lastNeed,r=function(e,t,r){if(128!=(192&t[0]))return e.lastNeed=0,"�";if(e.lastNeed>1&&t.length>1){if(128!=(192&t[1]))return e.lastNeed=1,"�";if(e.lastNeed>2&&t.length>2&&128!=(192&t[2]))return e.lastNeed=2,"�"}}(this,e);return void 0!==r?r:this.lastNeed<=e.length?(e.copy(this.lastChar,t,0,this.lastNeed),this.lastChar.toString(this.encoding,0,this.lastTotal)):(e.copy(this.lastChar,t,0,e.length),void(this.lastNeed-=e.length))}function u(e,t){if((e.length-t)%2==0){var r=e.toString("utf16le",t);if(r){var n=r.charCodeAt(r.length-1);if(n>=55296&&n<=56319)return this.lastNeed=2,this.lastTotal=4,this.lastChar[0]=e[e.length-2],this.lastChar[1]=e[e.length-1],r.slice(0,-1)}return r}return this.lastNeed=1,this.lastTotal=2,this.lastChar[0]=e[e.length-1],e.toString("utf16le",t,e.length-1)}function c(e){var t=e&&e.length?this.write(e):"";if(this.lastNeed){var r=this.lastTotal-this.lastNeed;return t+this.lastChar.toString("utf16le",0,r)}return t}function l(e,t){var r=(e.length-t)%3;return 0===r?e.toString("base64",t):(this.lastNeed=3-r,this.lastTotal=3,1===r?this.lastChar[0]=e[e.length-1]:(this.lastChar[0]=e[e.length-2],this.lastChar[1]=e[e.length-1]),e.toString("base64",t,e.length-r))}function f(e){var t=e&&e.length?this.write(e):"";return this.lastNeed?t+this.lastChar.toString("base64",0,3-this.lastNeed):t}function p(e){return e.toString(this.encoding)}function h(e){return e&&e.length?this.write(e):""}r.StringDecoder=o,o.prototype.write=function(e){if(0===e.length)return"";var t,r;if(this.lastNeed){if(void 0===(t=this.fillLast(e)))return"";r=this.lastNeed,this.lastNeed=0}else r=0;return r<e.length?t?t+this.text(e,r):this.text(e,r):t||""},o.prototype.end=function(e){var t=e&&e.length?this.write(e):"";return this.lastNeed?t+"�":t},o.prototype.text=function(e,t){var r=function(e,t,r){var n=t.length-1;if(n<r)return 0;var i=s(t[n]);if(i>=0)return i>0&&(e.lastNeed=i-1),i;if(--n<r||-2===i)return 0;if((i=s(t[n]))>=0)return i>0&&(e.lastNeed=i-2),i;if(--n<r||-2===i)return 0;if((i=s(t[n]))>=0)return i>0&&(2===i?i=0:e.lastNeed=i-3),i;return 0}(this,e,t);if(!this.lastNeed)return e.toString("utf8",t);this.lastTotal=r;var n=e.length-(r-this.lastNeed);return e.copy(this.lastChar,0,n),e.toString("utf8",t,n)},o.prototype.fillLast=function(e){if(this.lastNeed<=e.length)return e.copy(this.lastChar,this.lastTotal-this.lastNeed,0,this.lastNeed),this.lastChar.toString(this.encoding,0,this.lastTotal);e.copy(this.lastChar,this.lastTotal-this.lastNeed,0,e.length),this.lastNeed-=e.length}},{"safe-buffer":118}],116:[function(e,t,r){(r=t.exports=e("./lib/_stream_readable.js")).Stream=r,r.Readable=r,r.Writable=e("./lib/_stream_writable.js"),r.Duplex=e("./lib/_stream_duplex.js"),r.Transform=e("./lib/_stream_transform.js"),r.PassThrough=e("./lib/_stream_passthrough.js")},{"./lib/_stream_duplex.js":106,"./lib/_stream_passthrough.js":107,"./lib/_stream_readable.js":108,"./lib/_stream_transform.js":109,"./lib/_stream_writable.js":110}],117:[function(e,t,r){"use strict";t.exports=function(){if("function"!=typeof arguments[0])throw new Error("callback needed");if("number"!=typeof arguments[1])throw new Error("interval needed");var e;if(arguments.length>0){e=new Array(arguments.length-2);for(var t=0;t<e.length;t++)e[t]=arguments[t+2]}return new function(e,t,r){var n=this;this._callback=e,this._args=r,this._interval=setInterval(e,t,this._args),this.reschedule=function(e){e||(e=n._interval),n._interval&&clearInterval(n._interval),n._interval=setInterval(n._callback,e,n._args)},this.clear=function(){n._interval&&(clearInterval(n._interval),n._interval=void 0)},this.destroy=function(){n._interval&&clearInterval(n._interval),n._callback=void 0,n._interval=void 0,n._args=void 0}}(arguments[0],arguments[1],e)}},{}],118:[function(e,t,r){var n=e("buffer"),i=n.Buffer;function o(e,t){for(var r in e)t[r]=e[r]}function s(e,t,r){return i(e,t,r)}i.from&&i.alloc&&i.allocUnsafe&&i.allocUnsafeSlow?t.exports=n:(o(n,r),r.Buffer=s),o(i,s),s.from=function(e,t,r){if("number"==typeof e)throw new TypeError("Argument must not be a number");return i(e,t,r)},s.alloc=function(e,t,r){if("number"!=typeof e)throw new TypeError("Argument must be a number");var n=i(e);return void 0!==t?"string"==typeof r?n.fill(t,r):n.fill(t):n.fill(0),n},s.allocUnsafe=function(e){if("number"!=typeof e)throw new TypeError("Argument must be a number");return i(e)},s.allocUnsafeSlow=function(e){if("number"!=typeof e)throw new TypeError("Argument must be a number");return n.SlowBuffer(e)}},{buffer:12}],119:[function(e,t,r){t.exports=function(e){var t=e._readableState;return t?t.objectMode||"number"==typeof e._duplexState?e.read():e.read((r=t,r.buffer.length?r.buffer.head?r.buffer.head.data.length:r.buffer[0].length:r.length)):null;var r}},{}],120:[function(e,t,r){(function(t,n){var i=e("process/browser.js").nextTick,o=Function.prototype.apply,s=Array.prototype.slice,a={},u=0;function c(e,t){this._id=e,this._clearFn=t}r.setTimeout=function(){return new c(o.call(setTimeout,window,arguments),clearTimeout)},r.setInterval=function(){return new c(o.call(setInterval,window,arguments),clearInterval)},r.clearTimeout=r.clearInterval=function(e){e.close()},c.prototype.unref=c.prototype.ref=function(){},c.prototype.close=function(){this._clearFn.call(window,this._id)},r.enroll=function(e,t){clearTimeout(e._idleTimeoutId),e._idleTimeout=t},r.unenroll=function(e){clearTimeout(e._idleTimeoutId),e._idleTimeout=-1},r._unrefActive=r.active=function(e){clearTimeout(e._idleTimeoutId);var t=e._idleTimeout;t>=0&&(e._idleTimeoutId=setTimeout(function(){e._onTimeout&&e._onTimeout()},t))},r.setImmediate="function"==typeof t?t:function(e){var t=u++,n=!(arguments.length<2)&&s.call(arguments,1);return a[t]=!0,i(function(){a[t]&&(n?e.apply(null,n):e.call(null),r.clearImmediate(t))}),t},r.clearImmediate="function"==typeof n?n:function(e){delete a[e]}}).call(this,e("timers").setImmediate,e("timers").clearImmediate)},{"process/browser.js":100,timers:120}],121:[function(e,t,r){"use strict";var n=e("../prototype/is");t.exports=function(e){if("function"!=typeof e)return!1;if(!hasOwnProperty.call(e,"length"))return!1;try{if("number"!=typeof e.length)return!1;if("function"!=typeof e.call)return!1;if("function"!=typeof e.apply)return!1}catch(e){return!1}return!n(e)}},{"../prototype/is":128}],122:[function(e,t,r){"use strict";var n=e("../value/is"),i=e("../object/is"),o=e("../string/coerce"),s=e("./to-short-string"),a=function(e,t){return e.replace("%v",s(t))};t.exports=function(e,t,r){if(!i(r))throw new TypeError(a(t,e));if(!n(e)){if("default"in r)return r.default;if(r.isOptional)return null}var s=o(r.errorMessage);throw n(s)||(s=t),new TypeError(a(s,e))}},{"../object/is":125,"../string/coerce":129,"../value/is":131,"./to-short-string":124}],123:[function(e,t,r){"use strict";t.exports=function(e){try{return e.toString()}catch(t){try{return String(e)}catch(e){return null}}}},{}],124:[function(e,t,r){"use strict";var n=e("./safe-to-string"),i=/[\n\r\u2028\u2029]/g;t.exports=function(e){var t=n(e);return null===t?"<Non-coercible to string value>":(t.length>100&&(t=t.slice(0,99)+"…"),t=t.replace(i,function(e){switch(e){case"\n":return"\\n";case"\r":return"\\r";case"\u2028":return"\\u2028";case"\u2029":return"\\u2029";default:throw new Error("Unexpected character")}}))}},{"./safe-to-string":123}],125:[function(e,t,r){"use strict";var n=e("../value/is"),i={object:!0,function:!0,undefined:!0};t.exports=function(e){return!!n(e)&&hasOwnProperty.call(i,typeof e)}},{"../value/is":131}],126:[function(e,t,r){"use strict";var n=e("../lib/resolve-exception"),i=e("./is");t.exports=function(e){return i(e)?e:n(e,"%v is not a plain function",arguments[1])}},{"../lib/resolve-exception":122,"./is":127}],127:[function(e,t,r){"use strict";var n=e("../function/is"),i=/^\s*class[\s{/}]/,o=Function.prototype.toString;t.exports=function(e){return!!n(e)&&!i.test(o.call(e))}},{"../function/is":121}],128:[function(e,t,r){"use strict";var n=e("../object/is");t.exports=function(e){if(!n(e))return!1;try{return!!e.constructor&&e.constructor.prototype===e}catch(e){return!1}}},{"../object/is":125}],129:[function(e,t,r){"use strict";var n=e("../value/is"),i=e("../object/is"),o=Object.prototype.toString;t.exports=function(e){if(!n(e))return null;if(i(e)){var t=e.toString;if("function"!=typeof t)return null;if(t===o)return null}try{return""+e}catch(e){return null}}},{"../object/is":125,"../value/is":131}],130:[function(e,t,r){"use strict";var n=e("../lib/resolve-exception"),i=e("./is");t.exports=function(e){return i(e)?e:n(e,"Cannot use %v",arguments[1])}},{"../lib/resolve-exception":122,"./is":131}],131:[function(e,t,r){"use strict";t.exports=function(e){return void 0!==e&&null!==e}},{}],132:[function(e,t,r){"use strict";var n=e("punycode"),i=e("./util");function o(){this.protocol=null,this.slashes=null,this.auth=null,this.host=null,this.port=null,this.hostname=null,this.hash=null,this.search=null,this.query=null,this.pathname=null,this.path=null,this.href=null}r.parse=_,r.resolve=function(e,t){return _(e,!1,!0).resolve(t)},r.resolveObject=function(e,t){return e?_(e,!1,!0).resolveObject(t):t},r.format=function(e){i.isString(e)&&(e=_(e));return e instanceof o?e.format():o.prototype.format.call(e)},r.Url=o;var s=/^([a-z0-9.+-]+:)/i,a=/:[0-9]*$/,u=/^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,c=["{","}","|","\\","^","`"].concat(["<",">",'"',"`"," ","\r","\n","\t"]),l=["'"].concat(c),f=["%","/","?",";","#"].concat(l),p=["/","?","#"],h=/^[+a-z0-9A-Z_-]{0,63}$/,d=/^([+a-z0-9A-Z_-]{0,63})(.*)$/,g={javascript:!0,"javascript:":!0},b={javascript:!0,"javascript:":!0},y={http:!0,https:!0,ftp:!0,gopher:!0,file:!0,"http:":!0,"https:":!0,"ftp:":!0,"gopher:":!0,"file:":!0},m=e("querystring");function _(e,t,r){if(e&&i.isObject(e)&&e instanceof o)return e;var n=new o;return n.parse(e,t,r),n}o.prototype.parse=function(e,t,r){if(!i.isString(e))throw new TypeError("Parameter 'url' must be a string, not "+typeof e);var o=e.indexOf("?"),a=-1!==o&&o<e.indexOf("#")?"?":"#",c=e.split(a);c[0]=c[0].replace(/\\/g,"/");var _=e=c.join(a);if(_=_.trim(),!r&&1===e.split("#").length){var v=u.exec(_);if(v)return this.path=_,this.href=_,this.pathname=v[1],v[2]?(this.search=v[2],this.query=t?m.parse(this.search.substr(1)):this.search.substr(1)):t&&(this.search="",this.query={}),this}var w=s.exec(_);if(w){var S=(w=w[0]).toLowerCase();this.protocol=S,_=_.substr(w.length)}if(r||w||_.match(/^\/\/[^@\/]+@[^@\/]+/)){var x="//"===_.substr(0,2);!x||w&&b[w]||(_=_.substr(2),this.slashes=!0)}if(!b[w]&&(x||w&&!y[w])){for(var k,E,I=-1,C=0;C<p.length;C++){-1!==(O=_.indexOf(p[C]))&&(-1===I||O<I)&&(I=O)}-1!==(E=-1===I?_.lastIndexOf("@"):_.lastIndexOf("@",I))&&(k=_.slice(0,E),_=_.slice(E+1),this.auth=decodeURIComponent(k)),I=-1;for(C=0;C<f.length;C++){var O;-1!==(O=_.indexOf(f[C]))&&(-1===I||O<I)&&(I=O)}-1===I&&(I=_.length),this.host=_.slice(0,I),_=_.slice(I),this.parseHost(),this.hostname=this.hostname||"";var j="["===this.hostname[0]&&"]"===this.hostname[this.hostname.length-1];if(!j)for(var T=this.hostname.split(/\./),A=(C=0,T.length);C<A;C++){var P=T[C];if(P&&!P.match(h)){for(var M="",B=0,R=P.length;B<R;B++)P.charCodeAt(B)>127?M+="x":M+=P[B];if(!M.match(h)){var U=T.slice(0,C),N=T.slice(C+1),L=P.match(d);L&&(U.push(L[1]),N.unshift(L[2])),N.length&&(_="/"+N.join(".")+_),this.hostname=U.join(".");break}}}this.hostname.length>255?this.hostname="":this.hostname=this.hostname.toLowerCase(),j||(this.hostname=n.toASCII(this.hostname));var q=this.port?":"+this.port:"",F=this.hostname||"";this.host=F+q,this.href+=this.host,j&&(this.hostname=this.hostname.substr(1,this.hostname.length-2),"/"!==_[0]&&(_="/"+_))}if(!g[S])for(C=0,A=l.length;C<A;C++){var D=l[C];if(-1!==_.indexOf(D)){var z=encodeURIComponent(D);z===D&&(z=escape(D)),_=_.split(D).join(z)}}var W=_.indexOf("#");-1!==W&&(this.hash=_.substr(W),_=_.slice(0,W));var K=_.indexOf("?");if(-1!==K?(this.search=_.substr(K),this.query=_.substr(K+1),t&&(this.query=m.parse(this.query)),_=_.slice(0,K)):t&&(this.search="",this.query={}),_&&(this.pathname=_),y[S]&&this.hostname&&!this.pathname&&(this.pathname="/"),this.pathname||this.search){q=this.pathname||"";var H=this.search||"";this.path=q+H}return this.href=this.format(),this},o.prototype.format=function(){var e=this.auth||"";e&&(e=(e=encodeURIComponent(e)).replace(/%3A/i,":"),e+="@");var t=this.protocol||"",r=this.pathname||"",n=this.hash||"",o=!1,s="";this.host?o=e+this.host:this.hostname&&(o=e+(-1===this.hostname.indexOf(":")?this.hostname:"["+this.hostname+"]"),this.port&&(o+=":"+this.port)),this.query&&i.isObject(this.query)&&Object.keys(this.query).length&&(s=m.stringify(this.query));var a=this.search||s&&"?"+s||"";return t&&":"!==t.substr(-1)&&(t+=":"),this.slashes||(!t||y[t])&&!1!==o?(o="//"+(o||""),r&&"/"!==r.charAt(0)&&(r="/"+r)):o||(o=""),n&&"#"!==n.charAt(0)&&(n="#"+n),a&&"?"!==a.charAt(0)&&(a="?"+a),t+o+(r=r.replace(/[?#]/g,function(e){return encodeURIComponent(e)}))+(a=a.replace("#","%23"))+n},o.prototype.resolve=function(e){return this.resolveObject(_(e,!1,!0)).format()},o.prototype.resolveObject=function(e){if(i.isString(e)){var t=new o;t.parse(e,!1,!0),e=t}for(var r=new o,n=Object.keys(this),s=0;s<n.length;s++){var a=n[s];r[a]=this[a]}if(r.hash=e.hash,""===e.href)return r.href=r.format(),r;if(e.slashes&&!e.protocol){for(var u=Object.keys(e),c=0;c<u.length;c++){var l=u[c];"protocol"!==l&&(r[l]=e[l])}return y[r.protocol]&&r.hostname&&!r.pathname&&(r.path=r.pathname="/"),r.href=r.format(),r}if(e.protocol&&e.protocol!==r.protocol){if(!y[e.protocol]){for(var f=Object.keys(e),p=0;p<f.length;p++){var h=f[p];r[h]=e[h]}return r.href=r.format(),r}if(r.protocol=e.protocol,e.host||b[e.protocol])r.pathname=e.pathname;else{for(var d=(e.pathname||"").split("/");d.length&&!(e.host=d.shift()););e.host||(e.host=""),e.hostname||(e.hostname=""),""!==d[0]&&d.unshift(""),d.length<2&&d.unshift(""),r.pathname=d.join("/")}if(r.search=e.search,r.query=e.query,r.host=e.host||"",r.auth=e.auth,r.hostname=e.hostname||e.host,r.port=e.port,r.pathname||r.search){var g=r.pathname||"",m=r.search||"";r.path=g+m}return r.slashes=r.slashes||e.slashes,r.href=r.format(),r}var _=r.pathname&&"/"===r.pathname.charAt(0),v=e.host||e.pathname&&"/"===e.pathname.charAt(0),w=v||_||r.host&&e.pathname,S=w,x=r.pathname&&r.pathname.split("/")||[],k=(d=e.pathname&&e.pathname.split("/")||[],r.protocol&&!y[r.protocol]);if(k&&(r.hostname="",r.port=null,r.host&&(""===x[0]?x[0]=r.host:x.unshift(r.host)),r.host="",e.protocol&&(e.hostname=null,e.port=null,e.host&&(""===d[0]?d[0]=e.host:d.unshift(e.host)),e.host=null),w=w&&(""===d[0]||""===x[0])),v)r.host=e.host||""===e.host?e.host:r.host,r.hostname=e.hostname||""===e.hostname?e.hostname:r.hostname,r.search=e.search,r.query=e.query,x=d;else if(d.length)x||(x=[]),x.pop(),x=x.concat(d),r.search=e.search,r.query=e.query;else if(!i.isNullOrUndefined(e.search)){if(k)r.hostname=r.host=x.shift(),(j=!!(r.host&&r.host.indexOf("@")>0)&&r.host.split("@"))&&(r.auth=j.shift(),r.host=r.hostname=j.shift());return r.search=e.search,r.query=e.query,i.isNull(r.pathname)&&i.isNull(r.search)||(r.path=(r.pathname?r.pathname:"")+(r.search?r.search:"")),r.href=r.format(),r}if(!x.length)return r.pathname=null,r.search?r.path="/"+r.search:r.path=null,r.href=r.format(),r;for(var E=x.slice(-1)[0],I=(r.host||e.host||x.length>1)&&("."===E||".."===E)||""===E,C=0,O=x.length;O>=0;O--)"."===(E=x[O])?x.splice(O,1):".."===E?(x.splice(O,1),C++):C&&(x.splice(O,1),C--);if(!w&&!S)for(;C--;C)x.unshift("..");!w||""===x[0]||x[0]&&"/"===x[0].charAt(0)||x.unshift(""),I&&"/"!==x.join("/").substr(-1)&&x.push("");var j,T=""===x[0]||x[0]&&"/"===x[0].charAt(0);k&&(r.hostname=r.host=T?"":x.length?x.shift():"",(j=!!(r.host&&r.host.indexOf("@")>0)&&r.host.split("@"))&&(r.auth=j.shift(),r.host=r.hostname=j.shift()));return(w=w||r.host&&x.length)&&!T&&x.unshift(""),x.length?r.pathname=x.join("/"):(r.pathname=null,r.path=null),i.isNull(r.pathname)&&i.isNull(r.search)||(r.path=(r.pathname?r.pathname:"")+(r.search?r.search:"")),r.auth=e.auth||r.auth,r.slashes=r.slashes||e.slashes,r.href=r.format(),r},o.prototype.parseHost=function(){var e=this.host,t=a.exec(e);t&&(":"!==(t=t[0])&&(this.port=t.substr(1)),e=e.substr(0,e.length-t.length)),e&&(this.hostname=e)}},{"./util":133,punycode:101,querystring:104}],133:[function(e,t,r){"use strict";t.exports={isString:function(e){return"string"==typeof e},isObject:function(e){return"object"==typeof e&&null!==e},isNull:function(e){return null===e},isNullOrUndefined:function(e){return null==e}}},{}],134:[function(e,t,r){(function(e){function r(t){try{if(!e.localStorage)return!1}catch(e){return!1}var r=e.localStorage[t];return null!=r&&"true"===String(r).toLowerCase()}t.exports=function(e,t){if(r("noDeprecation"))return e;var n=!1;return function(){if(!n){if(r("throwDeprecation"))throw new Error(t);r("traceDeprecation")?console.trace(t):console.warn(t),n=!0}return e.apply(this,arguments)}}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],135:[function(e,t,r){t.exports=function(e){return e&&"object"==typeof e&&"function"==typeof e.copy&&"function"==typeof e.fill&&"function"==typeof e.readUInt8}},{}],136:[function(e,t,r){(function(t,n){var i=/%[sdj%]/g;r.format=function(e){if(!y(e)){for(var t=[],r=0;r<arguments.length;r++)t.push(a(arguments[r]));return t.join(" ")}r=1;for(var n=arguments,o=n.length,s=String(e).replace(i,function(e){if("%%"===e)return"%";if(r>=o)return e;switch(e){case"%s":return String(n[r++]);case"%d":return Number(n[r++]);case"%j":try{return JSON.stringify(n[r++])}catch(e){return"[Circular]"}default:return e}}),u=n[r];r<o;u=n[++r])g(u)||!v(u)?s+=" "+u:s+=" "+a(u);return s},r.deprecate=function(e,i){if(m(n.process))return function(){return r.deprecate(e,i).apply(this,arguments)};if(!0===t.noDeprecation)return e;var o=!1;return function(){if(!o){if(t.throwDeprecation)throw new Error(i);t.traceDeprecation?console.trace(i):console.error(i),o=!0}return e.apply(this,arguments)}};var o,s={};function a(e,t){var n={seen:[],stylize:c};return arguments.length>=3&&(n.depth=arguments[2]),arguments.length>=4&&(n.colors=arguments[3]),d(t)?n.showHidden=t:t&&r._extend(n,t),m(n.showHidden)&&(n.showHidden=!1),m(n.depth)&&(n.depth=2),m(n.colors)&&(n.colors=!1),m(n.customInspect)&&(n.customInspect=!0),n.colors&&(n.stylize=u),l(n,e,n.depth)}function u(e,t){var r=a.styles[t];return r?"["+a.colors[r][0]+"m"+e+"["+a.colors[r][1]+"m":e}function c(e,t){return e}function l(e,t,n){if(e.customInspect&&t&&x(t.inspect)&&t.inspect!==r.inspect&&(!t.constructor||t.constructor.prototype!==t)){var i=t.inspect(n,e);return y(i)||(i=l(e,i,n)),i}var o=function(e,t){if(m(t))return e.stylize("undefined","undefined");if(y(t)){var r="'"+JSON.stringify(t).replace(/^"|"$/g,"").replace(/'/g,"\\'").replace(/\\"/g,'"')+"'";return e.stylize(r,"string")}if(b(t))return e.stylize(""+t,"number");if(d(t))return e.stylize(""+t,"boolean");if(g(t))return e.stylize("null","null")}(e,t);if(o)return o;var s=Object.keys(t),a=function(e){var t={};return e.forEach(function(e,r){t[e]=!0}),t}(s);if(e.showHidden&&(s=Object.getOwnPropertyNames(t)),S(t)&&(s.indexOf("message")>=0||s.indexOf("description")>=0))return f(t);if(0===s.length){if(x(t)){var u=t.name?": "+t.name:"";return e.stylize("[Function"+u+"]","special")}if(_(t))return e.stylize(RegExp.prototype.toString.call(t),"regexp");if(w(t))return e.stylize(Date.prototype.toString.call(t),"date");if(S(t))return f(t)}var c,v="",k=!1,E=["{","}"];(h(t)&&(k=!0,E=["[","]"]),x(t))&&(v=" [Function"+(t.name?": "+t.name:"")+"]");return _(t)&&(v=" "+RegExp.prototype.toString.call(t)),w(t)&&(v=" "+Date.prototype.toUTCString.call(t)),S(t)&&(v=" "+f(t)),0!==s.length||k&&0!=t.length?n<0?_(t)?e.stylize(RegExp.prototype.toString.call(t),"regexp"):e.stylize("[Object]","special"):(e.seen.push(t),c=k?function(e,t,r,n,i){for(var o=[],s=0,a=t.length;s<a;++s)C(t,String(s))?o.push(p(e,t,r,n,String(s),!0)):o.push("");return i.forEach(function(i){i.match(/^\d+$/)||o.push(p(e,t,r,n,i,!0))}),o}(e,t,n,a,s):s.map(function(r){return p(e,t,n,a,r,k)}),e.seen.pop(),function(e,t,r){if(e.reduce(function(e,t){return 0,t.indexOf("\n")>=0&&0,e+t.replace(/\u001b\[\d\d?m/g,"").length+1},0)>60)return r[0]+(""===t?"":t+"\n ")+" "+e.join(",\n  ")+" "+r[1];return r[0]+t+" "+e.join(", ")+" "+r[1]}(c,v,E)):E[0]+v+E[1]}function f(e){return"["+Error.prototype.toString.call(e)+"]"}function p(e,t,r,n,i,o){var s,a,u;if((u=Object.getOwnPropertyDescriptor(t,i)||{value:t[i]}).get?a=u.set?e.stylize("[Getter/Setter]","special"):e.stylize("[Getter]","special"):u.set&&(a=e.stylize("[Setter]","special")),C(n,i)||(s="["+i+"]"),a||(e.seen.indexOf(u.value)<0?(a=g(r)?l(e,u.value,null):l(e,u.value,r-1)).indexOf("\n")>-1&&(a=o?a.split("\n").map(function(e){return"  "+e}).join("\n").substr(2):"\n"+a.split("\n").map(function(e){return"   "+e}).join("\n")):a=e.stylize("[Circular]","special")),m(s)){if(o&&i.match(/^\d+$/))return a;(s=JSON.stringify(""+i)).match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)?(s=s.substr(1,s.length-2),s=e.stylize(s,"name")):(s=s.replace(/'/g,"\\'").replace(/\\"/g,'"').replace(/(^"|"$)/g,"'"),s=e.stylize(s,"string"))}return s+": "+a}function h(e){return Array.isArray(e)}function d(e){return"boolean"==typeof e}function g(e){return null===e}function b(e){return"number"==typeof e}function y(e){return"string"==typeof e}function m(e){return void 0===e}function _(e){return v(e)&&"[object RegExp]"===k(e)}function v(e){return"object"==typeof e&&null!==e}function w(e){return v(e)&&"[object Date]"===k(e)}function S(e){return v(e)&&("[object Error]"===k(e)||e instanceof Error)}function x(e){return"function"==typeof e}function k(e){return Object.prototype.toString.call(e)}function E(e){return e<10?"0"+e.toString(10):e.toString(10)}r.debuglog=function(e){if(m(o)&&(o=t.env.NODE_DEBUG||""),e=e.toUpperCase(),!s[e])if(new RegExp("\\b"+e+"\\b","i").test(o)){var n=t.pid;s[e]=function(){var t=r.format.apply(r,arguments);console.error("%s %d: %s",e,n,t)}}else s[e]=function(){};return s[e]},r.inspect=a,a.colors={bold:[1,22],italic:[3,23],underline:[4,24],inverse:[7,27],white:[37,39],grey:[90,39],black:[30,39],blue:[34,39],cyan:[36,39],green:[32,39],magenta:[35,39],red:[31,39],yellow:[33,39]},a.styles={special:"cyan",number:"yellow",boolean:"yellow",undefined:"grey",null:"bold",string:"green",date:"magenta",regexp:"red"},r.isArray=h,r.isBoolean=d,r.isNull=g,r.isNullOrUndefined=function(e){return null==e},r.isNumber=b,r.isString=y,r.isSymbol=function(e){return"symbol"==typeof e},r.isUndefined=m,r.isRegExp=_,r.isObject=v,r.isDate=w,r.isError=S,r.isFunction=x,r.isPrimitive=function(e){return null===e||"boolean"==typeof e||"number"==typeof e||"string"==typeof e||"symbol"==typeof e||void 0===e},r.isBuffer=e("./support/isBuffer");var I=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];function C(e,t){return Object.prototype.hasOwnProperty.call(e,t)}r.log=function(){var e,t;console.log("%s - %s",(e=new Date,t=[E(e.getHours()),E(e.getMinutes()),E(e.getSeconds())].join(":"),[e.getDate(),I[e.getMonth()],t].join(" ")),r.format.apply(r,arguments))},r.inherits=e("inherits"),r._extend=function(e,t){if(!t||!v(t))return e;for(var r=Object.keys(t),n=r.length;n--;)e[r[n]]=t[r[n]];return e}}).call(this,e("_process"),"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./support/isBuffer":135,_process:100,inherits:88}],137:[function(e,t,r){(function(r,n){"use strict";var i=e("readable-stream").Transform,o=e("duplexify"),s=e("ws"),a=e("safe-buffer").Buffer;t.exports=function(e,t,u){var c,l,f="browser"===r.title,p=!!n.WebSocket,h=f?function e(t,r,n){if(l.bufferedAmount>g)return void setTimeout(e,b,t,r,n);y&&"string"==typeof t&&(t=a.from(t,"utf8"));try{l.send(t)}catch(e){return n(e)}n()}:function(e,t,r){if(l.readyState!==l.OPEN)return void r();y&&"string"==typeof e&&(e=a.from(e,"utf8"));l.send(e,r)};t&&!Array.isArray(t)&&"object"==typeof t&&(u=t,t=null,("string"==typeof u.protocol||Array.isArray(u.protocol))&&(t=u.protocol));u||(u={});void 0===u.objectMode&&(u.objectMode=!(!0===u.binary||void 0===u.binary));var d=function(e,t,r){var n=new i({objectMode:e.objectMode});return n._write=t,n._flush=r,n}(u,h,function(e){l.close(),e()});u.objectMode||(d._writev=function(e,t){for(var r=new Array(e.length),n=0;n<e.length;n++)"string"==typeof e[n].chunk?r[n]=a.from(e[n],"utf8"):r[n]=e[n].chunk;this._write(a.concat(r),"binary",t)});var g=u.browserBufferSize||524288,b=u.browserBufferTimeout||1e3;"object"==typeof e?l=e:(l=p&&f?new s(e,t):new s(e,t,u)).binaryType="arraybuffer";l.readyState===l.OPEN?c=d:(c=o.obj(),l.onopen=function(){c.setReadable(d),c.setWritable(d),c.emit("connect")});c.socket=l,l.onclose=function(){c.end(),c.destroy()},l.onerror=function(e){c.destroy(e)},l.onmessage=function(e){var t=e.data;t=t instanceof ArrayBuffer?a.from(t):a.from(t,"utf8");d.push(t)},d.on("close",function(){l.close()});var y=!u.objectMode;return c}}).call(this,e("_process"),"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{_process:100,duplexify:19,"readable-stream":116,"safe-buffer":118,ws:138}],138:[function(e,t,r){var n=null;"undefined"!=typeof WebSocket?n=WebSocket:"undefined"!=typeof MozWebSocket?n=MozWebSocket:"undefined"!=typeof window&&(n=window.WebSocket||window.MozWebSocket),t.exports=n},{}],139:[function(e,t,r){t.exports=function e(t,r){if(t&&r)return e(t)(r);if("function"!=typeof t)throw new TypeError("need wrapper function");Object.keys(t).forEach(function(e){n[e]=t[e]});return n;function n(){for(var e=new Array(arguments.length),r=0;r<e.length;r++)e[r]=arguments[r];var n=t.apply(this,e),i=e[e.length-1];return"function"==typeof n&&n!==i&&Object.keys(i).forEach(function(e){n[e]=i[e]}),n}}},{}],140:[function(e,t,r){t.exports=function(){for(var e={},t=0;t<arguments.length;t++){var r=arguments[t];for(var i in r)n.call(r,i)&&(e[i]=r[i])}return e};var n=Object.prototype.hasOwnProperty},{}]},{},[9])(9)});

// (function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mqtt = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// 	(function (process,global){
// 	'use strict'
	
// 	/**
// 	 * Module dependencies
// 	 */
// 	var events = require('events')
// 	var Store = require('./store')
// 	var mqttPacket = require('mqtt-packet')
// 	var Writable = require('readable-stream').Writable
// 	var inherits = require('inherits')
// 	var reInterval = require('reinterval')
// 	var validations = require('./validations')
// 	var xtend = require('xtend')
// 	var setImmediate = global.setImmediate || function (callback) {
// 		// works in node v0.8
// 		process.nextTick(callback)
// 	}
// 	var defaultConnectOptions = {
// 		keepalive: 60,
// 		reschedulePings: true,
// 		protocolId: 'MQTT',
// 		protocolVersion: 4,
// 		reconnectPeriod: 1000,
// 		connectTimeout: 30 * 1000,
// 		clean: true,
// 		resubscribe: true
// 	}
// 	var errors = {
// 		0: '',
// 		1: 'Unacceptable protocol version',
// 		2: 'Identifier rejected',
// 		3: 'Server unavailable',
// 		4: 'Bad username or password',
// 		5: 'Not authorized',
// 		16: 'No matching subscribers',
// 		17: 'No subscription existed',
// 		128: 'Unspecified error',
// 		129: 'Malformed Packet',
// 		130: 'Protocol Error',
// 		131: 'Implementation specific error',
// 		132: 'Unsupported Protocol Version',
// 		133: 'Client Identifier not valid',
// 		134: 'Bad User Name or Password',
// 		135: 'Not authorized',
// 		136: 'Server unavailable',
// 		137: 'Server busy',
// 		138: 'Banned',
// 		139: 'Server shutting down',
// 		140: 'Bad authentication method',
// 		141: 'Keep Alive timeout',
// 		142: 'Session taken over',
// 		143: 'Topic Filter invalid',
// 		144: 'Topic Name invalid',
// 		145: 'Packet identifier in use',
// 		146: 'Packet Identifier not found',
// 		147: 'Receive Maximum exceeded',
// 		148: 'Topic Alias invalid',
// 		149: 'Packet too large',
// 		150: 'Message rate too high',
// 		151: 'Quota exceeded',
// 		152: 'Administrative action',
// 		153: 'Payload format invalid',
// 		154: 'Retain not supported',
// 		155: 'QoS not supported',
// 		156: 'Use another server',
// 		157: 'Server moved',
// 		158: 'Shared Subscriptions not supported',
// 		159: 'Connection rate exceeded',
// 		160: 'Maximum connect time',
// 		161: 'Subscription Identifiers not supported',
// 		162: 'Wildcard Subscriptions not supported'
// 	}
	
// 	function defaultId () {
// 		return 'mqttjs_' + Math.random().toString(16).substr(2, 8)
// 	}
	
// 	function sendPacket (client, packet, cb) {
// 		client.emit('packetsend', packet)
	
// 		var result = mqttPacket.writeToStream(packet, client.stream, client.options)
	
// 		if (!result && cb) {
// 			client.stream.once('drain', cb)
// 		} else if (cb) {
// 			cb()
// 		}
// 	}
	
// 	function flush (queue) {
// 		if (queue) {
// 			Object.keys(queue).forEach(function (messageId) {
// 				if (typeof queue[messageId] === 'function') {
// 					queue[messageId](new Error('Connection closed'))
// 					delete queue[messageId]
// 				}
// 			})
// 		}
// 	}
	
// 	function storeAndSend (client, packet, cb, cbStorePut) {
// 		client.outgoingStore.put(packet, function storedPacket (err) {
// 			if (err) {
// 				return cb && cb(err)
// 			}
// 			cbStorePut()
// 			sendPacket(client, packet, cb)
// 		})
// 	}
	
// 	function nop () {}
	
// 	/**
// 	 * MqttClient constructor
// 	 *
// 	 * @param {Stream} stream - stream
// 	 * @param {Object} [options] - connection options
// 	 * (see Connection#connect)
// 	 */
// 	function MqttClient (streamBuilder, options) {
// 		var k
// 		var that = this
	
// 		if (!(this instanceof MqttClient)) {
// 			return new MqttClient(streamBuilder, options)
// 		}
	
// 		this.options = options || {}
	
// 		// Defaults
// 		for (k in defaultConnectOptions) {
// 			if (typeof this.options[k] === 'undefined') {
// 				this.options[k] = defaultConnectOptions[k]
// 			} else {
// 				this.options[k] = options[k]
// 			}
// 		}
	
// 		this.options.clientId = (typeof options.clientId === 'string') ? options.clientId : defaultId()
	
// 		this.options.customHandleAcks = (options.protocolVersion === 5 && options.customHandleAcks) ? options.customHandleAcks : function () { arguments[3](0) }
	
// 		this.streamBuilder = streamBuilder
	
// 		// Inflight message storages
// 		this.outgoingStore = options.outgoingStore || new Store()
// 		this.incomingStore = options.incomingStore || new Store()
	
// 		// Should QoS zero messages be queued when the connection is broken?
// 		this.queueQoSZero = options.queueQoSZero === undefined ? true : options.queueQoSZero
	
// 		// map of subscribed topics to support reconnection
// 		this._resubscribeTopics = {}
	
// 		// map of a subscribe messageId and a topic
// 		this.messageIdToTopic = {}
	
// 		// Ping timer, setup in _setupPingTimer
// 		this.pingTimer = null
// 		// Is the client connected?
// 		this.connected = false
// 		// Are we disconnecting?
// 		this.disconnecting = false
// 		// Packet queue
// 		this.queue = []
// 		// connack timer
// 		this.connackTimer = null
// 		// Reconnect timer
// 		this.reconnectTimer = null
// 		// Is processing store?
// 		this._storeProcessing = false
// 		// Packet Ids are put into the store during store processing
// 		this._packetIdsDuringStoreProcessing = {}
// 		/**
// 		 * MessageIDs starting with 1
// 		 * ensure that nextId is min. 1, see https://github.com/mqttjs/MQTT.js/issues/810
// 		 */
// 		this.nextId = Math.max(1, Math.floor(Math.random() * 65535))
	
// 		// Inflight callbacks
// 		this.outgoing = {}
	
// 		// True if connection is first time.
// 		this._firstConnection = true
	
// 		// Mark disconnected on stream close
// 		this.on('close', function () {
// 			this.connected = false
// 			clearTimeout(this.connackTimer)
// 		})
	
// 		// Send queued packets
// 		this.on('connect', function () {
// 			var queue = this.queue
	
// 			function deliver () {
// 				var entry = queue.shift()
// 				var packet = null
	
// 				if (!entry) {
// 					return
// 				}
	
// 				packet = entry.packet
	
// 				that._sendPacket(
// 					packet,
// 					function (err) {
// 						if (entry.cb) {
// 							entry.cb(err)
// 						}
// 						deliver()
// 					}
// 				)
// 			}
	
// 			deliver()
// 		})
	
// 		// Clear ping timer
// 		this.on('close', function () {
// 			if (that.pingTimer !== null) {
// 				that.pingTimer.clear()
// 				that.pingTimer = null
// 			}
// 		})
	
// 		// Setup reconnect timer on disconnect
// 		this.on('close', this._setupReconnect)
	
// 		events.EventEmitter.call(this)
	
// 		this._setupStream()
// 	}
// 	inherits(MqttClient, events.EventEmitter)
	
// 	/**
// 	 * setup the event handlers in the inner stream.
// 	 *
// 	 * @api private
// 	 */
// 	MqttClient.prototype._setupStream = function () {
// 		var connectPacket
// 		var that = this
// 		var writable = new Writable()
// 		var parser = mqttPacket.parser(this.options)
// 		var completeParse = null
// 		var packets = []
	
// 		this._clearReconnect()
	
// 		this.stream = this.streamBuilder(this)
	
// 		parser.on('packet', function (packet) {
// 			packets.push(packet)
// 		})
	
// 		function nextTickWork () {
// 			process.nextTick(work)
// 		}
	
// 		function work () {
// 			var packet = packets.shift()
// 			var done = completeParse
	
// 			if (packet) {
// 				that._handlePacket(packet, nextTickWork)
// 			} else {
// 				completeParse = null
// 				done()
// 			}
// 		}
	
// 		writable._write = function (buf, enc, done) {
// 			completeParse = done
// 			parser.parse(buf)
// 			work()
// 		}
	
// 		this.stream.pipe(writable)
	
// 		// Suppress connection errors
// 		this.stream.on('error', nop)
	
// 		// Echo stream close
// 		this.stream.on('close', function () {
// 			that.emit('close')
// 		})
	
// 		// Send a connect packet
// 		connectPacket = Object.create(this.options)
// 		connectPacket.cmd = 'connect'
// 		// avoid message queue
// 		sendPacket(this, connectPacket)
	
// 		// Echo connection errors
// 		parser.on('error', this.emit.bind(this, 'error'))
	
// 		// auth
// 		if (this.options.properties) {
// 			if (!this.options.properties.authenticationMethod && this.options.properties.authenticationData) {
// 				this.emit('error', new Error('Packet has no Authentication Method'))
// 				return this
// 			}
// 			if (this.options.properties.authenticationMethod && this.options.authPacket && typeof this.options.authPacket === 'object') {
// 				var authPacket = xtend({cmd: 'auth', reasonCode: 0}, this.options.authPacket)
// 				sendPacket(this, authPacket)
// 			}
// 		}
	
// 		// many drain listeners are needed for qos 1 callbacks if the connection is intermittent
// 		this.stream.setMaxListeners(1000)
	
// 		clearTimeout(this.connackTimer)
// 		this.connackTimer = setTimeout(function () {
// 			that._cleanUp(true)
// 		}, this.options.connectTimeout)
// 	}
	
// 	MqttClient.prototype._handlePacket = function (packet, done) {
// 		var options = this.options
	
// 		if (options.protocolVersion === 5 && options.properties && options.properties.maximumPacketSize && options.properties.maximumPacketSize < packet.length) {
// 			this.emit('error', new Error('exceeding packets size ' + packet.cmd))
// 			this.end({reasonCode: 149, properties: { reasonString: 'Maximum packet size was exceeded' }})
// 			return this
// 		}
	
// 		this.emit('packetreceive', packet)
	
// 		switch (packet.cmd) {
// 			case 'publish':
// 				this._handlePublish(packet, done)
// 				break
// 			case 'puback':
// 			case 'pubrec':
// 			case 'pubcomp':
// 			case 'suback':
// 			case 'unsuback':
// 				this._handleAck(packet)
// 				done()
// 				break
// 			case 'pubrel':
// 				this._handlePubrel(packet, done)
// 				break
// 			case 'connack':
// 				this._handleConnack(packet)
// 				done()
// 				break
// 			case 'pingresp':
// 				this._handlePingresp(packet)
// 				done()
// 				break
// 			default:
// 				// do nothing
// 				// maybe we should do an error handling
// 				// or just log it
// 				break
// 		}
// 	}
	
// 	MqttClient.prototype._checkDisconnecting = function (callback) {
// 		if (this.disconnecting) {
// 			if (callback) {
// 				callback(new Error('client disconnecting'))
// 			} else {
// 				this.emit('error', new Error('client disconnecting'))
// 			}
// 		}
// 		return this.disconnecting
// 	}
	
// 	/**
// 	 * publish - publish <message> to <topic>
// 	 *
// 	 * @param {String} topic - topic to publish to
// 	 * @param {String, Buffer} message - message to publish
// 	 * @param {Object} [opts] - publish options, includes:
// 	 *    {Number} qos - qos level to publish on
// 	 *    {Boolean} retain - whether or not to retain the message
// 	 *    {Boolean} dup - whether or not mark a message as duplicate
// 	 *    {Function} cbStorePut - function(){} called when message is put into `outgoingStore`
// 	 * @param {Function} [callback] - function(err){}
// 	 *    called when publish succeeds or fails
// 	 * @returns {MqttClient} this - for chaining
// 	 * @api public
// 	 *
// 	 * @example client.publish('topic', 'message');
// 	 * @example
// 	 *     client.publish('topic', 'message', {qos: 1, retain: true, dup: true});
// 	 * @example client.publish('topic', 'message', console.log);
// 	 */
// 	MqttClient.prototype.publish = function (topic, message, opts, callback) {
// 		var packet
// 		var options = this.options
	
// 		// .publish(topic, payload, cb);
// 		if (typeof opts === 'function') {
// 			callback = opts
// 			opts = null
// 		}
	
// 		// default opts
// 		var defaultOpts = {qos: 0, retain: false, dup: false}
// 		opts = xtend(defaultOpts, opts)
	
// 		if (this._checkDisconnecting(callback)) {
// 			return this
// 		}
	
// 		packet = {
// 			cmd: 'publish',
// 			topic: topic,
// 			payload: message,
// 			qos: opts.qos,
// 			retain: opts.retain,
// 			messageId: this._nextId(),
// 			dup: opts.dup
// 		}
	
// 		if (options.protocolVersion === 5) {
// 			packet.properties = opts.properties
// 			if ((!options.properties && packet.properties && packet.properties.topicAlias) || ((opts.properties && options.properties) &&
// 				((opts.properties.topicAlias && options.properties.topicAliasMaximum && opts.properties.topicAlias > options.properties.topicAliasMaximum) ||
// 					(!options.properties.topicAliasMaximum && opts.properties.topicAlias)))) {
// 				/*
// 				if we are don`t setup topic alias or
// 				topic alias maximum less than topic alias or
// 				server don`t give topic alias maximum,
// 				we are removing topic alias from packet
// 				*/
// 				delete packet.properties.topicAlias
// 			}
// 		}
	
// 		switch (opts.qos) {
// 			case 1:
// 			case 2:
// 				// Add to callbacks
// 				this.outgoing[packet.messageId] = callback || nop
// 				if (this._storeProcessing) {
// 					this._packetIdsDuringStoreProcessing[packet.messageId] = false
// 					this._storePacket(packet, undefined, opts.cbStorePut)
// 				} else {
// 					this._sendPacket(packet, undefined, opts.cbStorePut)
// 				}
// 				break
// 			default:
// 				if (this._storeProcessing) {
// 					this._storePacket(packet, callback, opts.cbStorePut)
// 				} else {
// 					this._sendPacket(packet, callback, opts.cbStorePut)
// 				}
// 				break
// 		}
	
// 		return this
// 	}
	
// 	/**
// 	 * subscribe - subscribe to <topic>
// 	 *
// 	 * @param {String, Array, Object} topic - topic(s) to subscribe to, supports objects in the form {'topic': qos}
// 	 * @param {Object} [opts] - optional subscription options, includes:
// 	 *    {Number} qos - subscribe qos level
// 	 * @param {Function} [callback] - function(err, granted){} where:
// 	 *    {Error} err - subscription error (none at the moment!)
// 	 *    {Array} granted - array of {topic: 't', qos: 0}
// 	 * @returns {MqttClient} this - for chaining
// 	 * @api public
// 	 * @example client.subscribe('topic');
// 	 * @example client.subscribe('topic', {qos: 1});
// 	 * @example client.subscribe({'topic': {qos: 0}, 'topic2': {qos: 1}}, console.log);
// 	 * @example client.subscribe('topic', console.log);
// 	 */
// 	MqttClient.prototype.subscribe = function () {
// 		var packet
// 		var args = new Array(arguments.length)
// 		for (var i = 0; i < arguments.length; i++) {
// 			args[i] = arguments[i]
// 		}
// 		var subs = []
// 		var obj = args.shift()
// 		var resubscribe = obj.resubscribe
// 		var callback = args.pop() || nop
// 		var opts = args.pop()
// 		var invalidTopic
// 		var that = this
// 		var version = this.options.protocolVersion
	
// 		delete obj.resubscribe
	
// 		if (typeof obj === 'string') {
// 			obj = [obj]
// 		}
	
// 		if (typeof callback !== 'function') {
// 			opts = callback
// 			callback = nop
// 		}
	
// 		invalidTopic = validations.validateTopics(obj)
// 		if (invalidTopic !== null) {
// 			setImmediate(callback, new Error('Invalid topic ' + invalidTopic))
// 			return this
// 		}
	
// 		if (this._checkDisconnecting(callback)) {
// 			return this
// 		}
	
// 		var defaultOpts = {
// 			qos: 0
// 		}
// 		if (version === 5) {
// 			defaultOpts.nl = false
// 			defaultOpts.rap = false
// 			defaultOpts.rh = 0
// 		}
// 		opts = xtend(defaultOpts, opts)
	
// 		if (Array.isArray(obj)) {
// 			obj.forEach(function (topic) {
// 				if (!that._resubscribeTopics.hasOwnProperty(topic) ||
// 					that._resubscribeTopics[topic].qos < opts.qos ||
// 						resubscribe) {
// 					var currentOpts = {
// 						topic: topic,
// 						qos: opts.qos
// 					}
// 					if (version === 5) {
// 						currentOpts.nl = opts.nl
// 						currentOpts.rap = opts.rap
// 						currentOpts.rh = opts.rh
// 					}
// 					subs.push(currentOpts)
// 				}
// 			})
// 		} else {
// 			Object
// 				.keys(obj)
// 				.forEach(function (k) {
// 					if (!that._resubscribeTopics.hasOwnProperty(k) ||
// 						that._resubscribeTopics[k].qos < obj[k].qos ||
// 							resubscribe) {
// 						var currentOpts = {
// 							topic: k,
// 							qos: obj[k].qos
// 						}
// 						if (version === 5) {
// 							currentOpts.nl = obj[k].nl
// 							currentOpts.rap = obj[k].rap
// 							currentOpts.rh = obj[k].rh
// 						}
// 						subs.push(currentOpts)
// 					}
// 				})
// 		}
	
// 		packet = {
// 			cmd: 'subscribe',
// 			subscriptions: subs,
// 			qos: 1,
// 			retain: false,
// 			dup: false,
// 			messageId: this._nextId()
// 		}
	
// 		if (opts.properties) {
// 			packet.properties = opts.properties
// 		}
	
// 		if (!subs.length) {
// 			callback(null, [])
// 			return
// 		}
	
// 		// subscriptions to resubscribe to in case of disconnect
// 		if (this.options.resubscribe) {
// 			var topics = []
// 			subs.forEach(function (sub) {
// 				if (that.options.reconnectPeriod > 0) {
// 					var topic = { qos: sub.qos }
// 					if (version === 5) {
// 						topic.nl = sub.nl || false
// 						topic.rap = sub.rap || false
// 						topic.rh = sub.rh || 0
// 					}
// 					that._resubscribeTopics[sub.topic] = topic
// 					topics.push(sub.topic)
// 				}
// 			})
// 			that.messageIdToTopic[packet.messageId] = topics
// 		}
	
// 		this.outgoing[packet.messageId] = function (err, packet) {
// 			if (!err) {
// 				var granted = packet.granted
// 				for (var i = 0; i < granted.length; i += 1) {
// 					subs[i].qos = granted[i]
// 				}
// 			}
	
// 			callback(err, subs)
// 		}
	
// 		this._sendPacket(packet)
	
// 		return this
// 	}
	
// 	/**
// 	 * unsubscribe - unsubscribe from topic(s)
// 	 *
// 	 * @param {String, Array} topic - topics to unsubscribe from
// 	 * @param {Object} [opts] - optional subscription options, includes:
// 	 *    {Object} properties - properties of unsubscribe packet
// 	 * @param {Function} [callback] - callback fired on unsuback
// 	 * @returns {MqttClient} this - for chaining
// 	 * @api public
// 	 * @example client.unsubscribe('topic');
// 	 * @example client.unsubscribe('topic', console.log);
// 	 */
// 	MqttClient.prototype.unsubscribe = function () {
// 		var packet = {
// 			cmd: 'unsubscribe',
// 			qos: 1,
// 			messageId: this._nextId()
// 		}
// 		var that = this
// 		var args = new Array(arguments.length)
// 		for (var i = 0; i < arguments.length; i++) {
// 			args[i] = arguments[i]
// 		}
// 		var topic = args.shift()
// 		var callback = args.pop() || nop
// 		var opts = args.pop()
	
// 		if (typeof topic === 'string') {
// 			topic = [topic]
// 		}
	
// 		if (typeof callback !== 'function') {
// 			opts = callback
// 			callback = nop
// 		}
	
// 		if (this._checkDisconnecting(callback)) {
// 			return this
// 		}
	
// 		if (typeof topic === 'string') {
// 			packet.unsubscriptions = [topic]
// 		} else if (typeof topic === 'object' && topic.length) {
// 			packet.unsubscriptions = topic
// 		}
	
// 		if (this.options.resubscribe) {
// 			packet.unsubscriptions.forEach(function (topic) {
// 				delete that._resubscribeTopics[topic]
// 			})
// 		}
	
// 		if (typeof opts === 'object' && opts.properties) {
// 			packet.properties = opts.properties
// 		}
	
// 		this.outgoing[packet.messageId] = callback
	
// 		this._sendPacket(packet)
	
// 		return this
// 	}
	
// 	/**
// 	 * end - close connection
// 	 *
// 	 * @returns {MqttClient} this - for chaining
// 	 * @param {Boolean} force - do not wait for all in-flight messages to be acked
// 	 * @param {Function} cb - called when the client has been closed
// 	 *
// 	 * @api public
// 	 */
// 	MqttClient.prototype.end = function () {
// 		var that = this
	
// 		var force = arguments[0]
// 		var opts = arguments[1]
// 		var cb = arguments[2]
	
// 		if (force == null || typeof force !== 'boolean') {
// 			cb = opts || nop
// 			opts = force
// 			force = false
// 			if (typeof opts !== 'object') {
// 				cb = opts
// 				opts = null
// 				if (typeof cb !== 'function') {
// 					cb = nop
// 				}
// 			}
// 		}
	
// 		if (typeof opts !== 'object') {
// 			cb = opts
// 			opts = null
// 		}
	
// 		cb = cb || nop
	
// 		function closeStores () {
// 			that.disconnected = true
// 			that.incomingStore.close(function () {
// 				that.outgoingStore.close(function () {
// 					if (cb) {
// 						cb.apply(null, arguments)
// 					}
// 					that.emit('end')
// 				})
// 			})
// 			if (that._deferredReconnect) {
// 				that._deferredReconnect()
// 			}
// 		}
	
// 		function finish () {
// 			// defer closesStores of an I/O cycle,
// 			// just to make sure things are
// 			// ok for websockets
// 			that._cleanUp(force, setImmediate.bind(null, closeStores), opts)
// 		}
	
// 		if (this.disconnecting) {
// 			return this
// 		}
	
// 		this._clearReconnect()
	
// 		this.disconnecting = true
	
// 		if (!force && Object.keys(this.outgoing).length > 0) {
// 			// wait 10ms, just to be sure we received all of it
// 			this.once('outgoingEmpty', setTimeout.bind(null, finish, 10))
// 		} else {
// 			finish()
// 		}
	
// 		return this
// 	}
	
// 	/**
// 	 * removeOutgoingMessage - remove a message in outgoing store
// 	 * the outgoing callback will be called withe Error('Message removed') if the message is removed
// 	 *
// 	 * @param {Number} mid - messageId to remove message
// 	 * @returns {MqttClient} this - for chaining
// 	 * @api public
// 	 *
// 	 * @example client.removeOutgoingMessage(client.getLastMessageId());
// 	 */
// 	MqttClient.prototype.removeOutgoingMessage = function (mid) {
// 		var cb = this.outgoing[mid]
// 		delete this.outgoing[mid]
// 		this.outgoingStore.del({messageId: mid}, function () {
// 			cb(new Error('Message removed'))
// 		})
// 		return this
// 	}
	
// 	/**
// 	 * reconnect - connect again using the same options as connect()
// 	 *
// 	 * @param {Object} [opts] - optional reconnect options, includes:
// 	 *    {Store} incomingStore - a store for the incoming packets
// 	 *    {Store} outgoingStore - a store for the outgoing packets
// 	 *    if opts is not given, current stores are used
// 	 * @returns {MqttClient} this - for chaining
// 	 *
// 	 * @api public
// 	 */
// 	MqttClient.prototype.reconnect = function (opts) {
// 		var that = this
// 		var f = function () {
// 			if (opts) {
// 				that.options.incomingStore = opts.incomingStore
// 				that.options.outgoingStore = opts.outgoingStore
// 			} else {
// 				that.options.incomingStore = null
// 				that.options.outgoingStore = null
// 			}
// 			that.incomingStore = that.options.incomingStore || new Store()
// 			that.outgoingStore = that.options.outgoingStore || new Store()
// 			that.disconnecting = false
// 			that.disconnected = false
// 			that._deferredReconnect = null
// 			that._reconnect()
// 		}
	
// 		if (this.disconnecting && !this.disconnected) {
// 			this._deferredReconnect = f
// 		} else {
// 			f()
// 		}
// 		return this
// 	}
	
// 	/**
// 	 * _reconnect - implement reconnection
// 	 * @api privateish
// 	 */
// 	MqttClient.prototype._reconnect = function () {
// 		this.emit('reconnect')
// 		this._setupStream()
// 	}
	
// 	/**
// 	 * _setupReconnect - setup reconnect timer
// 	 */
// 	MqttClient.prototype._setupReconnect = function () {
// 		var that = this
	
// 		if (!that.disconnecting && !that.reconnectTimer && (that.options.reconnectPeriod > 0)) {
// 			if (!this.reconnecting) {
// 				this.emit('offline')
// 				this.reconnecting = true
// 			}
// 			that.reconnectTimer = setInterval(function () {
// 				that._reconnect()
// 			}, that.options.reconnectPeriod)
// 		}
// 	}
	
// 	/**
// 	 * _clearReconnect - clear the reconnect timer
// 	 */
// 	MqttClient.prototype._clearReconnect = function () {
// 		if (this.reconnectTimer) {
// 			clearInterval(this.reconnectTimer)
// 			this.reconnectTimer = null
// 		}
// 	}
	
// 	/**
// 	 * _cleanUp - clean up on connection end
// 	 * @api private
// 	 */
// 	MqttClient.prototype._cleanUp = function (forced, done) {
// 		var opts = arguments[2]
// 		if (done) {
// 			this.stream.on('close', done)
// 		}
	
// 		if (forced) {
// 			if ((this.options.reconnectPeriod === 0) && this.options.clean) {
// 				flush(this.outgoing)
// 			}
// 			this.stream.destroy()
// 		} else {
// 			var packet = xtend({ cmd: 'disconnect' }, opts)
// 			this._sendPacket(
// 				packet,
// 				setImmediate.bind(
// 					null,
// 					this.stream.end.bind(this.stream)
// 				)
// 			)
// 		}
	
// 		if (!this.disconnecting) {
// 			this._clearReconnect()
// 			this._setupReconnect()
// 		}
	
// 		if (this.pingTimer !== null) {
// 			this.pingTimer.clear()
// 			this.pingTimer = null
// 		}
	
// 		if (done && !this.connected) {
// 			this.stream.removeListener('close', done)
// 			done()
// 		}
// 	}
	
// 	/**
// 	 * _sendPacket - send or queue a packet
// 	 * @param {String} type - packet type (see `protocol`)
// 	 * @param {Object} packet - packet options
// 	 * @param {Function} cb - callback when the packet is sent
// 	 * @param {Function} cbStorePut - called when message is put into outgoingStore
// 	 * @api private
// 	 */
// 	MqttClient.prototype._sendPacket = function (packet, cb, cbStorePut) {
// 		cbStorePut = cbStorePut || nop
	
// 		if (!this.connected) {
// 			this._storePacket(packet, cb, cbStorePut)
// 			return
// 		}
	
// 		// When sending a packet, reschedule the ping timer
// 		this._shiftPingInterval()
	
// 		switch (packet.cmd) {
// 			case 'publish':
// 				break
// 			case 'pubrel':
// 				storeAndSend(this, packet, cb, cbStorePut)
// 				return
// 			default:
// 				sendPacket(this, packet, cb)
// 				return
// 		}
	
// 		switch (packet.qos) {
// 			case 2:
// 			case 1:
// 				storeAndSend(this, packet, cb, cbStorePut)
// 				break
// 			/**
// 			 * no need of case here since it will be caught by default
// 			 * and jshint comply that before default it must be a break
// 			 * anyway it will result in -1 evaluation
// 			 */
// 			case 0:
// 				/* falls through */
// 			default:
// 				sendPacket(this, packet, cb)
// 				break
// 		}
// 	}
	
// 	/**
// 	 * _storePacket - queue a packet
// 	 * @param {String} type - packet type (see `protocol`)
// 	 * @param {Object} packet - packet options
// 	 * @param {Function} cb - callback when the packet is sent
// 	 * @param {Function} cbStorePut - called when message is put into outgoingStore
// 	 * @api private
// 	 */
// 	MqttClient.prototype._storePacket = function (packet, cb, cbStorePut) {
// 		cbStorePut = cbStorePut || nop
	
// 		if (((packet.qos || 0) === 0 && this.queueQoSZero) || packet.cmd !== 'publish') {
// 			this.queue.push({ packet: packet, cb: cb })
// 		} else if (packet.qos > 0) {
// 			cb = this.outgoing[packet.messageId]
// 			this.outgoingStore.put(packet, function (err) {
// 				if (err) {
// 					return cb && cb(err)
// 				}
// 				cbStorePut()
// 			})
// 		} else if (cb) {
// 			cb(new Error('No connection to broker'))
// 		}
// 	}
	
// 	/**
// 	 * _setupPingTimer - setup the ping timer
// 	 *
// 	 * @api private
// 	 */
// 	MqttClient.prototype._setupPingTimer = function () {
// 		var that = this
	
// 		if (!this.pingTimer && this.options.keepalive) {
// 			this.pingResp = true
// 			this.pingTimer = reInterval(function () {
// 				that._checkPing()
// 			}, this.options.keepalive * 1000)
// 		}
// 	}
	
// 	/**
// 	 * _shiftPingInterval - reschedule the ping interval
// 	 *
// 	 * @api private
// 	 */
// 	MqttClient.prototype._shiftPingInterval = function () {
// 		if (this.pingTimer && this.options.keepalive && this.options.reschedulePings) {
// 			this.pingTimer.reschedule(this.options.keepalive * 1000)
// 		}
// 	}
// 	/**
// 	 * _checkPing - check if a pingresp has come back, and ping the server again
// 	 *
// 	 * @api private
// 	 */
// 	MqttClient.prototype._checkPing = function () {
// 		if (this.pingResp) {
// 			this.pingResp = false
// 			this._sendPacket({ cmd: 'pingreq' })
// 		} else {
// 			// do a forced cleanup since socket will be in bad shape
// 			this._cleanUp(true)
// 		}
// 	}
	
// 	/**
// 	 * _handlePingresp - handle a pingresp
// 	 *
// 	 * @api private
// 	 */
// 	MqttClient.prototype._handlePingresp = function () {
// 		this.pingResp = true
// 	}
	
// 	/**
// 	 * _handleConnack
// 	 *
// 	 * @param {Object} packet
// 	 * @api private
// 	 */
	
// 	MqttClient.prototype._handleConnack = function (packet) {
// 		var options = this.options
// 		var version = options.protocolVersion
// 		var rc = version === 5 ? packet.reasonCode : packet.returnCode
	
// 		clearTimeout(this.connackTimer)
	
// 		if (packet.properties) {
// 			if (packet.properties.topicAliasMaximum) {
// 				if (!options.properties) { options.properties = {} }
// 				options.properties.topicAliasMaximum = packet.properties.topicAliasMaximum
// 			}
// 			if (packet.properties.serverKeepAlive && options.keepalive) {
// 				options.keepalive = packet.properties.serverKeepAlive
// 				this._shiftPingInterval()
// 			}
// 			if (packet.properties.maximumPacketSize) {
// 				if (!options.properties) { options.properties = {} }
// 				options.properties.maximumPacketSize = packet.properties.maximumPacketSize
// 			}
// 		}
	
// 		if (rc === 0) {
// 			this.reconnecting = false
// 			this._onConnect(packet)
// 		} else if (rc > 0) {
// 			var err = new Error('Connection refused: ' + errors[rc])
// 			err.code = rc
// 			this.emit('error', err)
// 		}
// 	}
	
// 	/**
// 	 * _handlePublish
// 	 *
// 	 * @param {Object} packet
// 	 * @api private
// 	 */
// 	/*
// 	those late 2 case should be rewrite to comply with coding style:
	
// 	case 1:
// 	case 0:
// 		// do not wait sending a puback
// 		// no callback passed
// 		if (1 === qos) {
// 			this._sendPacket({
// 				cmd: 'puback',
// 				messageId: mid
// 			});
// 		}
// 		// emit the message event for both qos 1 and 0
// 		this.emit('message', topic, message, packet);
// 		this.handleMessage(packet, done);
// 		break;
// 	default:
// 		// do nothing but every switch mus have a default
// 		// log or throw an error about unknown qos
// 		break;
	
// 	for now i just suppressed the warnings
// 	*/
// 	MqttClient.prototype._handlePublish = function (packet, done) {
// 		done = typeof done !== 'undefined' ? done : nop
// 		var topic = packet.topic.toString()
// 		var message = packet.payload
// 		var qos = packet.qos
// 		var mid = packet.messageId
// 		var that = this
// 		var options = this.options
// 		var validReasonCodes = [0, 16, 128, 131, 135, 144, 145, 151, 153]
	
// 		switch (qos) {
// 			case 2: {
// 				options.customHandleAcks(topic, message, packet, function (error, code) {
// 					if (!(error instanceof Error)) {
// 						code = error
// 						error = null
// 					}
// 					if (error) { return that.emit('error', error) }
// 					if (validReasonCodes.indexOf(code) === -1) { return that.emit('error', new Error('Wrong reason code for pubrec')) }
// 					if (code) {
// 						that._sendPacket({cmd: 'pubrec', messageId: mid, reasonCode: code}, done)
// 					} else {
// 						that.incomingStore.put(packet, function () {
// 							that._sendPacket({cmd: 'pubrec', messageId: mid}, done)
// 						})
// 					}
// 				})
// 				break
// 			}
// 			case 1: {
// 				// emit the message event
// 				options.customHandleAcks(topic, message, packet, function (error, code) {
// 					if (!(error instanceof Error)) {
// 						code = error
// 						error = null
// 					}
// 					if (error) { return that.emit('error', error) }
// 					if (validReasonCodes.indexOf(code) === -1) { return that.emit('error', new Error('Wrong reason code for puback')) }
// 					if (!code) { that.emit('message', topic, message, packet) }
// 					that.handleMessage(packet, function (err) {
// 						if (err) {
// 							return done && done(err)
// 						}
// 						that._sendPacket({cmd: 'puback', messageId: mid, reasonCode: code}, done)
// 					})
// 				})
// 				break
// 			}
// 			case 0:
// 				// emit the message event
// 				this.emit('message', topic, message, packet)
// 				this.handleMessage(packet, done)
// 				break
// 			default:
// 				// do nothing
// 				// log or throw an error about unknown qos
// 				break
// 		}
// 	}
	
// 	/**
// 	 * Handle messages with backpressure support, one at a time.
// 	 * Override at will.
// 	 *
// 	 * @param Packet packet the packet
// 	 * @param Function callback call when finished
// 	 * @api public
// 	 */
// 	MqttClient.prototype.handleMessage = function (packet, callback) {
// 		callback()
// 	}
	
// 	/**
// 	 * _handleAck
// 	 *
// 	 * @param {Object} packet
// 	 * @api private
// 	 */
	
// 	MqttClient.prototype._handleAck = function (packet) {
// 		/* eslint no-fallthrough: "off" */
// 		var mid = packet.messageId
// 		var type = packet.cmd
// 		var response = null
// 		var cb = this.outgoing[mid]
// 		var that = this
// 		var err
	
// 		if (!cb) {
// 			// Server sent an ack in error, ignore it.
// 			return
// 		}
	
// 		// Process
// 		switch (type) {
// 			case 'pubcomp':
// 				// same thing as puback for QoS 2
// 			case 'puback':
// 				var pubackRC = packet.reasonCode
// 				// Callback - we're done
// 				if (pubackRC && pubackRC > 0 && pubackRC !== 16) {
// 					err = new Error('Publish error: ' + errors[pubackRC])
// 					err.code = pubackRC
// 					cb(err, packet)
// 				}
// 				delete this.outgoing[mid]
// 				this.outgoingStore.del(packet, cb)
// 				break
// 			case 'pubrec':
// 				response = {
// 					cmd: 'pubrel',
// 					qos: 2,
// 					messageId: mid
// 				}
// 				var pubrecRC = packet.reasonCode
	
// 				if (pubrecRC && pubrecRC > 0 && pubrecRC !== 16) {
// 					err = new Error('Publish error: ' + errors[pubrecRC])
// 					err.code = pubrecRC
// 					cb(err, packet)
// 				} else {
// 					this._sendPacket(response)
// 				}
// 				break
// 			case 'suback':
// 				delete this.outgoing[mid]
// 				for (var grantedI = 0; grantedI < packet.granted.length; grantedI++) {
// 					if ((packet.granted[grantedI] & 0x80) !== 0) {
// 						// suback with Failure status
// 						var topics = this.messageIdToTopic[mid]
// 						if (topics) {
// 							topics.forEach(function (topic) {
// 								delete that._resubscribeTopics[topic]
// 							})
// 						}
// 					}
// 				}
// 				cb(null, packet)
// 				break
// 			case 'unsuback':
// 				delete this.outgoing[mid]
// 				cb(null)
// 				break
// 			default:
// 				that.emit('error', new Error('unrecognized packet type'))
// 		}
	
// 		if (this.disconnecting &&
// 				Object.keys(this.outgoing).length === 0) {
// 			this.emit('outgoingEmpty')
// 		}
// 	}
	
// 	/**
// 	 * _handlePubrel
// 	 *
// 	 * @param {Object} packet
// 	 * @api private
// 	 */
// 	MqttClient.prototype._handlePubrel = function (packet, callback) {
// 		callback = typeof callback !== 'undefined' ? callback : nop
// 		var mid = packet.messageId
// 		var that = this
	
// 		var comp = {cmd: 'pubcomp', messageId: mid}
	
// 		that.incomingStore.get(packet, function (err, pub) {
// 			if (!err) {
// 				that.emit('message', pub.topic, pub.payload, pub)
// 				that.handleMessage(pub, function (err) {
// 					if (err) {
// 						return callback(err)
// 					}
// 					that.incomingStore.del(pub, nop)
// 					that._sendPacket(comp, callback)
// 				})
// 			} else {
// 				that._sendPacket(comp, callback)
// 			}
// 		})
// 	}
	
// 	/**
// 	 * _nextId
// 	 * @return unsigned int
// 	 */
// 	MqttClient.prototype._nextId = function () {
// 		// id becomes current state of this.nextId and increments afterwards
// 		var id = this.nextId++
// 		// Ensure 16 bit unsigned int (max 65535, nextId got one higher)
// 		if (this.nextId === 65536) {
// 			this.nextId = 1
// 		}
// 		return id
// 	}
	
// 	/**
// 	 * getLastMessageId
// 	 * @return unsigned int
// 	 */
// 	MqttClient.prototype.getLastMessageId = function () {
// 		return (this.nextId === 1) ? 65535 : (this.nextId - 1)
// 	}
	
// 	/**
// 	 * _resubscribe
// 	 * @api private
// 	 */
// 	MqttClient.prototype._resubscribe = function (connack) {
// 		if (!this._firstConnection &&
// 				(this.options.clean || (this.options.protocolVersion === 5 && !connack.sessionPresent)) &&
// 				Object.keys(this._resubscribeTopics).length > 0) {
// 			if (this.options.resubscribe) {
// 				this._resubscribeTopics.resubscribe = true
// 				this.subscribe(this._resubscribeTopics)
// 			} else {
// 				this._resubscribeTopics = {}
// 			}
// 		}
	
// 		this._firstConnection = false
// 	}
	
// 	/**
// 	 * _onConnect
// 	 *
// 	 * @api private
// 	 */
// 	MqttClient.prototype._onConnect = function (packet) {
// 		if (this.disconnected) {
// 			this.emit('connect', packet)
// 			return
// 		}
	
// 		var that = this
	
// 		this._setupPingTimer()
// 		this._resubscribe(packet)
	
// 		this.connected = true
	
// 		function startStreamProcess () {
// 			var outStore = that.outgoingStore.createStream()
	
// 			function clearStoreProcessing () {
// 				that._storeProcessing = false
// 				that._packetIdsDuringStoreProcessing = {}
// 			}
	
// 			that.once('close', remove)
// 			outStore.on('error', function (err) {
// 				clearStoreProcessing()
// 				that.removeListener('close', remove)
// 				that.emit('error', err)
// 			})
	
// 			function remove () {
// 				outStore.destroy()
// 				outStore = null
// 				clearStoreProcessing()
// 			}
	
// 			function storeDeliver () {
// 				// edge case, we wrapped this twice
// 				if (!outStore) {
// 					return
// 				}
// 				that._storeProcessing = true
	
// 				var packet = outStore.read(1)
	
// 				var cb
	
// 				if (!packet) {
// 					// read when data is available in the future
// 					outStore.once('readable', storeDeliver)
// 					return
// 				}
	
// 				// Skip already processed store packets
// 				if (that._packetIdsDuringStoreProcessing[packet.messageId]) {
// 					storeDeliver()
// 					return
// 				}
	
// 				// Avoid unnecessary stream read operations when disconnected
// 				if (!that.disconnecting && !that.reconnectTimer) {
// 					cb = that.outgoing[packet.messageId]
// 					that.outgoing[packet.messageId] = function (err, status) {
// 						// Ensure that the original callback passed in to publish gets invoked
// 						if (cb) {
// 							cb(err, status)
// 						}
	
// 						storeDeliver()
// 					}
// 					that._packetIdsDuringStoreProcessing[packet.messageId] = true
// 					that._sendPacket(packet)
// 				} else if (outStore.destroy) {
// 					outStore.destroy()
// 				}
// 			}
	
// 			outStore.on('end', function () {
// 				var allProcessed = true
// 				for (var id in that._packetIdsDuringStoreProcessing) {
// 					if (!that._packetIdsDuringStoreProcessing[id]) {
// 						allProcessed = false
// 						break
// 					}
// 				}
// 				if (allProcessed) {
// 					clearStoreProcessing()
// 					that.removeListener('close', remove)
// 					that.emit('connect', packet)
// 				} else {
// 					startStreamProcess()
// 				}
// 			})
// 			storeDeliver()
// 		}
// 		// start flowing
// 		startStreamProcess()
// 	}
	
// 	module.exports = MqttClient
	
// 	}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
// 	},{"./store":7,"./validations":8,"_process":92,"events":13,"inherits":80,"mqtt-packet":84,"readable-stream":108,"reinterval":109,"xtend":121}],2:[function(require,module,exports){
// 	(function (Buffer){
// 	'use strict'
	
// 	var Transform = require('readable-stream').Transform
// 	var duplexify = require('duplexify')
// 	var base64 = require('base64-js')
	
// 	/* global FileReader */
// 	var my
// 	var proxy
// 	var stream
// 	var isInitialized = false
	
// 	function buildProxy () {
// 		var proxy = new Transform()
// 		proxy._write = function (chunk, encoding, next) {
// 			my.sendSocketMessage({
// 				data: chunk.buffer,
// 				success: function () {
// 					next()
// 				},
// 				fail: function () {
// 					next(new Error())
// 				}
// 			})
// 		}
// 		proxy._flush = function socketEnd (done) {
// 			my.closeSocket({
// 				success: function () {
// 					done()
// 				}
// 			})
// 		}
	
// 		return proxy
// 	}
	
// 	function setDefaultOpts (opts) {
// 		if (!opts.hostname) {
// 			opts.hostname = 'localhost'
// 		}
// 		if (!opts.path) {
// 			opts.path = '/'
// 		}
	
// 		if (!opts.wsOptions) {
// 			opts.wsOptions = {}
// 		}
// 	}
	
// 	function buildUrl (opts, client) {
// 		var protocol = opts.protocol === 'alis' ? 'wss' : 'ws'
// 		var url = protocol + '://' + opts.hostname + opts.path
// 		if (opts.port && opts.port !== 80 && opts.port !== 443) {
// 			url = protocol + '://' + opts.hostname + ':' + opts.port + opts.path
// 		}
// 		if (typeof (opts.transformWsUrl) === 'function') {
// 			url = opts.transformWsUrl(url, opts, client)
// 		}
// 		return url
// 	}
	
// 	function bindEventHandler () {
// 		if (isInitialized) return
	
// 		isInitialized = true
	
// 		my.onSocketOpen(function () {
// 			stream.setReadable(proxy)
// 			stream.setWritable(proxy)
// 			stream.emit('connect')
// 		})
	
// 		my.onSocketMessage(function (res) {
// 			if (typeof res.data === 'string') {
// 				var array = base64.toByteArray(res.data)
// 				var buffer = Buffer.from(array)
// 				proxy.push(buffer)
// 			} else {
// 				var reader = new FileReader()
// 				reader.addEventListener('load', function () {
// 					var data = reader.result
	
// 					if (data instanceof ArrayBuffer) data = Buffer.from(data)
// 					else data = Buffer.from(data, 'utf8')
// 					proxy.push(data)
// 				})
// 				reader.readAsArrayBuffer(res.data)
// 			}
// 		})
	
// 		my.onSocketClose(function () {
// 			stream.end()
// 			stream.destroy()
// 		})
	
// 		my.onSocketError(function (res) {
// 			stream.destroy(res)
// 		})
// 	}
	
// 	function buildStream (client, opts) {
// 		opts.hostname = opts.hostname || opts.host
	
// 		if (!opts.hostname) {
// 			throw new Error('Could not determine host. Specify host manually.')
// 		}
	
// 		var websocketSubProtocol =
// 			(opts.protocolId === 'MQIsdp') && (opts.protocolVersion === 3)
// 				? 'mqttv3.1'
// 				: 'mqtt'
	
// 		setDefaultOpts(opts)
	
// 		var url = buildUrl(opts, client)
// 		my = opts.my
// 		my.connectSocket({
// 			url: url,
// 			protocols: websocketSubProtocol
// 		})
	
// 		proxy = buildProxy()
// 		stream = duplexify.obj()
	
// 		bindEventHandler()
	
// 		return stream
// 	}
	
// 	module.exports = buildStream
	
// 	}).call(this,require("buffer").Buffer)
// 	},{"base64-js":10,"buffer":12,"duplexify":17,"readable-stream":108}],3:[function(require,module,exports){
// 	'use strict'
// 	var net = require('net')
	
// 	/*
// 		variables port and host can be removed since
// 		you have all required information in opts object
// 	*/
// 	function buildBuilder (client, opts) {
// 		var port, host
// 		opts.port = opts.port || 1883
// 		opts.hostname = opts.hostname || opts.host || 'localhost'
	
// 		port = opts.port
// 		host = opts.hostname
	
// 		return net.createConnection(port, host)
// 	}
	
// 	module.exports = buildBuilder
	
// 	},{"net":11}],4:[function(require,module,exports){
// 	'use strict'
// 	var tls = require('tls')
	
// 	function buildBuilder (mqttClient, opts) {
// 		var connection
// 		opts.port = opts.port || 8883
// 		opts.host = opts.hostname || opts.host || 'localhost'
	
// 		opts.rejectUnauthorized = opts.rejectUnauthorized !== false
	
// 		delete opts.path
	
// 		connection = tls.connect(opts)
// 		/* eslint no-use-before-define: [2, "nofunc"] */
// 		connection.on('secureConnect', function () {
// 			if (opts.rejectUnauthorized && !connection.authorized) {
// 				connection.emit('error', new Error('TLS not authorized'))
// 			} else {
// 				connection.removeListener('error', handleTLSerrors)
// 			}
// 		})
	
// 		function handleTLSerrors (err) {
// 			// How can I get verify this error is a tls error?
// 			if (opts.rejectUnauthorized) {
// 				mqttClient.emit('error', err)
// 			}
	
// 			// close this connection to match the behaviour of net
// 			// otherwise all we get is an error from the connection
// 			// and close event doesn't fire. This is a work around
// 			// to enable the reconnect code to work the same as with
// 			// net.createConnection
// 			connection.end()
// 		}
	
// 		connection.on('error', handleTLSerrors)
// 		return connection
// 	}
	
// 	module.exports = buildBuilder
	
// 	},{"tls":11}],5:[function(require,module,exports){
// 	(function (process){
// 	'use strict'
	
// 	var websocket = require('websocket-stream')
// 	var urlModule = require('url')
// 	var WSS_OPTIONS = [
// 		'rejectUnauthorized',
// 		'ca',
// 		'cert',
// 		'key',
// 		'pfx',
// 		'passphrase'
// 	]
// 	var IS_BROWSER = process.title === 'browser'
	
// 	function buildUrl (opts, client) {
// 		var url = opts.protocol + '://' + opts.hostname + ':' + opts.port + opts.path
// 		if (typeof (opts.transformWsUrl) === 'function') {
// 			url = opts.transformWsUrl(url, opts, client)
// 		}
// 		return url
// 	}
	
// 	function setDefaultOpts (opts) {
// 		if (!opts.hostname) {
// 			opts.hostname = 'localhost'
// 		}
// 		if (!opts.port) {
// 			if (opts.protocol === 'wss') {
// 				opts.port = 443
// 			} else {
// 				opts.port = 80
// 			}
// 		}
// 		if (!opts.path) {
// 			opts.path = '/'
// 		}
	
// 		if (!opts.wsOptions) {
// 			opts.wsOptions = {}
// 		}
// 		if (!IS_BROWSER && opts.protocol === 'wss') {
// 			// Add cert/key/ca etc options
// 			WSS_OPTIONS.forEach(function (prop) {
// 				if (opts.hasOwnProperty(prop) && !opts.wsOptions.hasOwnProperty(prop)) {
// 					opts.wsOptions[prop] = opts[prop]
// 				}
// 			})
// 		}
// 	}
	
// 	function createWebSocket (client, opts) {
// 		var websocketSubProtocol =
// 			(opts.protocolId === 'MQIsdp') && (opts.protocolVersion === 3)
// 				? 'mqttv3.1'
// 				: 'mqtt'
	
// 		setDefaultOpts(opts)
// 		var url = buildUrl(opts, client)
// 		return websocket(url, [websocketSubProtocol], opts.wsOptions)
// 	}
	
// 	function buildBuilder (client, opts) {
// 		return createWebSocket(client, opts)
// 	}
	
// 	function buildBuilderBrowser (client, opts) {
// 		if (!opts.hostname) {
// 			opts.hostname = opts.host
// 		}
	
// 		if (!opts.hostname) {
// 			// Throwing an error in a Web Worker if no `hostname` is given, because we
// 			// can not determine the `hostname` automatically.  If connecting to
// 			// localhost, please supply the `hostname` as an argument.
// 			if (typeof (document) === 'undefined') {
// 				throw new Error('Could not determine host. Specify host manually.')
// 			}
// 			var parsed = urlModule.parse(document.URL)
// 			opts.hostname = parsed.hostname
	
// 			if (!opts.port) {
// 				opts.port = parsed.port
// 			}
// 		}
// 		return createWebSocket(client, opts)
// 	}
	
// 	if (IS_BROWSER) {
// 		module.exports = buildBuilderBrowser
// 	} else {
// 		module.exports = buildBuilder
// 	}
	
// 	}).call(this,require('_process'))
// 	},{"_process":92,"url":113,"websocket-stream":118}],6:[function(require,module,exports){
// 	(function (process,Buffer){
// 	'use strict'
	
// 	var Transform = require('readable-stream').Transform
// 	var duplexify = require('duplexify')
	
// 	/* global wx */
// 	var socketTask
// 	var proxy
// 	var stream
	
// 	function buildProxy () {
// 		var proxy = new Transform()
// 		proxy._write = function (chunk, encoding, next) {
// 			socketTask.send({
// 				data: chunk.buffer,
// 				success: function () {
// 					next()
// 				},
// 				fail: function (errMsg) {
// 					next(new Error(errMsg))
// 				}
// 			})
// 		}
// 		proxy._flush = function socketEnd (done) {
// 			socketTask.close({
// 				success: function () {
// 					done()
// 				}
// 			})
// 		}
	
// 		return proxy
// 	}
	
// 	function setDefaultOpts (opts) {
// 		if (!opts.hostname) {
// 			opts.hostname = 'localhost'
// 		}
// 		if (!opts.path) {
// 			opts.path = '/'
// 		}
	
// 		if (!opts.wsOptions) {
// 			opts.wsOptions = {}
// 		}
// 	}
	
// 	function buildUrl (opts, client) {
// 		var protocol = opts.protocol === 'wxs' ? 'wss' : 'ws'
// 		var url = protocol + '://' + opts.hostname + opts.path
// 		if (opts.port && opts.port !== 80 && opts.port !== 443) {
// 			url = protocol + '://' + opts.hostname + ':' + opts.port + opts.path
// 		}
// 		if (typeof (opts.transformWsUrl) === 'function') {
// 			url = opts.transformWsUrl(url, opts, client)
// 		}
// 		return url
// 	}
	
// 	function bindEventHandler () {
// 		socketTask.onOpen(function () {
// 			stream.setReadable(proxy)
// 			stream.setWritable(proxy)
// 			stream.emit('connect')
// 		})
	
// 		socketTask.onMessage(function (res) {
// 			var data = res.data
	
// 			if (data instanceof ArrayBuffer) data = Buffer.from(data)
// 			else data = Buffer.from(data, 'utf8')
// 			proxy.push(data)
// 		})
	
// 		socketTask.onClose(function () {
// 			stream.end()
// 			stream.destroy()
// 		})
	
// 		socketTask.onError(function (res) {
// 			stream.destroy(new Error(res.errMsg))
// 		})
// 	}
	
// 	function buildStream (client, opts) {
// 		opts.hostname = opts.hostname || opts.host
	
// 		if (!opts.hostname) {
// 			throw new Error('Could not determine host. Specify host manually.')
// 		}
	
// 		var websocketSubProtocol =
// 			(opts.protocolId === 'MQIsdp') && (opts.protocolVersion === 3)
// 				? 'mqttv3.1'
// 				: 'mqtt'
	
// 		setDefaultOpts(opts)
	
// 		var url = buildUrl(opts, client)
// 		socketTask = wx.connectSocket({
// 			url: url,
// 			protocols: websocketSubProtocol
// 		})
	
// 		proxy = buildProxy()
// 		stream = duplexify.obj()
// 		stream._destroy = function (err, cb) {
// 			socketTask.close({
// 				success: function () {
// 					cb && cb(err)
// 				}
// 			})
// 		}
	
// 		var destroyRef = stream.destroy
// 		stream.destroy = function () {
// 			stream.destroy = destroyRef
	
// 			var self = this
// 			process.nextTick(function () {
// 				socketTask.close({
// 					fail: function () {
// 						self._destroy(new Error())
// 					}
// 				})
// 			})
// 		}.bind(stream)
	
// 		bindEventHandler()
	
// 		return stream
// 	}
	
// 	module.exports = buildStream
	
// 	}).call(this,require('_process'),require("buffer").Buffer)
// 	},{"_process":92,"buffer":12,"duplexify":17,"readable-stream":108}],7:[function(require,module,exports){
// 	(function (process){
// 	'use strict'
	
// 	/**
// 	 * Module dependencies
// 	 */
// 	var xtend = require('xtend')
	
// 	var Readable = require('readable-stream').Readable
// 	var streamsOpts = { objectMode: true }
// 	var defaultStoreOptions = {
// 		clean: true
// 	}
	
// 	/**
// 	 * es6-map can preserve insertion order even if ES version is older.
// 	 *
// 	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Description
// 	 * It should be noted that a Map which is a map of an object, especially
// 	 * a dictionary of dictionaries, will only map to the object's insertion
// 	 * order. In ES2015 this is ordered for objects but for older versions of
// 	 * ES, this may be random and not ordered.
// 	 *
// 	 */
// 	var Map = require('es6-map')
	
// 	/**
// 	 * In-memory implementation of the message store
// 	 * This can actually be saved into files.
// 	 *
// 	 * @param {Object} [options] - store options
// 	 */
// 	function Store (options) {
// 		if (!(this instanceof Store)) {
// 			return new Store(options)
// 		}
	
// 		this.options = options || {}
	
// 		// Defaults
// 		this.options = xtend(defaultStoreOptions, options)
	
// 		this._inflights = new Map()
// 	}
	
// 	/**
// 	 * Adds a packet to the store, a packet is
// 	 * anything that has a messageId property.
// 	 *
// 	 */
// 	Store.prototype.put = function (packet, cb) {
// 		this._inflights.set(packet.messageId, packet)
	
// 		if (cb) {
// 			cb()
// 		}
	
// 		return this
// 	}
	
// 	/**
// 	 * Creates a stream with all the packets in the store
// 	 *
// 	 */
// 	Store.prototype.createStream = function () {
// 		var stream = new Readable(streamsOpts)
// 		var destroyed = false
// 		var values = []
// 		var i = 0
	
// 		this._inflights.forEach(function (value, key) {
// 			values.push(value)
// 		})
	
// 		stream._read = function () {
// 			if (!destroyed && i < values.length) {
// 				this.push(values[i++])
// 			} else {
// 				this.push(null)
// 			}
// 		}
	
// 		stream.destroy = function () {
// 			if (destroyed) {
// 				return
// 			}
	
// 			var self = this
	
// 			destroyed = true
	
// 			process.nextTick(function () {
// 				self.emit('close')
// 			})
// 		}
	
// 		return stream
// 	}
	
// 	/**
// 	 * deletes a packet from the store.
// 	 */
// 	Store.prototype.del = function (packet, cb) {
// 		packet = this._inflights.get(packet.messageId)
// 		if (packet) {
// 			this._inflights.delete(packet.messageId)
// 			cb(null, packet)
// 		} else if (cb) {
// 			cb(new Error('missing packet'))
// 		}
	
// 		return this
// 	}
	
// 	/**
// 	 * get a packet from the store.
// 	 */
// 	Store.prototype.get = function (packet, cb) {
// 		packet = this._inflights.get(packet.messageId)
// 		if (packet) {
// 			cb(null, packet)
// 		} else if (cb) {
// 			cb(new Error('missing packet'))
// 		}
	
// 		return this
// 	}
	
// 	/**
// 	 * Close the store
// 	 */
// 	Store.prototype.close = function (cb) {
// 		if (this.options.clean) {
// 			this._inflights = null
// 		}
// 		if (cb) {
// 			cb()
// 		}
// 	}
	
// 	module.exports = Store
	
// 	}).call(this,require('_process'))
// 	},{"_process":92,"es6-map":67,"readable-stream":108,"xtend":121}],8:[function(require,module,exports){
// 	'use strict'
	
// 	/**
// 	 * Validate a topic to see if it's valid or not.
// 	 * A topic is valid if it follow below rules:
// 	 * - Rule #1: If any part of the topic is not `+` or `#`, then it must not contain `+` and '#'
// 	 * - Rule #2: Part `#` must be located at the end of the mailbox
// 	 *
// 	 * @param {String} topic - A topic
// 	 * @returns {Boolean} If the topic is valid, returns true. Otherwise, returns false.
// 	 */
// 	function validateTopic (topic) {
// 		var parts = topic.split('/')
	
// 		for (var i = 0; i < parts.length; i++) {
// 			if (parts[i] === '+') {
// 				continue
// 			}
	
// 			if (parts[i] === '#') {
// 				// for Rule #2
// 				return i === parts.length - 1
// 			}
	
// 			if (parts[i].indexOf('+') !== -1 || parts[i].indexOf('#') !== -1) {
// 				return false
// 			}
// 		}
	
// 		return true
// 	}
	
// 	/**
// 	 * Validate an array of topics to see if any of them is valid or not
// 		* @param {Array} topics - Array of topics
// 	 * @returns {String} If the topics is valid, returns null. Otherwise, returns the invalid one
// 	 */
// 	function validateTopics (topics) {
// 		if (topics.length === 0) {
// 			return 'empty_topic_list'
// 		}
// 		for (var i = 0; i < topics.length; i++) {
// 			if (!validateTopic(topics[i])) {
// 				return topics[i]
// 			}
// 		}
// 		return null
// 	}
	
// 	module.exports = {
// 		validateTopics: validateTopics
// 	}
	
// 	},{}],9:[function(require,module,exports){
// 	(function (process){
// 	'use strict'
	
// 	var MqttClient = require('../client')
// 	var Store = require('../store')
// 	var url = require('url')
// 	var xtend = require('xtend')
// 	var protocols = {}
	
// 	if (process.title !== 'browser') {
// 		protocols.mqtt = require('./tcp')
// 		protocols.tcp = require('./tcp')
// 		protocols.ssl = require('./tls')
// 		protocols.tls = require('./tls')
// 		protocols.mqtts = require('./tls')
// 	} else {
// 		protocols.wx = require('./wx')
// 		protocols.wxs = require('./wx')
	
// 		protocols.ali = require('./ali')
// 		protocols.alis = require('./ali')
// 	}
	
// 	protocols.ws = require('./ws')
// 	protocols.wss = require('./ws')
	
// 	/**
// 	 * Parse the auth attribute and merge username and password in the options object.
// 	 *
// 	 * @param {Object} [opts] option object
// 	 */
// 	function parseAuthOptions (opts) {
// 		var matches
// 		if (opts.auth) {
// 			matches = opts.auth.match(/^(.+):(.+)$/)
// 			if (matches) {
// 				opts.username = matches[1]
// 				opts.password = matches[2]
// 			} else {
// 				opts.username = opts.auth
// 			}
// 		}
// 	}
	
// 	/**
// 	 * connect - connect to an MQTT broker.
// 	 *
// 	 * @param {String} [brokerUrl] - url of the broker, optional
// 	 * @param {Object} opts - see MqttClient#constructor
// 	 */
// 	function connect (brokerUrl, opts) {
// 		if ((typeof brokerUrl === 'object') && !opts) {
// 			opts = brokerUrl
// 			brokerUrl = null
// 		}
	
// 		opts = opts || {}
	
// 		if (brokerUrl) {
// 			var parsed = url.parse(brokerUrl, true)
// 			if (parsed.port != null) {
// 				parsed.port = Number(parsed.port)
// 			}
	
// 			opts = xtend(parsed, opts)
	
// 			if (opts.protocol === null) {
// 				throw new Error('Missing protocol')
// 			}
// 			opts.protocol = opts.protocol.replace(/:$/, '')
// 		}
	
// 		// merge in the auth options if supplied
// 		parseAuthOptions(opts)
	
// 		// support clientId passed in the query string of the url
// 		if (opts.query && typeof opts.query.clientId === 'string') {
// 			opts.clientId = opts.query.clientId
// 		}
	
// 		if (opts.cert && opts.key) {
// 			if (opts.protocol) {
// 				if (['mqtts', 'wss', 'wxs', 'alis'].indexOf(opts.protocol) === -1) {
// 					switch (opts.protocol) {
// 						case 'mqtt':
// 							opts.protocol = 'mqtts'
// 							break
// 						case 'ws':
// 							opts.protocol = 'wss'
// 							break
// 						case 'wx':
// 							opts.protocol = 'wxs'
// 							break
// 						case 'ali':
// 							opts.protocol = 'alis'
// 							break
// 						default:
// 							throw new Error('Unknown protocol for secure connection: "' + opts.protocol + '"!')
// 					}
// 				}
// 			} else {
// 				// don't know what protocol he want to use, mqtts or wss
// 				throw new Error('Missing secure protocol key')
// 			}
// 		}
	
// 		if (!protocols[opts.protocol]) {
// 			var isSecure = ['mqtts', 'wss'].indexOf(opts.protocol) !== -1
// 			opts.protocol = [
// 				'mqtt',
// 				'mqtts',
// 				'ws',
// 				'wss',
// 				'wx',
// 				'wxs',
// 				'ali',
// 				'alis'
// 			].filter(function (key, index) {
// 				if (isSecure && index % 2 === 0) {
// 					// Skip insecure protocols when requesting a secure one.
// 					return false
// 				}
// 				return (typeof protocols[key] === 'function')
// 			})[0]
// 		}
	
// 		if (opts.clean === false && !opts.clientId) {
// 			throw new Error('Missing clientId for unclean clients')
// 		}
	
// 		if (opts.protocol) {
// 			opts.defaultProtocol = opts.protocol
// 		}
	
// 		function wrapper (client) {
// 			if (opts.servers) {
// 				if (!client._reconnectCount || client._reconnectCount === opts.servers.length) {
// 					client._reconnectCount = 0
// 				}
	
// 				opts.host = opts.servers[client._reconnectCount].host
// 				opts.port = opts.servers[client._reconnectCount].port
// 				opts.protocol = (!opts.servers[client._reconnectCount].protocol ? opts.defaultProtocol : opts.servers[client._reconnectCount].protocol)
// 				opts.hostname = opts.host
	
// 				client._reconnectCount++
// 			}
	
// 			return protocols[opts.protocol](client, opts)
// 		}
	
// 		return new MqttClient(wrapper, opts)
// 	}
	
// 	module.exports = connect
// 	module.exports.connect = connect
// 	module.exports.MqttClient = MqttClient
// 	module.exports.Store = Store
	
// 	}).call(this,require('_process'))
// 	},{"../client":1,"../store":7,"./ali":2,"./tcp":3,"./tls":4,"./ws":5,"./wx":6,"_process":92,"url":113,"xtend":121}],10:[function(require,module,exports){
// 	'use strict'
	
// 	exports.byteLength = byteLength
// 	exports.toByteArray = toByteArray
// 	exports.fromByteArray = fromByteArray
	
// 	var lookup = []
// 	var revLookup = []
// 	var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array
	
// 	var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
// 	for (var i = 0, len = code.length; i < len; ++i) {
// 		lookup[i] = code[i]
// 		revLookup[code.charCodeAt(i)] = i
// 	}
	
// 	// Support decoding URL-safe base64 strings, as Node.js does.
// 	// See: https://en.wikipedia.org/wiki/Base64#URL_applications
// 	revLookup['-'.charCodeAt(0)] = 62
// 	revLookup['_'.charCodeAt(0)] = 63
	
// 	function getLens (b64) {
// 		var len = b64.length
	
// 		if (len % 4 > 0) {
// 			throw new Error('Invalid string. Length must be a multiple of 4')
// 		}
	
// 		// Trim off extra bytes after placeholder bytes are found
// 		// See: https://github.com/beatgammit/base64-js/issues/42
// 		var validLen = b64.indexOf('=')
// 		if (validLen === -1) validLen = len
	
// 		var placeHoldersLen = validLen === len
// 			? 0
// 			: 4 - (validLen % 4)
	
// 		return [validLen, placeHoldersLen]
// 	}
	
// 	// base64 is 4/3 + up to two characters of the original data
// 	function byteLength (b64) {
// 		var lens = getLens(b64)
// 		var validLen = lens[0]
// 		var placeHoldersLen = lens[1]
// 		return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
// 	}
	
// 	function _byteLength (b64, validLen, placeHoldersLen) {
// 		return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
// 	}
	
// 	function toByteArray (b64) {
// 		var tmp
// 		var lens = getLens(b64)
// 		var validLen = lens[0]
// 		var placeHoldersLen = lens[1]
	
// 		var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))
	
// 		var curByte = 0
	
// 		// if there are placeholders, only get up to the last complete 4 chars
// 		var len = placeHoldersLen > 0
// 			? validLen - 4
// 			: validLen
	
// 		for (var i = 0; i < len; i += 4) {
// 			tmp =
// 				(revLookup[b64.charCodeAt(i)] << 18) |
// 				(revLookup[b64.charCodeAt(i + 1)] << 12) |
// 				(revLookup[b64.charCodeAt(i + 2)] << 6) |
// 				revLookup[b64.charCodeAt(i + 3)]
// 			arr[curByte++] = (tmp >> 16) & 0xFF
// 			arr[curByte++] = (tmp >> 8) & 0xFF
// 			arr[curByte++] = tmp & 0xFF
// 		}
	
// 		if (placeHoldersLen === 2) {
// 			tmp =
// 				(revLookup[b64.charCodeAt(i)] << 2) |
// 				(revLookup[b64.charCodeAt(i + 1)] >> 4)
// 			arr[curByte++] = tmp & 0xFF
// 		}
	
// 		if (placeHoldersLen === 1) {
// 			tmp =
// 				(revLookup[b64.charCodeAt(i)] << 10) |
// 				(revLookup[b64.charCodeAt(i + 1)] << 4) |
// 				(revLookup[b64.charCodeAt(i + 2)] >> 2)
// 			arr[curByte++] = (tmp >> 8) & 0xFF
// 			arr[curByte++] = tmp & 0xFF
// 		}
	
// 		return arr
// 	}
	
// 	function tripletToBase64 (num) {
// 		return lookup[num >> 18 & 0x3F] +
// 			lookup[num >> 12 & 0x3F] +
// 			lookup[num >> 6 & 0x3F] +
// 			lookup[num & 0x3F]
// 	}
	
// 	function encodeChunk (uint8, start, end) {
// 		var tmp
// 		var output = []
// 		for (var i = start; i < end; i += 3) {
// 			tmp =
// 				((uint8[i] << 16) & 0xFF0000) +
// 				((uint8[i + 1] << 8) & 0xFF00) +
// 				(uint8[i + 2] & 0xFF)
// 			output.push(tripletToBase64(tmp))
// 		}
// 		return output.join('')
// 	}
	
// 	function fromByteArray (uint8) {
// 		var tmp
// 		var len = uint8.length
// 		var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
// 		var parts = []
// 		var maxChunkLength = 16383 // must be multiple of 3
	
// 		// go through the array every three bytes, we'll deal with trailing stuff later
// 		for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
// 			parts.push(encodeChunk(
// 				uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
// 			))
// 		}
	
// 		// pad the end with zeros, but make sure to not forget the extra bytes
// 		if (extraBytes === 1) {
// 			tmp = uint8[len - 1]
// 			parts.push(
// 				lookup[tmp >> 2] +
// 				lookup[(tmp << 4) & 0x3F] +
// 				'=='
// 			)
// 		} else if (extraBytes === 2) {
// 			tmp = (uint8[len - 2] << 8) + uint8[len - 1]
// 			parts.push(
// 				lookup[tmp >> 10] +
// 				lookup[(tmp >> 4) & 0x3F] +
// 				lookup[(tmp << 2) & 0x3F] +
// 				'='
// 			)
// 		}
	
// 		return parts.join('')
// 	}
	
// 	},{}],11:[function(require,module,exports){
	
// 	},{}],12:[function(require,module,exports){
// 	/*!
// 	 * The buffer module from node.js, for the browser.
// 	 *
// 	 * @author   Feross Aboukhadijeh <https://feross.org>
// 	 * @license  MIT
// 	 */
// 	/* eslint-disable no-proto */
	
// 	'use strict'
	
// 	var base64 = require('base64-js')
// 	var ieee754 = require('ieee754')
	
// 	exports.Buffer = Buffer
// 	exports.SlowBuffer = SlowBuffer
// 	exports.INSPECT_MAX_BYTES = 50
	
// 	var K_MAX_LENGTH = 0x7fffffff
// 	exports.kMaxLength = K_MAX_LENGTH
	
// 	/**
// 	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
// 	 *   === true    Use Uint8Array implementation (fastest)
// 	 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
// 	 *               implementation (most compatible, even IE6)
// 	 *
// 	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
// 	 * Opera 11.6+, iOS 4.2+.
// 	 *
// 	 * We report that the browser does not support typed arrays if the are not subclassable
// 	 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
// 	 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
// 	 * for __proto__ and has a buggy typed array implementation.
// 	 */
// 	Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()
	
// 	if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
// 			typeof console.error === 'function') {
// 		console.error(
// 			'This browser lacks typed array (Uint8Array) support which is required by ' +
// 			'`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
// 		)
// 	}
	
// 	function typedArraySupport () {
// 		// Can typed array instances can be augmented?
// 		try {
// 			var arr = new Uint8Array(1)
// 			arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
// 			return arr.foo() === 42
// 		} catch (e) {
// 			return false
// 		}
// 	}
	
// 	Object.defineProperty(Buffer.prototype, 'parent', {
// 		enumerable: true,
// 		get: function () {
// 			if (!Buffer.isBuffer(this)) return undefined
// 			return this.buffer
// 		}
// 	})
	
// 	Object.defineProperty(Buffer.prototype, 'offset', {
// 		enumerable: true,
// 		get: function () {
// 			if (!Buffer.isBuffer(this)) return undefined
// 			return this.byteOffset
// 		}
// 	})
	
// 	function createBuffer (length) {
// 		if (length > K_MAX_LENGTH) {
// 			throw new RangeError('The value "' + length + '" is invalid for option "size"')
// 		}
// 		// Return an augmented `Uint8Array` instance
// 		var buf = new Uint8Array(length)
// 		buf.__proto__ = Buffer.prototype
// 		return buf
// 	}
	
// 	/**
// 	 * The Buffer constructor returns instances of `Uint8Array` that have their
// 	 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
// 	 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
// 	 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
// 	 * returns a single octet.
// 	 *
// 	 * The `Uint8Array` prototype remains unmodified.
// 	 */
	
// 	function Buffer (arg, encodingOrOffset, length) {
// 		// Common case.
// 		if (typeof arg === 'number') {
// 			if (typeof encodingOrOffset === 'string') {
// 				throw new TypeError(
// 					'The "string" argument must be of type string. Received type number'
// 				)
// 			}
// 			return allocUnsafe(arg)
// 		}
// 		return from(arg, encodingOrOffset, length)
// 	}
	
// 	// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
// 	if (typeof Symbol !== 'undefined' && Symbol.species != null &&
// 			Buffer[Symbol.species] === Buffer) {
// 		Object.defineProperty(Buffer, Symbol.species, {
// 			value: null,
// 			configurable: true,
// 			enumerable: false,
// 			writable: false
// 		})
// 	}
	
// 	Buffer.poolSize = 8192 // not used by this implementation
	
// 	function from (value, encodingOrOffset, length) {
// 		if (typeof value === 'string') {
// 			return fromString(value, encodingOrOffset)
// 		}
	
// 		if (ArrayBuffer.isView(value)) {
// 			return fromArrayLike(value)
// 		}
	
// 		if (value == null) {
// 			throw TypeError(
// 				'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
// 				'or Array-like Object. Received type ' + (typeof value)
// 			)
// 		}
	
// 		if (isInstance(value, ArrayBuffer) ||
// 				(value && isInstance(value.buffer, ArrayBuffer))) {
// 			return fromArrayBuffer(value, encodingOrOffset, length)
// 		}
	
// 		if (typeof value === 'number') {
// 			throw new TypeError(
// 				'The "value" argument must not be of type number. Received type number'
// 			)
// 		}
	
// 		var valueOf = value.valueOf && value.valueOf()
// 		if (valueOf != null && valueOf !== value) {
// 			return Buffer.from(valueOf, encodingOrOffset, length)
// 		}
	
// 		var b = fromObject(value)
// 		if (b) return b
	
// 		if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
// 				typeof value[Symbol.toPrimitive] === 'function') {
// 			return Buffer.from(
// 				value[Symbol.toPrimitive]('string'), encodingOrOffset, length
// 			)
// 		}
	
// 		throw new TypeError(
// 			'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
// 			'or Array-like Object. Received type ' + (typeof value)
// 		)
// 	}
	
// 	/**
// 	 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
// 	 * if value is a number.
// 	 * Buffer.from(str[, encoding])
// 	 * Buffer.from(array)
// 	 * Buffer.from(buffer)
// 	 * Buffer.from(arrayBuffer[, byteOffset[, length]])
// 	 **/
// 	Buffer.from = function (value, encodingOrOffset, length) {
// 		return from(value, encodingOrOffset, length)
// 	}
	
// 	// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// 	// https://github.com/feross/buffer/pull/148
// 	Buffer.prototype.__proto__ = Uint8Array.prototype
// 	Buffer.__proto__ = Uint8Array
	
// 	function assertSize (size) {
// 		if (typeof size !== 'number') {
// 			throw new TypeError('"size" argument must be of type number')
// 		} else if (size < 0) {
// 			throw new RangeError('The value "' + size + '" is invalid for option "size"')
// 		}
// 	}
	
// 	function alloc (size, fill, encoding) {
// 		assertSize(size)
// 		if (size <= 0) {
// 			return createBuffer(size)
// 		}
// 		if (fill !== undefined) {
// 			// Only pay attention to encoding if it's a string. This
// 			// prevents accidentally sending in a number that would
// 			// be interpretted as a start offset.
// 			return typeof encoding === 'string'
// 				? createBuffer(size).fill(fill, encoding)
// 				: createBuffer(size).fill(fill)
// 		}
// 		return createBuffer(size)
// 	}
	
// 	/**
// 	 * Creates a new filled Buffer instance.
// 	 * alloc(size[, fill[, encoding]])
// 	 **/
// 	Buffer.alloc = function (size, fill, encoding) {
// 		return alloc(size, fill, encoding)
// 	}
	
// 	function allocUnsafe (size) {
// 		assertSize(size)
// 		return createBuffer(size < 0 ? 0 : checked(size) | 0)
// 	}
	
// 	/**
// 	 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
// 	 * */
// 	Buffer.allocUnsafe = function (size) {
// 		return allocUnsafe(size)
// 	}
// 	/**
// 	 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
// 	 */
// 	Buffer.allocUnsafeSlow = function (size) {
// 		return allocUnsafe(size)
// 	}
	
// 	function fromString (string, encoding) {
// 		if (typeof encoding !== 'string' || encoding === '') {
// 			encoding = 'utf8'
// 		}
	
// 		if (!Buffer.isEncoding(encoding)) {
// 			throw new TypeError('Unknown encoding: ' + encoding)
// 		}
	
// 		var length = byteLength(string, encoding) | 0
// 		var buf = createBuffer(length)
	
// 		var actual = buf.write(string, encoding)
	
// 		if (actual !== length) {
// 			// Writing a hex string, for example, that contains invalid characters will
// 			// cause everything after the first invalid character to be ignored. (e.g.
// 			// 'abxxcd' will be treated as 'ab')
// 			buf = buf.slice(0, actual)
// 		}
	
// 		return buf
// 	}
	
// 	function fromArrayLike (array) {
// 		var length = array.length < 0 ? 0 : checked(array.length) | 0
// 		var buf = createBuffer(length)
// 		for (var i = 0; i < length; i += 1) {
// 			buf[i] = array[i] & 255
// 		}
// 		return buf
// 	}
	
// 	function fromArrayBuffer (array, byteOffset, length) {
// 		if (byteOffset < 0 || array.byteLength < byteOffset) {
// 			throw new RangeError('"offset" is outside of buffer bounds')
// 		}
	
// 		if (array.byteLength < byteOffset + (length || 0)) {
// 			throw new RangeError('"length" is outside of buffer bounds')
// 		}
	
// 		var buf
// 		if (byteOffset === undefined && length === undefined) {
// 			buf = new Uint8Array(array)
// 		} else if (length === undefined) {
// 			buf = new Uint8Array(array, byteOffset)
// 		} else {
// 			buf = new Uint8Array(array, byteOffset, length)
// 		}
	
// 		// Return an augmented `Uint8Array` instance
// 		buf.__proto__ = Buffer.prototype
// 		return buf
// 	}
	
// 	function fromObject (obj) {
// 		if (Buffer.isBuffer(obj)) {
// 			var len = checked(obj.length) | 0
// 			var buf = createBuffer(len)
	
// 			if (buf.length === 0) {
// 				return buf
// 			}
	
// 			obj.copy(buf, 0, 0, len)
// 			return buf
// 		}
	
// 		if (obj.length !== undefined) {
// 			if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
// 				return createBuffer(0)
// 			}
// 			return fromArrayLike(obj)
// 		}
	
// 		if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
// 			return fromArrayLike(obj.data)
// 		}
// 	}
	
// 	function checked (length) {
// 		// Note: cannot use `length < K_MAX_LENGTH` here because that fails when
// 		// length is NaN (which is otherwise coerced to zero.)
// 		if (length >= K_MAX_LENGTH) {
// 			throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
// 													 'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
// 		}
// 		return length | 0
// 	}
	
// 	function SlowBuffer (length) {
// 		if (+length != length) { // eslint-disable-line eqeqeq
// 			length = 0
// 		}
// 		return Buffer.alloc(+length)
// 	}
	
// 	Buffer.isBuffer = function isBuffer (b) {
// 		return b != null && b._isBuffer === true &&
// 			b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
// 	}
	
// 	Buffer.compare = function compare (a, b) {
// 		if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
// 		if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
// 		if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
// 			throw new TypeError(
// 				'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
// 			)
// 		}
	
// 		if (a === b) return 0
	
// 		var x = a.length
// 		var y = b.length
	
// 		for (var i = 0, len = Math.min(x, y); i < len; ++i) {
// 			if (a[i] !== b[i]) {
// 				x = a[i]
// 				y = b[i]
// 				break
// 			}
// 		}
	
// 		if (x < y) return -1
// 		if (y < x) return 1
// 		return 0
// 	}
	
// 	Buffer.isEncoding = function isEncoding (encoding) {
// 		switch (String(encoding).toLowerCase()) {
// 			case 'hex':
// 			case 'utf8':
// 			case 'utf-8':
// 			case 'ascii':
// 			case 'latin1':
// 			case 'binary':
// 			case 'base64':
// 			case 'ucs2':
// 			case 'ucs-2':
// 			case 'utf16le':
// 			case 'utf-16le':
// 				return true
// 			default:
// 				return false
// 		}
// 	}
	
// 	Buffer.concat = function concat (list, length) {
// 		if (!Array.isArray(list)) {
// 			throw new TypeError('"list" argument must be an Array of Buffers')
// 		}
	
// 		if (list.length === 0) {
// 			return Buffer.alloc(0)
// 		}
	
// 		var i
// 		if (length === undefined) {
// 			length = 0
// 			for (i = 0; i < list.length; ++i) {
// 				length += list[i].length
// 			}
// 		}
	
// 		var buffer = Buffer.allocUnsafe(length)
// 		var pos = 0
// 		for (i = 0; i < list.length; ++i) {
// 			var buf = list[i]
// 			if (isInstance(buf, Uint8Array)) {
// 				buf = Buffer.from(buf)
// 			}
// 			if (!Buffer.isBuffer(buf)) {
// 				throw new TypeError('"list" argument must be an Array of Buffers')
// 			}
// 			buf.copy(buffer, pos)
// 			pos += buf.length
// 		}
// 		return buffer
// 	}
	
// 	function byteLength (string, encoding) {
// 		if (Buffer.isBuffer(string)) {
// 			return string.length
// 		}
// 		if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
// 			return string.byteLength
// 		}
// 		if (typeof string !== 'string') {
// 			throw new TypeError(
// 				'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
// 				'Received type ' + typeof string
// 			)
// 		}
	
// 		var len = string.length
// 		var mustMatch = (arguments.length > 2 && arguments[2] === true)
// 		if (!mustMatch && len === 0) return 0
	
// 		// Use a for loop to avoid recursion
// 		var loweredCase = false
// 		for (;;) {
// 			switch (encoding) {
// 				case 'ascii':
// 				case 'latin1':
// 				case 'binary':
// 					return len
// 				case 'utf8':
// 				case 'utf-8':
// 					return utf8ToBytes(string).length
// 				case 'ucs2':
// 				case 'ucs-2':
// 				case 'utf16le':
// 				case 'utf-16le':
// 					return len * 2
// 				case 'hex':
// 					return len >>> 1
// 				case 'base64':
// 					return base64ToBytes(string).length
// 				default:
// 					if (loweredCase) {
// 						return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
// 					}
// 					encoding = ('' + encoding).toLowerCase()
// 					loweredCase = true
// 			}
// 		}
// 	}
// 	Buffer.byteLength = byteLength
	
// 	function slowToString (encoding, start, end) {
// 		var loweredCase = false
	
// 		// No need to verify that "this.length <= MAX_UINT32" since it's a read-only
// 		// property of a typed array.
	
// 		// This behaves neither like String nor Uint8Array in that we set start/end
// 		// to their upper/lower bounds if the value passed is out of range.
// 		// undefined is handled specially as per ECMA-262 6th Edition,
// 		// Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
// 		if (start === undefined || start < 0) {
// 			start = 0
// 		}
// 		// Return early if start > this.length. Done here to prevent potential uint32
// 		// coercion fail below.
// 		if (start > this.length) {
// 			return ''
// 		}
	
// 		if (end === undefined || end > this.length) {
// 			end = this.length
// 		}
	
// 		if (end <= 0) {
// 			return ''
// 		}
	
// 		// Force coersion to uint32. This will also coerce falsey/NaN values to 0.
// 		end >>>= 0
// 		start >>>= 0
	
// 		if (end <= start) {
// 			return ''
// 		}
	
// 		if (!encoding) encoding = 'utf8'
	
// 		while (true) {
// 			switch (encoding) {
// 				case 'hex':
// 					return hexSlice(this, start, end)
	
// 				case 'utf8':
// 				case 'utf-8':
// 					return utf8Slice(this, start, end)
	
// 				case 'ascii':
// 					return asciiSlice(this, start, end)
	
// 				case 'latin1':
// 				case 'binary':
// 					return latin1Slice(this, start, end)
	
// 				case 'base64':
// 					return base64Slice(this, start, end)
	
// 				case 'ucs2':
// 				case 'ucs-2':
// 				case 'utf16le':
// 				case 'utf-16le':
// 					return utf16leSlice(this, start, end)
	
// 				default:
// 					if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
// 					encoding = (encoding + '').toLowerCase()
// 					loweredCase = true
// 			}
// 		}
// 	}
	
// 	// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// 	// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// 	// reliably in a browserify context because there could be multiple different
// 	// copies of the 'buffer' package in use. This method works even for Buffer
// 	// instances that were created from another copy of the `buffer` package.
// 	// See: https://github.com/feross/buffer/issues/154
// 	Buffer.prototype._isBuffer = true
	
// 	function swap (b, n, m) {
// 		var i = b[n]
// 		b[n] = b[m]
// 		b[m] = i
// 	}
	
// 	Buffer.prototype.swap16 = function swap16 () {
// 		var len = this.length
// 		if (len % 2 !== 0) {
// 			throw new RangeError('Buffer size must be a multiple of 16-bits')
// 		}
// 		for (var i = 0; i < len; i += 2) {
// 			swap(this, i, i + 1)
// 		}
// 		return this
// 	}
	
// 	Buffer.prototype.swap32 = function swap32 () {
// 		var len = this.length
// 		if (len % 4 !== 0) {
// 			throw new RangeError('Buffer size must be a multiple of 32-bits')
// 		}
// 		for (var i = 0; i < len; i += 4) {
// 			swap(this, i, i + 3)
// 			swap(this, i + 1, i + 2)
// 		}
// 		return this
// 	}
	
// 	Buffer.prototype.swap64 = function swap64 () {
// 		var len = this.length
// 		if (len % 8 !== 0) {
// 			throw new RangeError('Buffer size must be a multiple of 64-bits')
// 		}
// 		for (var i = 0; i < len; i += 8) {
// 			swap(this, i, i + 7)
// 			swap(this, i + 1, i + 6)
// 			swap(this, i + 2, i + 5)
// 			swap(this, i + 3, i + 4)
// 		}
// 		return this
// 	}
	
// 	Buffer.prototype.toString = function toString () {
// 		var length = this.length
// 		if (length === 0) return ''
// 		if (arguments.length === 0) return utf8Slice(this, 0, length)
// 		return slowToString.apply(this, arguments)
// 	}
	
// 	Buffer.prototype.toLocaleString = Buffer.prototype.toString
	
// 	Buffer.prototype.equals = function equals (b) {
// 		if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
// 		if (this === b) return true
// 		return Buffer.compare(this, b) === 0
// 	}
	
// 	Buffer.prototype.inspect = function inspect () {
// 		var str = ''
// 		var max = exports.INSPECT_MAX_BYTES
// 		str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
// 		if (this.length > max) str += ' ... '
// 		return '<Buffer ' + str + '>'
// 	}
	
// 	Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
// 		if (isInstance(target, Uint8Array)) {
// 			target = Buffer.from(target, target.offset, target.byteLength)
// 		}
// 		if (!Buffer.isBuffer(target)) {
// 			throw new TypeError(
// 				'The "target" argument must be one of type Buffer or Uint8Array. ' +
// 				'Received type ' + (typeof target)
// 			)
// 		}
	
// 		if (start === undefined) {
// 			start = 0
// 		}
// 		if (end === undefined) {
// 			end = target ? target.length : 0
// 		}
// 		if (thisStart === undefined) {
// 			thisStart = 0
// 		}
// 		if (thisEnd === undefined) {
// 			thisEnd = this.length
// 		}
	
// 		if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
// 			throw new RangeError('out of range index')
// 		}
	
// 		if (thisStart >= thisEnd && start >= end) {
// 			return 0
// 		}
// 		if (thisStart >= thisEnd) {
// 			return -1
// 		}
// 		if (start >= end) {
// 			return 1
// 		}
	
// 		start >>>= 0
// 		end >>>= 0
// 		thisStart >>>= 0
// 		thisEnd >>>= 0
	
// 		if (this === target) return 0
	
// 		var x = thisEnd - thisStart
// 		var y = end - start
// 		var len = Math.min(x, y)
	
// 		var thisCopy = this.slice(thisStart, thisEnd)
// 		var targetCopy = target.slice(start, end)
	
// 		for (var i = 0; i < len; ++i) {
// 			if (thisCopy[i] !== targetCopy[i]) {
// 				x = thisCopy[i]
// 				y = targetCopy[i]
// 				break
// 			}
// 		}
	
// 		if (x < y) return -1
// 		if (y < x) return 1
// 		return 0
// 	}
	
// 	// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// 	// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
// 	//
// 	// Arguments:
// 	// - buffer - a Buffer to search
// 	// - val - a string, Buffer, or number
// 	// - byteOffset - an index into `buffer`; will be clamped to an int32
// 	// - encoding - an optional encoding, relevant is val is a string
// 	// - dir - true for indexOf, false for lastIndexOf
// 	function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
// 		// Empty buffer means no match
// 		if (buffer.length === 0) return -1
	
// 		// Normalize byteOffset
// 		if (typeof byteOffset === 'string') {
// 			encoding = byteOffset
// 			byteOffset = 0
// 		} else if (byteOffset > 0x7fffffff) {
// 			byteOffset = 0x7fffffff
// 		} else if (byteOffset < -0x80000000) {
// 			byteOffset = -0x80000000
// 		}
// 		byteOffset = +byteOffset // Coerce to Number.
// 		if (numberIsNaN(byteOffset)) {
// 			// byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
// 			byteOffset = dir ? 0 : (buffer.length - 1)
// 		}
	
// 		// Normalize byteOffset: negative offsets start from the end of the buffer
// 		if (byteOffset < 0) byteOffset = buffer.length + byteOffset
// 		if (byteOffset >= buffer.length) {
// 			if (dir) return -1
// 			else byteOffset = buffer.length - 1
// 		} else if (byteOffset < 0) {
// 			if (dir) byteOffset = 0
// 			else return -1
// 		}
	
// 		// Normalize val
// 		if (typeof val === 'string') {
// 			val = Buffer.from(val, encoding)
// 		}
	
// 		// Finally, search either indexOf (if dir is true) or lastIndexOf
// 		if (Buffer.isBuffer(val)) {
// 			// Special case: looking for empty string/buffer always fails
// 			if (val.length === 0) {
// 				return -1
// 			}
// 			return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
// 		} else if (typeof val === 'number') {
// 			val = val & 0xFF // Search for a byte value [0-255]
// 			if (typeof Uint8Array.prototype.indexOf === 'function') {
// 				if (dir) {
// 					return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
// 				} else {
// 					return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
// 				}
// 			}
// 			return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
// 		}
	
// 		throw new TypeError('val must be string, number or Buffer')
// 	}
	
// 	function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
// 		var indexSize = 1
// 		var arrLength = arr.length
// 		var valLength = val.length
	
// 		if (encoding !== undefined) {
// 			encoding = String(encoding).toLowerCase()
// 			if (encoding === 'ucs2' || encoding === 'ucs-2' ||
// 					encoding === 'utf16le' || encoding === 'utf-16le') {
// 				if (arr.length < 2 || val.length < 2) {
// 					return -1
// 				}
// 				indexSize = 2
// 				arrLength /= 2
// 				valLength /= 2
// 				byteOffset /= 2
// 			}
// 		}
	
// 		function read (buf, i) {
// 			if (indexSize === 1) {
// 				return buf[i]
// 			} else {
// 				return buf.readUInt16BE(i * indexSize)
// 			}
// 		}
	
// 		var i
// 		if (dir) {
// 			var foundIndex = -1
// 			for (i = byteOffset; i < arrLength; i++) {
// 				if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
// 					if (foundIndex === -1) foundIndex = i
// 					if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
// 				} else {
// 					if (foundIndex !== -1) i -= i - foundIndex
// 					foundIndex = -1
// 				}
// 			}
// 		} else {
// 			if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
// 			for (i = byteOffset; i >= 0; i--) {
// 				var found = true
// 				for (var j = 0; j < valLength; j++) {
// 					if (read(arr, i + j) !== read(val, j)) {
// 						found = false
// 						break
// 					}
// 				}
// 				if (found) return i
// 			}
// 		}
	
// 		return -1
// 	}
	
// 	Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
// 		return this.indexOf(val, byteOffset, encoding) !== -1
// 	}
	
// 	Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
// 		return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
// 	}
	
// 	Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
// 		return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
// 	}
	
// 	function hexWrite (buf, string, offset, length) {
// 		offset = Number(offset) || 0
// 		var remaining = buf.length - offset
// 		if (!length) {
// 			length = remaining
// 		} else {
// 			length = Number(length)
// 			if (length > remaining) {
// 				length = remaining
// 			}
// 		}
	
// 		var strLen = string.length
	
// 		if (length > strLen / 2) {
// 			length = strLen / 2
// 		}
// 		for (var i = 0; i < length; ++i) {
// 			var parsed = parseInt(string.substr(i * 2, 2), 16)
// 			if (numberIsNaN(parsed)) return i
// 			buf[offset + i] = parsed
// 		}
// 		return i
// 	}
	
// 	function utf8Write (buf, string, offset, length) {
// 		return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
// 	}
	
// 	function asciiWrite (buf, string, offset, length) {
// 		return blitBuffer(asciiToBytes(string), buf, offset, length)
// 	}
	
// 	function latin1Write (buf, string, offset, length) {
// 		return asciiWrite(buf, string, offset, length)
// 	}
	
// 	function base64Write (buf, string, offset, length) {
// 		return blitBuffer(base64ToBytes(string), buf, offset, length)
// 	}
	
// 	function ucs2Write (buf, string, offset, length) {
// 		return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
// 	}
	
// 	Buffer.prototype.write = function write (string, offset, length, encoding) {
// 		// Buffer#write(string)
// 		if (offset === undefined) {
// 			encoding = 'utf8'
// 			length = this.length
// 			offset = 0
// 		// Buffer#write(string, encoding)
// 		} else if (length === undefined && typeof offset === 'string') {
// 			encoding = offset
// 			length = this.length
// 			offset = 0
// 		// Buffer#write(string, offset[, length][, encoding])
// 		} else if (isFinite(offset)) {
// 			offset = offset >>> 0
// 			if (isFinite(length)) {
// 				length = length >>> 0
// 				if (encoding === undefined) encoding = 'utf8'
// 			} else {
// 				encoding = length
// 				length = undefined
// 			}
// 		} else {
// 			throw new Error(
// 				'Buffer.write(string, encoding, offset[, length]) is no longer supported'
// 			)
// 		}
	
// 		var remaining = this.length - offset
// 		if (length === undefined || length > remaining) length = remaining
	
// 		if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
// 			throw new RangeError('Attempt to write outside buffer bounds')
// 		}
	
// 		if (!encoding) encoding = 'utf8'
	
// 		var loweredCase = false
// 		for (;;) {
// 			switch (encoding) {
// 				case 'hex':
// 					return hexWrite(this, string, offset, length)
	
// 				case 'utf8':
// 				case 'utf-8':
// 					return utf8Write(this, string, offset, length)
	
// 				case 'ascii':
// 					return asciiWrite(this, string, offset, length)
	
// 				case 'latin1':
// 				case 'binary':
// 					return latin1Write(this, string, offset, length)
	
// 				case 'base64':
// 					// Warning: maxLength not taken into account in base64Write
// 					return base64Write(this, string, offset, length)
	
// 				case 'ucs2':
// 				case 'ucs-2':
// 				case 'utf16le':
// 				case 'utf-16le':
// 					return ucs2Write(this, string, offset, length)
	
// 				default:
// 					if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
// 					encoding = ('' + encoding).toLowerCase()
// 					loweredCase = true
// 			}
// 		}
// 	}
	
// 	Buffer.prototype.toJSON = function toJSON () {
// 		return {
// 			type: 'Buffer',
// 			data: Array.prototype.slice.call(this._arr || this, 0)
// 		}
// 	}
	
// 	function base64Slice (buf, start, end) {
// 		if (start === 0 && end === buf.length) {
// 			return base64.fromByteArray(buf)
// 		} else {
// 			return base64.fromByteArray(buf.slice(start, end))
// 		}
// 	}
	
// 	function utf8Slice (buf, start, end) {
// 		end = Math.min(buf.length, end)
// 		var res = []
	
// 		var i = start
// 		while (i < end) {
// 			var firstByte = buf[i]
// 			var codePoint = null
// 			var bytesPerSequence = (firstByte > 0xEF) ? 4
// 				: (firstByte > 0xDF) ? 3
// 					: (firstByte > 0xBF) ? 2
// 						: 1
	
// 			if (i + bytesPerSequence <= end) {
// 				var secondByte, thirdByte, fourthByte, tempCodePoint
	
// 				switch (bytesPerSequence) {
// 					case 1:
// 						if (firstByte < 0x80) {
// 							codePoint = firstByte
// 						}
// 						break
// 					case 2:
// 						secondByte = buf[i + 1]
// 						if ((secondByte & 0xC0) === 0x80) {
// 							tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
// 							if (tempCodePoint > 0x7F) {
// 								codePoint = tempCodePoint
// 							}
// 						}
// 						break
// 					case 3:
// 						secondByte = buf[i + 1]
// 						thirdByte = buf[i + 2]
// 						if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
// 							tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
// 							if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
// 								codePoint = tempCodePoint
// 							}
// 						}
// 						break
// 					case 4:
// 						secondByte = buf[i + 1]
// 						thirdByte = buf[i + 2]
// 						fourthByte = buf[i + 3]
// 						if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
// 							tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
// 							if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
// 								codePoint = tempCodePoint
// 							}
// 						}
// 				}
// 			}
	
// 			if (codePoint === null) {
// 				// we did not generate a valid codePoint so insert a
// 				// replacement char (U+FFFD) and advance only 1 byte
// 				codePoint = 0xFFFD
// 				bytesPerSequence = 1
// 			} else if (codePoint > 0xFFFF) {
// 				// encode to utf16 (surrogate pair dance)
// 				codePoint -= 0x10000
// 				res.push(codePoint >>> 10 & 0x3FF | 0xD800)
// 				codePoint = 0xDC00 | codePoint & 0x3FF
// 			}
	
// 			res.push(codePoint)
// 			i += bytesPerSequence
// 		}
	
// 		return decodeCodePointsArray(res)
// 	}
	
// 	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// 	// the lowest limit is Chrome, with 0x10000 args.
// 	// We go 1 magnitude less, for safety
// 	var MAX_ARGUMENTS_LENGTH = 0x1000
	
// 	function decodeCodePointsArray (codePoints) {
// 		var len = codePoints.length
// 		if (len <= MAX_ARGUMENTS_LENGTH) {
// 			return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
// 		}
	
// 		// Decode in chunks to avoid "call stack size exceeded".
// 		var res = ''
// 		var i = 0
// 		while (i < len) {
// 			res += String.fromCharCode.apply(
// 				String,
// 				codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
// 			)
// 		}
// 		return res
// 	}
	
// 	function asciiSlice (buf, start, end) {
// 		var ret = ''
// 		end = Math.min(buf.length, end)
	
// 		for (var i = start; i < end; ++i) {
// 			ret += String.fromCharCode(buf[i] & 0x7F)
// 		}
// 		return ret
// 	}
	
// 	function latin1Slice (buf, start, end) {
// 		var ret = ''
// 		end = Math.min(buf.length, end)
	
// 		for (var i = start; i < end; ++i) {
// 			ret += String.fromCharCode(buf[i])
// 		}
// 		return ret
// 	}
	
// 	function hexSlice (buf, start, end) {
// 		var len = buf.length
	
// 		if (!start || start < 0) start = 0
// 		if (!end || end < 0 || end > len) end = len
	
// 		var out = ''
// 		for (var i = start; i < end; ++i) {
// 			out += toHex(buf[i])
// 		}
// 		return out
// 	}
	
// 	function utf16leSlice (buf, start, end) {
// 		var bytes = buf.slice(start, end)
// 		var res = ''
// 		for (var i = 0; i < bytes.length; i += 2) {
// 			res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
// 		}
// 		return res
// 	}
	
// 	Buffer.prototype.slice = function slice (start, end) {
// 		var len = this.length
// 		start = ~~start
// 		end = end === undefined ? len : ~~end
	
// 		if (start < 0) {
// 			start += len
// 			if (start < 0) start = 0
// 		} else if (start > len) {
// 			start = len
// 		}
	
// 		if (end < 0) {
// 			end += len
// 			if (end < 0) end = 0
// 		} else if (end > len) {
// 			end = len
// 		}
	
// 		if (end < start) end = start
	
// 		var newBuf = this.subarray(start, end)
// 		// Return an augmented `Uint8Array` instance
// 		newBuf.__proto__ = Buffer.prototype
// 		return newBuf
// 	}
	
// 	/*
// 	 * Need to make sure that buffer isn't trying to write out of bounds.
// 	 */
// 	function checkOffset (offset, ext, length) {
// 		if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
// 		if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
// 	}
	
// 	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
// 		offset = offset >>> 0
// 		byteLength = byteLength >>> 0
// 		if (!noAssert) checkOffset(offset, byteLength, this.length)
	
// 		var val = this[offset]
// 		var mul = 1
// 		var i = 0
// 		while (++i < byteLength && (mul *= 0x100)) {
// 			val += this[offset + i] * mul
// 		}
	
// 		return val
// 	}
	
// 	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
// 		offset = offset >>> 0
// 		byteLength = byteLength >>> 0
// 		if (!noAssert) {
// 			checkOffset(offset, byteLength, this.length)
// 		}
	
// 		var val = this[offset + --byteLength]
// 		var mul = 1
// 		while (byteLength > 0 && (mul *= 0x100)) {
// 			val += this[offset + --byteLength] * mul
// 		}
	
// 		return val
// 	}
	
// 	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
// 		offset = offset >>> 0
// 		if (!noAssert) checkOffset(offset, 1, this.length)
// 		return this[offset]
// 	}
	
// 	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
// 		offset = offset >>> 0
// 		if (!noAssert) checkOffset(offset, 2, this.length)
// 		return this[offset] | (this[offset + 1] << 8)
// 	}
	
// 	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
// 		offset = offset >>> 0
// 		if (!noAssert) checkOffset(offset, 2, this.length)
// 		return (this[offset] << 8) | this[offset + 1]
// 	}
	
// 	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
// 		offset = offset >>> 0
// 		if (!noAssert) checkOffset(offset, 4, this.length)
	
// 		return ((this[offset]) |
// 				(this[offset + 1] << 8) |
// 				(this[offset + 2] << 16)) +
// 				(this[offset + 3] * 0x1000000)
// 	}
	
// 	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
// 		offset = offset >>> 0
// 		if (!noAssert) checkOffset(offset, 4, this.length)
	
// 		return (this[offset] * 0x1000000) +
// 			((this[offset + 1] << 16) |
// 			(this[offset + 2] << 8) |
// 			this[offset + 3])
// 	}
	
// 	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
// 		offset = offset >>> 0
// 		byteLength = byteLength >>> 0
// 		if (!noAssert) checkOffset(offset, byteLength, this.length)
	
// 		var val = this[offset]
// 		var mul = 1
// 		var i = 0
// 		while (++i < byteLength && (mul *= 0x100)) {
// 			val += this[offset + i] * mul
// 		}
// 		mul *= 0x80
	
// 		if (val >= mul) val -= Math.pow(2, 8 * byteLength)
	
// 		return val
// 	}
	
// 	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
// 		offset = offset >>> 0
// 		byteLength = byteLength >>> 0
// 		if (!noAssert) checkOffset(offset, byteLength, this.length)
	
// 		var i = byteLength
// 		var mul = 1
// 		var val = this[offset + --i]
// 		while (i > 0 && (mul *= 0x100)) {
// 			val += this[offset + --i] * mul
// 		}
// 		mul *= 0x80
	
// 		if (val >= mul) val -= Math.pow(2, 8 * byteLength)
	
// 		return val
// 	}
	
// 	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
// 		offset = offset >>> 0
// 		if (!noAssert) checkOffset(offset, 1, this.length)
// 		if (!(this[offset] & 0x80)) return (this[offset])
// 		return ((0xff - this[offset] + 1) * -1)
// 	}
	
// 	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
// 		offset = offset >>> 0
// 		if (!noAssert) checkOffset(offset, 2, this.length)
// 		var val = this[offset] | (this[offset + 1] << 8)
// 		return (val & 0x8000) ? val | 0xFFFF0000 : val
// 	}
	
// 	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
// 		offset = offset >>> 0
// 		if (!noAssert) checkOffset(offset, 2, this.length)
// 		var val = this[offset + 1] | (this[offset] << 8)
// 		return (val & 0x8000) ? val | 0xFFFF0000 : val
// 	}
	
// 	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
// 		offset = offset >>> 0
// 		if (!noAssert) checkOffset(offset, 4, this.length)
	
// 		return (this[offset]) |
// 			(this[offset + 1] << 8) |
// 			(this[offset + 2] << 16) |
// 			(this[offset + 3] << 24)
// 	}
	
// 	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
// 		offset = offset >>> 0
// 		if (!noAssert) checkOffset(offset, 4, this.length)
	
// 		return (this[offset] << 24) |
// 			(this[offset + 1] << 16) |
// 			(this[offset + 2] << 8) |
// 			(this[offset + 3])
// 	}
	
// 	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
// 		offset = offset >>> 0
// 		if (!noAssert) checkOffset(offset, 4, this.length)
// 		return ieee754.read(this, offset, true, 23, 4)
// 	}
	
// 	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
// 		offset = offset >>> 0
// 		if (!noAssert) checkOffset(offset, 4, this.length)
// 		return ieee754.read(this, offset, false, 23, 4)
// 	}
	
// 	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
// 		offset = offset >>> 0
// 		if (!noAssert) checkOffset(offset, 8, this.length)
// 		return ieee754.read(this, offset, true, 52, 8)
// 	}
	
// 	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
// 		offset = offset >>> 0
// 		if (!noAssert) checkOffset(offset, 8, this.length)
// 		return ieee754.read(this, offset, false, 52, 8)
// 	}
	
// 	function checkInt (buf, value, offset, ext, max, min) {
// 		if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
// 		if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
// 		if (offset + ext > buf.length) throw new RangeError('Index out of range')
// 	}
	
// 	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
// 		value = +value
// 		offset = offset >>> 0
// 		byteLength = byteLength >>> 0
// 		if (!noAssert) {
// 			var maxBytes = Math.pow(2, 8 * byteLength) - 1
// 			checkInt(this, value, offset, byteLength, maxBytes, 0)
// 		}
	
// 		var mul = 1
// 		var i = 0
// 		this[offset] = value & 0xFF
// 		while (++i < byteLength && (mul *= 0x100)) {
// 			this[offset + i] = (value / mul) & 0xFF
// 		}
	
// 		return offset + byteLength
// 	}
	
// 	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
// 		value = +value
// 		offset = offset >>> 0
// 		byteLength = byteLength >>> 0
// 		if (!noAssert) {
// 			var maxBytes = Math.pow(2, 8 * byteLength) - 1
// 			checkInt(this, value, offset, byteLength, maxBytes, 0)
// 		}
	
// 		var i = byteLength - 1
// 		var mul = 1
// 		this[offset + i] = value & 0xFF
// 		while (--i >= 0 && (mul *= 0x100)) {
// 			this[offset + i] = (value / mul) & 0xFF
// 		}
	
// 		return offset + byteLength
// 	}
	
// 	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
// 		value = +value
// 		offset = offset >>> 0
// 		if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
// 		this[offset] = (value & 0xff)
// 		return offset + 1
// 	}
	
// 	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
// 		value = +value
// 		offset = offset >>> 0
// 		if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
// 		this[offset] = (value & 0xff)
// 		this[offset + 1] = (value >>> 8)
// 		return offset + 2
// 	}
	
// 	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
// 		value = +value
// 		offset = offset >>> 0
// 		if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
// 		this[offset] = (value >>> 8)
// 		this[offset + 1] = (value & 0xff)
// 		return offset + 2
// 	}
	
// 	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
// 		value = +value
// 		offset = offset >>> 0
// 		if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
// 		this[offset + 3] = (value >>> 24)
// 		this[offset + 2] = (value >>> 16)
// 		this[offset + 1] = (value >>> 8)
// 		this[offset] = (value & 0xff)
// 		return offset + 4
// 	}
	
// 	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
// 		value = +value
// 		offset = offset >>> 0
// 		if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
// 		this[offset] = (value >>> 24)
// 		this[offset + 1] = (value >>> 16)
// 		this[offset + 2] = (value >>> 8)
// 		this[offset + 3] = (value & 0xff)
// 		return offset + 4
// 	}
	
// 	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
// 		value = +value
// 		offset = offset >>> 0
// 		if (!noAssert) {
// 			var limit = Math.pow(2, (8 * byteLength) - 1)
	
// 			checkInt(this, value, offset, byteLength, limit - 1, -limit)
// 		}
	
// 		var i = 0
// 		var mul = 1
// 		var sub = 0
// 		this[offset] = value & 0xFF
// 		while (++i < byteLength && (mul *= 0x100)) {
// 			if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
// 				sub = 1
// 			}
// 			this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
// 		}
	
// 		return offset + byteLength
// 	}
	
// 	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
// 		value = +value
// 		offset = offset >>> 0
// 		if (!noAssert) {
// 			var limit = Math.pow(2, (8 * byteLength) - 1)
	
// 			checkInt(this, value, offset, byteLength, limit - 1, -limit)
// 		}
	
// 		var i = byteLength - 1
// 		var mul = 1
// 		var sub = 0
// 		this[offset + i] = value & 0xFF
// 		while (--i >= 0 && (mul *= 0x100)) {
// 			if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
// 				sub = 1
// 			}
// 			this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
// 		}
	
// 		return offset + byteLength
// 	}
	
// 	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
// 		value = +value
// 		offset = offset >>> 0
// 		if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
// 		if (value < 0) value = 0xff + value + 1
// 		this[offset] = (value & 0xff)
// 		return offset + 1
// 	}
	
// 	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
// 		value = +value
// 		offset = offset >>> 0
// 		if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
// 		this[offset] = (value & 0xff)
// 		this[offset + 1] = (value >>> 8)
// 		return offset + 2
// 	}
	
// 	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
// 		value = +value
// 		offset = offset >>> 0
// 		if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
// 		this[offset] = (value >>> 8)
// 		this[offset + 1] = (value & 0xff)
// 		return offset + 2
// 	}
	
// 	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
// 		value = +value
// 		offset = offset >>> 0
// 		if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
// 		this[offset] = (value & 0xff)
// 		this[offset + 1] = (value >>> 8)
// 		this[offset + 2] = (value >>> 16)
// 		this[offset + 3] = (value >>> 24)
// 		return offset + 4
// 	}
	
// 	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
// 		value = +value
// 		offset = offset >>> 0
// 		if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
// 		if (value < 0) value = 0xffffffff + value + 1
// 		this[offset] = (value >>> 24)
// 		this[offset + 1] = (value >>> 16)
// 		this[offset + 2] = (value >>> 8)
// 		this[offset + 3] = (value & 0xff)
// 		return offset + 4
// 	}
	
// 	function checkIEEE754 (buf, value, offset, ext, max, min) {
// 		if (offset + ext > buf.length) throw new RangeError('Index out of range')
// 		if (offset < 0) throw new RangeError('Index out of range')
// 	}
	
// 	function writeFloat (buf, value, offset, littleEndian, noAssert) {
// 		value = +value
// 		offset = offset >>> 0
// 		if (!noAssert) {
// 			checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
// 		}
// 		ieee754.write(buf, value, offset, littleEndian, 23, 4)
// 		return offset + 4
// 	}
	
// 	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
// 		return writeFloat(this, value, offset, true, noAssert)
// 	}
	
// 	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
// 		return writeFloat(this, value, offset, false, noAssert)
// 	}
	
// 	function writeDouble (buf, value, offset, littleEndian, noAssert) {
// 		value = +value
// 		offset = offset >>> 0
// 		if (!noAssert) {
// 			checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
// 		}
// 		ieee754.write(buf, value, offset, littleEndian, 52, 8)
// 		return offset + 8
// 	}
	
// 	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
// 		return writeDouble(this, value, offset, true, noAssert)
// 	}
	
// 	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
// 		return writeDouble(this, value, offset, false, noAssert)
// 	}
	
// 	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
// 	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
// 		if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
// 		if (!start) start = 0
// 		if (!end && end !== 0) end = this.length
// 		if (targetStart >= target.length) targetStart = target.length
// 		if (!targetStart) targetStart = 0
// 		if (end > 0 && end < start) end = start
	
// 		// Copy 0 bytes; we're done
// 		if (end === start) return 0
// 		if (target.length === 0 || this.length === 0) return 0
	
// 		// Fatal error conditions
// 		if (targetStart < 0) {
// 			throw new RangeError('targetStart out of bounds')
// 		}
// 		if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
// 		if (end < 0) throw new RangeError('sourceEnd out of bounds')
	
// 		// Are we oob?
// 		if (end > this.length) end = this.length
// 		if (target.length - targetStart < end - start) {
// 			end = target.length - targetStart + start
// 		}
	
// 		var len = end - start
	
// 		if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
// 			// Use built-in when available, missing from IE11
// 			this.copyWithin(targetStart, start, end)
// 		} else if (this === target && start < targetStart && targetStart < end) {
// 			// descending copy from end
// 			for (var i = len - 1; i >= 0; --i) {
// 				target[i + targetStart] = this[i + start]
// 			}
// 		} else {
// 			Uint8Array.prototype.set.call(
// 				target,
// 				this.subarray(start, end),
// 				targetStart
// 			)
// 		}
	
// 		return len
// 	}
	
// 	// Usage:
// 	//    buffer.fill(number[, offset[, end]])
// 	//    buffer.fill(buffer[, offset[, end]])
// 	//    buffer.fill(string[, offset[, end]][, encoding])
// 	Buffer.prototype.fill = function fill (val, start, end, encoding) {
// 		// Handle string cases:
// 		if (typeof val === 'string') {
// 			if (typeof start === 'string') {
// 				encoding = start
// 				start = 0
// 				end = this.length
// 			} else if (typeof end === 'string') {
// 				encoding = end
// 				end = this.length
// 			}
// 			if (encoding !== undefined && typeof encoding !== 'string') {
// 				throw new TypeError('encoding must be a string')
// 			}
// 			if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
// 				throw new TypeError('Unknown encoding: ' + encoding)
// 			}
// 			if (val.length === 1) {
// 				var code = val.charCodeAt(0)
// 				if ((encoding === 'utf8' && code < 128) ||
// 						encoding === 'latin1') {
// 					// Fast path: If `val` fits into a single byte, use that numeric value.
// 					val = code
// 				}
// 			}
// 		} else if (typeof val === 'number') {
// 			val = val & 255
// 		}
	
// 		// Invalid ranges are not set to a default, so can range check early.
// 		if (start < 0 || this.length < start || this.length < end) {
// 			throw new RangeError('Out of range index')
// 		}
	
// 		if (end <= start) {
// 			return this
// 		}
	
// 		start = start >>> 0
// 		end = end === undefined ? this.length : end >>> 0
	
// 		if (!val) val = 0
	
// 		var i
// 		if (typeof val === 'number') {
// 			for (i = start; i < end; ++i) {
// 				this[i] = val
// 			}
// 		} else {
// 			var bytes = Buffer.isBuffer(val)
// 				? val
// 				: Buffer.from(val, encoding)
// 			var len = bytes.length
// 			if (len === 0) {
// 				throw new TypeError('The value "' + val +
// 					'" is invalid for argument "value"')
// 			}
// 			for (i = 0; i < end - start; ++i) {
// 				this[i + start] = bytes[i % len]
// 			}
// 		}
	
// 		return this
// 	}
	
// 	// HELPER FUNCTIONS
// 	// ================
	
// 	var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g
	
// 	function base64clean (str) {
// 		// Node takes equal signs as end of the Base64 encoding
// 		str = str.split('=')[0]
// 		// Node strips out invalid characters like \n and \t from the string, base64-js does not
// 		str = str.trim().replace(INVALID_BASE64_RE, '')
// 		// Node converts strings with length < 2 to ''
// 		if (str.length < 2) return ''
// 		// Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
// 		while (str.length % 4 !== 0) {
// 			str = str + '='
// 		}
// 		return str
// 	}
	
// 	function toHex (n) {
// 		if (n < 16) return '0' + n.toString(16)
// 		return n.toString(16)
// 	}
	
// 	function utf8ToBytes (string, units) {
// 		units = units || Infinity
// 		var codePoint
// 		var length = string.length
// 		var leadSurrogate = null
// 		var bytes = []
	
// 		for (var i = 0; i < length; ++i) {
// 			codePoint = string.charCodeAt(i)
	
// 			// is surrogate component
// 			if (codePoint > 0xD7FF && codePoint < 0xE000) {
// 				// last char was a lead
// 				if (!leadSurrogate) {
// 					// no lead yet
// 					if (codePoint > 0xDBFF) {
// 						// unexpected trail
// 						if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
// 						continue
// 					} else if (i + 1 === length) {
// 						// unpaired lead
// 						if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
// 						continue
// 					}
	
// 					// valid lead
// 					leadSurrogate = codePoint
	
// 					continue
// 				}
	
// 				// 2 leads in a row
// 				if (codePoint < 0xDC00) {
// 					if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
// 					leadSurrogate = codePoint
// 					continue
// 				}
	
// 				// valid surrogate pair
// 				codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
// 			} else if (leadSurrogate) {
// 				// valid bmp char, but last char was a lead
// 				if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
// 			}
	
// 			leadSurrogate = null
	
// 			// encode utf8
// 			if (codePoint < 0x80) {
// 				if ((units -= 1) < 0) break
// 				bytes.push(codePoint)
// 			} else if (codePoint < 0x800) {
// 				if ((units -= 2) < 0) break
// 				bytes.push(
// 					codePoint >> 0x6 | 0xC0,
// 					codePoint & 0x3F | 0x80
// 				)
// 			} else if (codePoint < 0x10000) {
// 				if ((units -= 3) < 0) break
// 				bytes.push(
// 					codePoint >> 0xC | 0xE0,
// 					codePoint >> 0x6 & 0x3F | 0x80,
// 					codePoint & 0x3F | 0x80
// 				)
// 			} else if (codePoint < 0x110000) {
// 				if ((units -= 4) < 0) break
// 				bytes.push(
// 					codePoint >> 0x12 | 0xF0,
// 					codePoint >> 0xC & 0x3F | 0x80,
// 					codePoint >> 0x6 & 0x3F | 0x80,
// 					codePoint & 0x3F | 0x80
// 				)
// 			} else {
// 				throw new Error('Invalid code point')
// 			}
// 		}
	
// 		return bytes
// 	}
	
// 	function asciiToBytes (str) {
// 		var byteArray = []
// 		for (var i = 0; i < str.length; ++i) {
// 			// Node's code seems to be doing this and not & 0x7F..
// 			byteArray.push(str.charCodeAt(i) & 0xFF)
// 		}
// 		return byteArray
// 	}
	
// 	function utf16leToBytes (str, units) {
// 		var c, hi, lo
// 		var byteArray = []
// 		for (var i = 0; i < str.length; ++i) {
// 			if ((units -= 2) < 0) break
	
// 			c = str.charCodeAt(i)
// 			hi = c >> 8
// 			lo = c % 256
// 			byteArray.push(lo)
// 			byteArray.push(hi)
// 		}
	
// 		return byteArray
// 	}
	
// 	function base64ToBytes (str) {
// 		return base64.toByteArray(base64clean(str))
// 	}
	
// 	function blitBuffer (src, dst, offset, length) {
// 		for (var i = 0; i < length; ++i) {
// 			if ((i + offset >= dst.length) || (i >= src.length)) break
// 			dst[i + offset] = src[i]
// 		}
// 		return i
// 	}
	
// 	// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// 	// the `instanceof` check but they should be treated as of that type.
// 	// See: https://github.com/feross/buffer/issues/166
// 	function isInstance (obj, type) {
// 		return obj instanceof type ||
// 			(obj != null && obj.constructor != null && obj.constructor.name != null &&
// 				obj.constructor.name === type.name)
// 	}
// 	function numberIsNaN (obj) {
// 		// For IE11 support
// 		return obj !== obj // eslint-disable-line no-self-compare
// 	}
	
// 	},{"base64-js":10,"ieee754":79}],13:[function(require,module,exports){
// 	// Copyright Joyent, Inc. and other Node contributors.
// 	//
// 	// Permission is hereby granted, free of charge, to any person obtaining a
// 	// copy of this software and associated documentation files (the
// 	// "Software"), to deal in the Software without restriction, including
// 	// without limitation the rights to use, copy, modify, merge, publish,
// 	// distribute, sublicense, and/or sell copies of the Software, and to permit
// 	// persons to whom the Software is furnished to do so, subject to the
// 	// following conditions:
// 	//
// 	// The above copyright notice and this permission notice shall be included
// 	// in all copies or substantial portions of the Software.
// 	//
// 	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// 	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// 	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// 	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// 	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// 	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// 	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
// 	var objectCreate = Object.create || objectCreatePolyfill
// 	var objectKeys = Object.keys || objectKeysPolyfill
// 	var bind = Function.prototype.bind || functionBindPolyfill
	
// 	function EventEmitter() {
// 		if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
// 			this._events = objectCreate(null);
// 			this._eventsCount = 0;
// 		}
	
// 		this._maxListeners = this._maxListeners || undefined;
// 	}
// 	module.exports = EventEmitter;
	
// 	// Backwards-compat with node 0.10.x
// 	EventEmitter.EventEmitter = EventEmitter;
	
// 	EventEmitter.prototype._events = undefined;
// 	EventEmitter.prototype._maxListeners = undefined;
	
// 	// By default EventEmitters will print a warning if more than 10 listeners are
// 	// added to it. This is a useful default which helps finding memory leaks.
// 	var defaultMaxListeners = 10;
	
// 	var hasDefineProperty;
// 	try {
// 		var o = {};
// 		if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
// 		hasDefineProperty = o.x === 0;
// 	} catch (err) { hasDefineProperty = false }
// 	if (hasDefineProperty) {
// 		Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
// 			enumerable: true,
// 			get: function() {
// 				return defaultMaxListeners;
// 			},
// 			set: function(arg) {
// 				// check whether the input is a positive number (whose value is zero or
// 				// greater and not a NaN).
// 				if (typeof arg !== 'number' || arg < 0 || arg !== arg)
// 					throw new TypeError('"defaultMaxListeners" must be a positive number');
// 				defaultMaxListeners = arg;
// 			}
// 		});
// 	} else {
// 		EventEmitter.defaultMaxListeners = defaultMaxListeners;
// 	}
	
// 	// Obviously not all Emitters should be limited to 10. This function allows
// 	// that to be increased. Set to zero for unlimited.
// 	EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
// 		if (typeof n !== 'number' || n < 0 || isNaN(n))
// 			throw new TypeError('"n" argument must be a positive number');
// 		this._maxListeners = n;
// 		return this;
// 	};
	
// 	function $getMaxListeners(that) {
// 		if (that._maxListeners === undefined)
// 			return EventEmitter.defaultMaxListeners;
// 		return that._maxListeners;
// 	}
	
// 	EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
// 		return $getMaxListeners(this);
// 	};
	
// 	// These standalone emit* functions are used to optimize calling of event
// 	// handlers for fast cases because emit() itself often has a variable number of
// 	// arguments and can be deoptimized because of that. These functions always have
// 	// the same number of arguments and thus do not get deoptimized, so the code
// 	// inside them can execute faster.
// 	function emitNone(handler, isFn, self) {
// 		if (isFn)
// 			handler.call(self);
// 		else {
// 			var len = handler.length;
// 			var listeners = arrayClone(handler, len);
// 			for (var i = 0; i < len; ++i)
// 				listeners[i].call(self);
// 		}
// 	}
// 	function emitOne(handler, isFn, self, arg1) {
// 		if (isFn)
// 			handler.call(self, arg1);
// 		else {
// 			var len = handler.length;
// 			var listeners = arrayClone(handler, len);
// 			for (var i = 0; i < len; ++i)
// 				listeners[i].call(self, arg1);
// 		}
// 	}
// 	function emitTwo(handler, isFn, self, arg1, arg2) {
// 		if (isFn)
// 			handler.call(self, arg1, arg2);
// 		else {
// 			var len = handler.length;
// 			var listeners = arrayClone(handler, len);
// 			for (var i = 0; i < len; ++i)
// 				listeners[i].call(self, arg1, arg2);
// 		}
// 	}
// 	function emitThree(handler, isFn, self, arg1, arg2, arg3) {
// 		if (isFn)
// 			handler.call(self, arg1, arg2, arg3);
// 		else {
// 			var len = handler.length;
// 			var listeners = arrayClone(handler, len);
// 			for (var i = 0; i < len; ++i)
// 				listeners[i].call(self, arg1, arg2, arg3);
// 		}
// 	}
	
// 	function emitMany(handler, isFn, self, args) {
// 		if (isFn)
// 			handler.apply(self, args);
// 		else {
// 			var len = handler.length;
// 			var listeners = arrayClone(handler, len);
// 			for (var i = 0; i < len; ++i)
// 				listeners[i].apply(self, args);
// 		}
// 	}
	
// 	EventEmitter.prototype.emit = function emit(type) {
// 		var er, handler, len, args, i, events;
// 		var doError = (type === 'error');
	
// 		events = this._events;
// 		if (events)
// 			doError = (doError && events.error == null);
// 		else if (!doError)
// 			return false;
	
// 		// If there is no 'error' event listener then throw.
// 		if (doError) {
// 			if (arguments.length > 1)
// 				er = arguments[1];
// 			if (er instanceof Error) {
// 				throw er; // Unhandled 'error' event
// 			} else {
// 				// At least give some kind of context to the user
// 				var err = new Error('Unhandled "error" event. (' + er + ')');
// 				err.context = er;
// 				throw err;
// 			}
// 			return false;
// 		}
	
// 		handler = events[type];
	
// 		if (!handler)
// 			return false;
	
// 		var isFn = typeof handler === 'function';
// 		len = arguments.length;
// 		switch (len) {
// 				// fast cases
// 			case 1:
// 				emitNone(handler, isFn, this);
// 				break;
// 			case 2:
// 				emitOne(handler, isFn, this, arguments[1]);
// 				break;
// 			case 3:
// 				emitTwo(handler, isFn, this, arguments[1], arguments[2]);
// 				break;
// 			case 4:
// 				emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
// 				break;
// 				// slower
// 			default:
// 				args = new Array(len - 1);
// 				for (i = 1; i < len; i++)
// 					args[i - 1] = arguments[i];
// 				emitMany(handler, isFn, this, args);
// 		}
	
// 		return true;
// 	};
	
// 	function _addListener(target, type, listener, prepend) {
// 		var m;
// 		var events;
// 		var existing;
	
// 		if (typeof listener !== 'function')
// 			throw new TypeError('"listener" argument must be a function');
	
// 		events = target._events;
// 		if (!events) {
// 			events = target._events = objectCreate(null);
// 			target._eventsCount = 0;
// 		} else {
// 			// To avoid recursion in the case that type === "newListener"! Before
// 			// adding it to the listeners, first emit "newListener".
// 			if (events.newListener) {
// 				target.emit('newListener', type,
// 						listener.listener ? listener.listener : listener);
	
// 				// Re-assign `events` because a newListener handler could have caused the
// 				// this._events to be assigned to a new object
// 				events = target._events;
// 			}
// 			existing = events[type];
// 		}
	
// 		if (!existing) {
// 			// Optimize the case of one listener. Don't need the extra array object.
// 			existing = events[type] = listener;
// 			++target._eventsCount;
// 		} else {
// 			if (typeof existing === 'function') {
// 				// Adding the second element, need to change to array.
// 				existing = events[type] =
// 						prepend ? [listener, existing] : [existing, listener];
// 			} else {
// 				// If we've already got an array, just append.
// 				if (prepend) {
// 					existing.unshift(listener);
// 				} else {
// 					existing.push(listener);
// 				}
// 			}
	
// 			// Check for listener leak
// 			if (!existing.warned) {
// 				m = $getMaxListeners(target);
// 				if (m && m > 0 && existing.length > m) {
// 					existing.warned = true;
// 					var w = new Error('Possible EventEmitter memory leak detected. ' +
// 							existing.length + ' "' + String(type) + '" listeners ' +
// 							'added. Use emitter.setMaxListeners() to ' +
// 							'increase limit.');
// 					w.name = 'MaxListenersExceededWarning';
// 					w.emitter = target;
// 					w.type = type;
// 					w.count = existing.length;
// 					if (typeof console === 'object' && console.warn) {
// 						console.warn('%s: %s', w.name, w.message);
// 					}
// 				}
// 			}
// 		}
	
// 		return target;
// 	}
	
// 	EventEmitter.prototype.addListener = function addListener(type, listener) {
// 		return _addListener(this, type, listener, false);
// 	};
	
// 	EventEmitter.prototype.on = EventEmitter.prototype.addListener;
	
// 	EventEmitter.prototype.prependListener =
// 			function prependListener(type, listener) {
// 				return _addListener(this, type, listener, true);
// 			};
	
// 	function onceWrapper() {
// 		if (!this.fired) {
// 			this.target.removeListener(this.type, this.wrapFn);
// 			this.fired = true;
// 			switch (arguments.length) {
// 				case 0:
// 					return this.listener.call(this.target);
// 				case 1:
// 					return this.listener.call(this.target, arguments[0]);
// 				case 2:
// 					return this.listener.call(this.target, arguments[0], arguments[1]);
// 				case 3:
// 					return this.listener.call(this.target, arguments[0], arguments[1],
// 							arguments[2]);
// 				default:
// 					var args = new Array(arguments.length);
// 					for (var i = 0; i < args.length; ++i)
// 						args[i] = arguments[i];
// 					this.listener.apply(this.target, args);
// 			}
// 		}
// 	}
	
// 	function _onceWrap(target, type, listener) {
// 		var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
// 		var wrapped = bind.call(onceWrapper, state);
// 		wrapped.listener = listener;
// 		state.wrapFn = wrapped;
// 		return wrapped;
// 	}
	
// 	EventEmitter.prototype.once = function once(type, listener) {
// 		if (typeof listener !== 'function')
// 			throw new TypeError('"listener" argument must be a function');
// 		this.on(type, _onceWrap(this, type, listener));
// 		return this;
// 	};
	
// 	EventEmitter.prototype.prependOnceListener =
// 			function prependOnceListener(type, listener) {
// 				if (typeof listener !== 'function')
// 					throw new TypeError('"listener" argument must be a function');
// 				this.prependListener(type, _onceWrap(this, type, listener));
// 				return this;
// 			};
	
// 	// Emits a 'removeListener' event if and only if the listener was removed.
// 	EventEmitter.prototype.removeListener =
// 			function removeListener(type, listener) {
// 				var list, events, position, i, originalListener;
	
// 				if (typeof listener !== 'function')
// 					throw new TypeError('"listener" argument must be a function');
	
// 				events = this._events;
// 				if (!events)
// 					return this;
	
// 				list = events[type];
// 				if (!list)
// 					return this;
	
// 				if (list === listener || list.listener === listener) {
// 					if (--this._eventsCount === 0)
// 						this._events = objectCreate(null);
// 					else {
// 						delete events[type];
// 						if (events.removeListener)
// 							this.emit('removeListener', type, list.listener || listener);
// 					}
// 				} else if (typeof list !== 'function') {
// 					position = -1;
	
// 					for (i = list.length - 1; i >= 0; i--) {
// 						if (list[i] === listener || list[i].listener === listener) {
// 							originalListener = list[i].listener;
// 							position = i;
// 							break;
// 						}
// 					}
	
// 					if (position < 0)
// 						return this;
	
// 					if (position === 0)
// 						list.shift();
// 					else
// 						spliceOne(list, position);
	
// 					if (list.length === 1)
// 						events[type] = list[0];
	
// 					if (events.removeListener)
// 						this.emit('removeListener', type, originalListener || listener);
// 				}
	
// 				return this;
// 			};
	
// 	EventEmitter.prototype.removeAllListeners =
// 			function removeAllListeners(type) {
// 				var listeners, events, i;
	
// 				events = this._events;
// 				if (!events)
// 					return this;
	
// 				// not listening for removeListener, no need to emit
// 				if (!events.removeListener) {
// 					if (arguments.length === 0) {
// 						this._events = objectCreate(null);
// 						this._eventsCount = 0;
// 					} else if (events[type]) {
// 						if (--this._eventsCount === 0)
// 							this._events = objectCreate(null);
// 						else
// 							delete events[type];
// 					}
// 					return this;
// 				}
	
// 				// emit removeListener for all listeners on all events
// 				if (arguments.length === 0) {
// 					var keys = objectKeys(events);
// 					var key;
// 					for (i = 0; i < keys.length; ++i) {
// 						key = keys[i];
// 						if (key === 'removeListener') continue;
// 						this.removeAllListeners(key);
// 					}
// 					this.removeAllListeners('removeListener');
// 					this._events = objectCreate(null);
// 					this._eventsCount = 0;
// 					return this;
// 				}
	
// 				listeners = events[type];
	
// 				if (typeof listeners === 'function') {
// 					this.removeListener(type, listeners);
// 				} else if (listeners) {
// 					// LIFO order
// 					for (i = listeners.length - 1; i >= 0; i--) {
// 						this.removeListener(type, listeners[i]);
// 					}
// 				}
	
// 				return this;
// 			};
	
// 	function _listeners(target, type, unwrap) {
// 		var events = target._events;
	
// 		if (!events)
// 			return [];
	
// 		var evlistener = events[type];
// 		if (!evlistener)
// 			return [];
	
// 		if (typeof evlistener === 'function')
// 			return unwrap ? [evlistener.listener || evlistener] : [evlistener];
	
// 		return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
// 	}
	
// 	EventEmitter.prototype.listeners = function listeners(type) {
// 		return _listeners(this, type, true);
// 	};
	
// 	EventEmitter.prototype.rawListeners = function rawListeners(type) {
// 		return _listeners(this, type, false);
// 	};
	
// 	EventEmitter.listenerCount = function(emitter, type) {
// 		if (typeof emitter.listenerCount === 'function') {
// 			return emitter.listenerCount(type);
// 		} else {
// 			return listenerCount.call(emitter, type);
// 		}
// 	};
	
// 	EventEmitter.prototype.listenerCount = listenerCount;
// 	function listenerCount(type) {
// 		var events = this._events;
	
// 		if (events) {
// 			var evlistener = events[type];
	
// 			if (typeof evlistener === 'function') {
// 				return 1;
// 			} else if (evlistener) {
// 				return evlistener.length;
// 			}
// 		}
	
// 		return 0;
// 	}
	
// 	EventEmitter.prototype.eventNames = function eventNames() {
// 		return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
// 	};
	
// 	// About 1.5x faster than the two-arg version of Array#splice().
// 	function spliceOne(list, index) {
// 		for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
// 			list[i] = list[k];
// 		list.pop();
// 	}
	
// 	function arrayClone(arr, n) {
// 		var copy = new Array(n);
// 		for (var i = 0; i < n; ++i)
// 			copy[i] = arr[i];
// 		return copy;
// 	}
	
// 	function unwrapListeners(arr) {
// 		var ret = new Array(arr.length);
// 		for (var i = 0; i < ret.length; ++i) {
// 			ret[i] = arr[i].listener || arr[i];
// 		}
// 		return ret;
// 	}
	
// 	function objectCreatePolyfill(proto) {
// 		var F = function() {};
// 		F.prototype = proto;
// 		return new F;
// 	}
// 	function objectKeysPolyfill(obj) {
// 		var keys = [];
// 		for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
// 			keys.push(k);
// 		}
// 		return k;
// 	}
// 	function functionBindPolyfill(context) {
// 		var fn = this;
// 		return function () {
// 			return fn.apply(context, arguments);
// 		};
// 	}
	
// 	},{}],14:[function(require,module,exports){
// 	(function (Buffer){
// 	// Copyright Joyent, Inc. and other Node contributors.
// 	//
// 	// Permission is hereby granted, free of charge, to any person obtaining a
// 	// copy of this software and associated documentation files (the
// 	// "Software"), to deal in the Software without restriction, including
// 	// without limitation the rights to use, copy, modify, merge, publish,
// 	// distribute, sublicense, and/or sell copies of the Software, and to permit
// 	// persons to whom the Software is furnished to do so, subject to the
// 	// following conditions:
// 	//
// 	// The above copyright notice and this permission notice shall be included
// 	// in all copies or substantial portions of the Software.
// 	//
// 	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// 	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// 	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// 	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// 	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// 	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// 	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
// 	// NOTE: These type checking functions intentionally don't use `instanceof`
// 	// because it is fragile and can be easily faked with `Object.create()`.
	
// 	function isArray(arg) {
// 		if (Array.isArray) {
// 			return Array.isArray(arg);
// 		}
// 		return objectToString(arg) === '[object Array]';
// 	}
// 	exports.isArray = isArray;
	
// 	function isBoolean(arg) {
// 		return typeof arg === 'boolean';
// 	}
// 	exports.isBoolean = isBoolean;
	
// 	function isNull(arg) {
// 		return arg === null;
// 	}
// 	exports.isNull = isNull;
	
// 	function isNullOrUndefined(arg) {
// 		return arg == null;
// 	}
// 	exports.isNullOrUndefined = isNullOrUndefined;
	
// 	function isNumber(arg) {
// 		return typeof arg === 'number';
// 	}
// 	exports.isNumber = isNumber;
	
// 	function isString(arg) {
// 		return typeof arg === 'string';
// 	}
// 	exports.isString = isString;
	
// 	function isSymbol(arg) {
// 		return typeof arg === 'symbol';
// 	}
// 	exports.isSymbol = isSymbol;
	
// 	function isUndefined(arg) {
// 		return arg === void 0;
// 	}
// 	exports.isUndefined = isUndefined;
	
// 	function isRegExp(re) {
// 		return objectToString(re) === '[object RegExp]';
// 	}
// 	exports.isRegExp = isRegExp;
	
// 	function isObject(arg) {
// 		return typeof arg === 'object' && arg !== null;
// 	}
// 	exports.isObject = isObject;
	
// 	function isDate(d) {
// 		return objectToString(d) === '[object Date]';
// 	}
// 	exports.isDate = isDate;
	
// 	function isError(e) {
// 		return (objectToString(e) === '[object Error]' || e instanceof Error);
// 	}
// 	exports.isError = isError;
	
// 	function isFunction(arg) {
// 		return typeof arg === 'function';
// 	}
// 	exports.isFunction = isFunction;
	
// 	function isPrimitive(arg) {
// 		return arg === null ||
// 					 typeof arg === 'boolean' ||
// 					 typeof arg === 'number' ||
// 					 typeof arg === 'string' ||
// 					 typeof arg === 'symbol' ||  // ES6 symbol
// 					 typeof arg === 'undefined';
// 	}
// 	exports.isPrimitive = isPrimitive;
	
// 	exports.isBuffer = Buffer.isBuffer;
	
// 	function objectToString(o) {
// 		return Object.prototype.toString.call(o);
// 	}
	
// 	}).call(this,{"isBuffer":require("../../is-buffer/index.js")})
// 	},{"../../is-buffer/index.js":81}],15:[function(require,module,exports){
// 	'use strict';
	
// 	var copy             = require('es5-ext/object/copy')
// 		, normalizeOptions = require('es5-ext/object/normalize-options')
// 		, ensureCallable   = require('es5-ext/object/valid-callable')
// 		, map              = require('es5-ext/object/map')
// 		, callable         = require('es5-ext/object/valid-callable')
// 		, validValue       = require('es5-ext/object/valid-value')
	
// 		, bind = Function.prototype.bind, defineProperty = Object.defineProperty
// 		, hasOwnProperty = Object.prototype.hasOwnProperty
// 		, define;
	
// 	define = function (name, desc, options) {
// 		var value = validValue(desc) && callable(desc.value), dgs;
// 		dgs = copy(desc);
// 		delete dgs.writable;
// 		delete dgs.value;
// 		dgs.get = function () {
// 			if (!options.overwriteDefinition && hasOwnProperty.call(this, name)) return value;
// 			desc.value = bind.call(value, options.resolveContext ? options.resolveContext(this) : this);
// 			defineProperty(this, name, desc);
// 			return this[name];
// 		};
// 		return dgs;
// 	};
	
// 	module.exports = function (props/*, options*/) {
// 		var options = normalizeOptions(arguments[1]);
// 		if (options.resolveContext != null) ensureCallable(options.resolveContext);
// 		return map(props, function (desc, name) { return define(name, desc, options); });
// 	};
	
// 	},{"es5-ext/object/copy":39,"es5-ext/object/map":48,"es5-ext/object/normalize-options":49,"es5-ext/object/valid-callable":54,"es5-ext/object/valid-value":55}],16:[function(require,module,exports){
// 	'use strict';
	
// 	var assign        = require('es5-ext/object/assign')
// 		, normalizeOpts = require('es5-ext/object/normalize-options')
// 		, isCallable    = require('es5-ext/object/is-callable')
// 		, contains      = require('es5-ext/string/#/contains')
	
// 		, d;
	
// 	d = module.exports = function (dscr, value/*, options*/) {
// 		var c, e, w, options, desc;
// 		if ((arguments.length < 2) || (typeof dscr !== 'string')) {
// 			options = value;
// 			value = dscr;
// 			dscr = null;
// 		} else {
// 			options = arguments[2];
// 		}
// 		if (dscr == null) {
// 			c = w = true;
// 			e = false;
// 		} else {
// 			c = contains.call(dscr, 'c');
// 			e = contains.call(dscr, 'e');
// 			w = contains.call(dscr, 'w');
// 		}
	
// 		desc = { value: value, configurable: c, enumerable: e, writable: w };
// 		return !options ? desc : assign(normalizeOpts(options), desc);
// 	};
	
// 	d.gs = function (dscr, get, set/*, options*/) {
// 		var c, e, options, desc;
// 		if (typeof dscr !== 'string') {
// 			options = set;
// 			set = get;
// 			get = dscr;
// 			dscr = null;
// 		} else {
// 			options = arguments[3];
// 		}
// 		if (get == null) {
// 			get = undefined;
// 		} else if (!isCallable(get)) {
// 			options = get;
// 			get = set = undefined;
// 		} else if (set == null) {
// 			set = undefined;
// 		} else if (!isCallable(set)) {
// 			options = set;
// 			set = undefined;
// 		}
// 		if (dscr == null) {
// 			c = true;
// 			e = false;
// 		} else {
// 			c = contains.call(dscr, 'c');
// 			e = contains.call(dscr, 'e');
// 		}
	
// 		desc = { get: get, set: set, configurable: c, enumerable: e };
// 		return !options ? desc : assign(normalizeOpts(options), desc);
// 	};
	
// 	},{"es5-ext/object/assign":36,"es5-ext/object/is-callable":42,"es5-ext/object/normalize-options":49,"es5-ext/string/#/contains":56}],17:[function(require,module,exports){
// 	(function (process,Buffer){
// 	var stream = require('readable-stream')
// 	var eos = require('end-of-stream')
// 	var inherits = require('inherits')
// 	var shift = require('stream-shift')
	
// 	var SIGNAL_FLUSH = (Buffer.from && Buffer.from !== Uint8Array.from)
// 		? Buffer.from([0])
// 		: new Buffer([0])
	
// 	var onuncork = function(self, fn) {
// 		if (self._corked) self.once('uncork', fn)
// 		else fn()
// 	}
	
// 	var autoDestroy = function (self, err) {
// 		if (self._autoDestroy) self.destroy(err)
// 	}
	
// 	var destroyer = function(self, end) {
// 		return function(err) {
// 			if (err) autoDestroy(self, err.message === 'premature close' ? null : err)
// 			else if (end && !self._ended) self.end()
// 		}
// 	}
	
// 	var end = function(ws, fn) {
// 		if (!ws) return fn()
// 		if (ws._writableState && ws._writableState.finished) return fn()
// 		if (ws._writableState) return ws.end(fn)
// 		ws.end()
// 		fn()
// 	}
	
// 	var toStreams2 = function(rs) {
// 		return new (stream.Readable)({objectMode:true, highWaterMark:16}).wrap(rs)
// 	}
	
// 	var Duplexify = function(writable, readable, opts) {
// 		if (!(this instanceof Duplexify)) return new Duplexify(writable, readable, opts)
// 		stream.Duplex.call(this, opts)
	
// 		this._writable = null
// 		this._readable = null
// 		this._readable2 = null
	
// 		this._autoDestroy = !opts || opts.autoDestroy !== false
// 		this._forwardDestroy = !opts || opts.destroy !== false
// 		this._forwardEnd = !opts || opts.end !== false
// 		this._corked = 1 // start corked
// 		this._ondrain = null
// 		this._drained = false
// 		this._forwarding = false
// 		this._unwrite = null
// 		this._unread = null
// 		this._ended = false
	
// 		this.destroyed = false
	
// 		if (writable) this.setWritable(writable)
// 		if (readable) this.setReadable(readable)
// 	}
	
// 	inherits(Duplexify, stream.Duplex)
	
// 	Duplexify.obj = function(writable, readable, opts) {
// 		if (!opts) opts = {}
// 		opts.objectMode = true
// 		opts.highWaterMark = 16
// 		return new Duplexify(writable, readable, opts)
// 	}
	
// 	Duplexify.prototype.cork = function() {
// 		if (++this._corked === 1) this.emit('cork')
// 	}
	
// 	Duplexify.prototype.uncork = function() {
// 		if (this._corked && --this._corked === 0) this.emit('uncork')
// 	}
	
// 	Duplexify.prototype.setWritable = function(writable) {
// 		if (this._unwrite) this._unwrite()
	
// 		if (this.destroyed) {
// 			if (writable && writable.destroy) writable.destroy()
// 			return
// 		}
	
// 		if (writable === null || writable === false) {
// 			this.end()
// 			return
// 		}
	
// 		var self = this
// 		var unend = eos(writable, {writable:true, readable:false}, destroyer(this, this._forwardEnd))
	
// 		var ondrain = function() {
// 			var ondrain = self._ondrain
// 			self._ondrain = null
// 			if (ondrain) ondrain()
// 		}
	
// 		var clear = function() {
// 			self._writable.removeListener('drain', ondrain)
// 			unend()
// 		}
	
// 		if (this._unwrite) process.nextTick(ondrain) // force a drain on stream reset to avoid livelocks
	
// 		this._writable = writable
// 		this._writable.on('drain', ondrain)
// 		this._unwrite = clear
	
// 		this.uncork() // always uncork setWritable
// 	}
	
// 	Duplexify.prototype.setReadable = function(readable) {
// 		if (this._unread) this._unread()
	
// 		if (this.destroyed) {
// 			if (readable && readable.destroy) readable.destroy()
// 			return
// 		}
	
// 		if (readable === null || readable === false) {
// 			this.push(null)
// 			this.resume()
// 			return
// 		}
	
// 		var self = this
// 		var unend = eos(readable, {writable:false, readable:true}, destroyer(this))
	
// 		var onreadable = function() {
// 			self._forward()
// 		}
	
// 		var onend = function() {
// 			self.push(null)
// 		}
	
// 		var clear = function() {
// 			self._readable2.removeListener('readable', onreadable)
// 			self._readable2.removeListener('end', onend)
// 			unend()
// 		}
	
// 		this._drained = true
// 		this._readable = readable
// 		this._readable2 = readable._readableState ? readable : toStreams2(readable)
// 		this._readable2.on('readable', onreadable)
// 		this._readable2.on('end', onend)
// 		this._unread = clear
	
// 		this._forward()
// 	}
	
// 	Duplexify.prototype._read = function() {
// 		this._drained = true
// 		this._forward()
// 	}
	
// 	Duplexify.prototype._forward = function() {
// 		if (this._forwarding || !this._readable2 || !this._drained) return
// 		this._forwarding = true
	
// 		var data
	
// 		while (this._drained && (data = shift(this._readable2)) !== null) {
// 			if (this.destroyed) continue
// 			this._drained = this.push(data)
// 		}
	
// 		this._forwarding = false
// 	}
	
// 	Duplexify.prototype.destroy = function(err) {
// 		if (this.destroyed) return
// 		this.destroyed = true
	
// 		var self = this
// 		process.nextTick(function() {
// 			self._destroy(err)
// 		})
// 	}
	
// 	Duplexify.prototype._destroy = function(err) {
// 		if (err) {
// 			var ondrain = this._ondrain
// 			this._ondrain = null
// 			if (ondrain) ondrain(err)
// 			else this.emit('error', err)
// 		}
	
// 		if (this._forwardDestroy) {
// 			if (this._readable && this._readable.destroy) this._readable.destroy()
// 			if (this._writable && this._writable.destroy) this._writable.destroy()
// 		}
	
// 		this.emit('close')
// 	}
	
// 	Duplexify.prototype._write = function(data, enc, cb) {
// 		if (this.destroyed) return cb()
// 		if (this._corked) return onuncork(this, this._write.bind(this, data, enc, cb))
// 		if (data === SIGNAL_FLUSH) return this._finish(cb)
// 		if (!this._writable) return cb()
	
// 		if (this._writable.write(data) === false) this._ondrain = cb
// 		else cb()
// 	}
	
// 	Duplexify.prototype._finish = function(cb) {
// 		var self = this
// 		this.emit('preend')
// 		onuncork(this, function() {
// 			end(self._forwardEnd && self._writable, function() {
// 				// haxx to not emit prefinish twice
// 				if (self._writableState.prefinished === false) self._writableState.prefinished = true
// 				self.emit('prefinish')
// 				onuncork(self, cb)
// 			})
// 		})
// 	}
	
// 	Duplexify.prototype.end = function(data, enc, cb) {
// 		if (typeof data === 'function') return this.end(null, null, data)
// 		if (typeof enc === 'function') return this.end(data, null, enc)
// 		this._ended = true
// 		if (data) this.write(data)
// 		if (!this._writableState.ending) this.write(SIGNAL_FLUSH)
// 		return stream.Writable.prototype.end.call(this, cb)
// 	}
	
// 	module.exports = Duplexify
	
// 	}).call(this,require('_process'),require("buffer").Buffer)
// 	},{"_process":92,"buffer":12,"end-of-stream":18,"inherits":80,"readable-stream":108,"stream-shift":111}],18:[function(require,module,exports){
// 	var once = require('once');
	
// 	var noop = function() {};
	
// 	var isRequest = function(stream) {
// 		return stream.setHeader && typeof stream.abort === 'function';
// 	};
	
// 	var isChildProcess = function(stream) {
// 		return stream.stdio && Array.isArray(stream.stdio) && stream.stdio.length === 3
// 	};
	
// 	var eos = function(stream, opts, callback) {
// 		if (typeof opts === 'function') return eos(stream, null, opts);
// 		if (!opts) opts = {};
	
// 		callback = once(callback || noop);
	
// 		var ws = stream._writableState;
// 		var rs = stream._readableState;
// 		var readable = opts.readable || (opts.readable !== false && stream.readable);
// 		var writable = opts.writable || (opts.writable !== false && stream.writable);
	
// 		var onlegacyfinish = function() {
// 			if (!stream.writable) onfinish();
// 		};
	
// 		var onfinish = function() {
// 			writable = false;
// 			if (!readable) callback.call(stream);
// 		};
	
// 		var onend = function() {
// 			readable = false;
// 			if (!writable) callback.call(stream);
// 		};
	
// 		var onexit = function(exitCode) {
// 			callback.call(stream, exitCode ? new Error('exited with error code: ' + exitCode) : null);
// 		};
	
// 		var onerror = function(err) {
// 			callback.call(stream, err);
// 		};
	
// 		var onclose = function() {
// 			if (readable && !(rs && rs.ended)) return callback.call(stream, new Error('premature close'));
// 			if (writable && !(ws && ws.ended)) return callback.call(stream, new Error('premature close'));
// 		};
	
// 		var onrequest = function() {
// 			stream.req.on('finish', onfinish);
// 		};
	
// 		if (isRequest(stream)) {
// 			stream.on('complete', onfinish);
// 			stream.on('abort', onclose);
// 			if (stream.req) onrequest();
// 			else stream.on('request', onrequest);
// 		} else if (writable && !ws) { // legacy streams
// 			stream.on('end', onlegacyfinish);
// 			stream.on('close', onlegacyfinish);
// 		}
	
// 		if (isChildProcess(stream)) stream.on('exit', onexit);
	
// 		stream.on('end', onend);
// 		stream.on('finish', onfinish);
// 		if (opts.error !== false) stream.on('error', onerror);
// 		stream.on('close', onclose);
	
// 		return function() {
// 			stream.removeListener('complete', onfinish);
// 			stream.removeListener('abort', onclose);
// 			stream.removeListener('request', onrequest);
// 			if (stream.req) stream.req.removeListener('finish', onfinish);
// 			stream.removeListener('end', onlegacyfinish);
// 			stream.removeListener('close', onlegacyfinish);
// 			stream.removeListener('finish', onfinish);
// 			stream.removeListener('exit', onexit);
// 			stream.removeListener('end', onend);
// 			stream.removeListener('error', onerror);
// 			stream.removeListener('close', onclose);
// 		};
// 	};
	
// 	module.exports = eos;
	
// 	},{"once":90}],19:[function(require,module,exports){
// 	// Inspired by Google Closure:
// 	// http://closure-library.googlecode.com/svn/docs/
// 	// closure_goog_array_array.js.html#goog.array.clear
	
// 	"use strict";
	
// 	var value = require("../../object/valid-value");
	
// 	module.exports = function () {
// 		value(this).length = 0;
// 		return this;
// 	};
	
// 	},{"../../object/valid-value":55}],20:[function(require,module,exports){
// 	"use strict";
	
// 	var numberIsNaN       = require("../../number/is-nan")
// 		, toPosInt          = require("../../number/to-pos-integer")
// 		, value             = require("../../object/valid-value")
// 		, indexOf           = Array.prototype.indexOf
// 		, objHasOwnProperty = Object.prototype.hasOwnProperty
// 		, abs               = Math.abs
// 		, floor             = Math.floor;
	
// 	module.exports = function (searchElement /*, fromIndex*/) {
// 		var i, length, fromIndex, val;
// 		if (!numberIsNaN(searchElement)) return indexOf.apply(this, arguments);
	
// 		length = toPosInt(value(this).length);
// 		fromIndex = arguments[1];
// 		if (isNaN(fromIndex)) fromIndex = 0;
// 		else if (fromIndex >= 0) fromIndex = floor(fromIndex);
// 		else fromIndex = toPosInt(this.length) - floor(abs(fromIndex));
	
// 		for (i = fromIndex; i < length; ++i) {
// 			if (objHasOwnProperty.call(this, i)) {
// 				val = this[i];
// 				if (numberIsNaN(val)) return i; // Jslint: ignore
// 			}
// 		}
// 		return -1;
// 	};
	
// 	},{"../../number/is-nan":30,"../../number/to-pos-integer":34,"../../object/valid-value":55}],21:[function(require,module,exports){
// 	"use strict";
	
// 	module.exports = require("./is-implemented")()
// 		? Array.from
// 		: require("./shim");
	
// 	},{"./is-implemented":22,"./shim":23}],22:[function(require,module,exports){
// 	"use strict";
	
// 	module.exports = function () {
// 		var from = Array.from, arr, result;
// 		if (typeof from !== "function") return false;
// 		arr = ["raz", "dwa"];
// 		result = from(arr);
// 		return Boolean(result && (result !== arr) && (result[1] === "dwa"));
// 	};
	
// 	},{}],23:[function(require,module,exports){
// 	"use strict";
	
// 	var iteratorSymbol = require("es6-symbol").iterator
// 		, isArguments    = require("../../function/is-arguments")
// 		, isFunction     = require("../../function/is-function")
// 		, toPosInt       = require("../../number/to-pos-integer")
// 		, callable       = require("../../object/valid-callable")
// 		, validValue     = require("../../object/valid-value")
// 		, isValue        = require("../../object/is-value")
// 		, isString       = require("../../string/is-string")
// 		, isArray        = Array.isArray
// 		, call           = Function.prototype.call
// 		, desc           = { configurable: true, enumerable: true, writable: true, value: null }
// 		, defineProperty = Object.defineProperty;
	
// 	// eslint-disable-next-line complexity, max-lines-per-function
// 	module.exports = function (arrayLike /*, mapFn, thisArg*/) {
// 		var mapFn = arguments[1]
// 			, thisArg = arguments[2]
// 			, Context
// 			, i
// 			, j
// 			, arr
// 			, length
// 			, code
// 			, iterator
// 			, result
// 			, getIterator
// 			, value;
	
// 		arrayLike = Object(validValue(arrayLike));
	
// 		if (isValue(mapFn)) callable(mapFn);
// 		if (!this || this === Array || !isFunction(this)) {
// 			// Result: Plain array
// 			if (!mapFn) {
// 				if (isArguments(arrayLike)) {
// 					// Source: Arguments
// 					length = arrayLike.length;
// 					if (length !== 1) return Array.apply(null, arrayLike);
// 					arr = new Array(1);
// 					arr[0] = arrayLike[0];
// 					return arr;
// 				}
// 				if (isArray(arrayLike)) {
// 					// Source: Array
// 					arr = new Array(length = arrayLike.length);
// 					for (i = 0; i < length; ++i) arr[i] = arrayLike[i];
// 					return arr;
// 				}
// 			}
// 			arr = [];
// 		} else {
// 			// Result: Non plain array
// 			Context = this;
// 		}
	
// 		if (!isArray(arrayLike)) {
// 			if ((getIterator = arrayLike[iteratorSymbol]) !== undefined) {
// 				// Source: Iterator
// 				iterator = callable(getIterator).call(arrayLike);
// 				if (Context) arr = new Context();
// 				result = iterator.next();
// 				i = 0;
// 				while (!result.done) {
// 					value = mapFn ? call.call(mapFn, thisArg, result.value, i) : result.value;
// 					if (Context) {
// 						desc.value = value;
// 						defineProperty(arr, i, desc);
// 					} else {
// 						arr[i] = value;
// 					}
// 					result = iterator.next();
// 					++i;
// 				}
// 				length = i;
// 			} else if (isString(arrayLike)) {
// 				// Source: String
// 				length = arrayLike.length;
// 				if (Context) arr = new Context();
// 				for (i = 0, j = 0; i < length; ++i) {
// 					value = arrayLike[i];
// 					if (i + 1 < length) {
// 						code = value.charCodeAt(0);
// 						// eslint-disable-next-line max-depth
// 						if (code >= 0xd800 && code <= 0xdbff) value += arrayLike[++i];
// 					}
// 					value = mapFn ? call.call(mapFn, thisArg, value, j) : value;
// 					if (Context) {
// 						desc.value = value;
// 						defineProperty(arr, j, desc);
// 					} else {
// 						arr[j] = value;
// 					}
// 					++j;
// 				}
// 				length = j;
// 			}
// 		}
// 		if (length === undefined) {
// 			// Source: array or array-like
// 			length = toPosInt(arrayLike.length);
// 			if (Context) arr = new Context(length);
// 			for (i = 0; i < length; ++i) {
// 				value = mapFn ? call.call(mapFn, thisArg, arrayLike[i], i) : arrayLike[i];
// 				if (Context) {
// 					desc.value = value;
// 					defineProperty(arr, i, desc);
// 				} else {
// 					arr[i] = value;
// 				}
// 			}
// 		}
// 		if (Context) {
// 			desc.value = null;
// 			arr.length = length;
// 		}
// 		return arr;
// 	};
	
// 	},{"../../function/is-arguments":24,"../../function/is-function":25,"../../number/to-pos-integer":34,"../../object/is-value":44,"../../object/valid-callable":54,"../../object/valid-value":55,"../../string/is-string":59,"es6-symbol":73}],24:[function(require,module,exports){
// 	"use strict";
	
// 	var objToString = Object.prototype.toString
// 		, id = objToString.call(
// 		(function () {
// 			return arguments;
// 		})()
// 	);
	
// 	module.exports = function (value) {
// 		return objToString.call(value) === id;
// 	};
	
// 	},{}],25:[function(require,module,exports){
// 	"use strict";
	
// 	var objToString = Object.prototype.toString, id = objToString.call(require("./noop"));
	
// 	module.exports = function (value) {
// 		return typeof value === "function" && objToString.call(value) === id;
// 	};
	
// 	},{"./noop":26}],26:[function(require,module,exports){
// 	"use strict";
	
// 	// eslint-disable-next-line no-empty-function
// 	module.exports = function () {};
	
// 	},{}],27:[function(require,module,exports){
// 	"use strict";
	
// 	module.exports = require("./is-implemented")()
// 		? Math.sign
// 		: require("./shim");
	
// 	},{"./is-implemented":28,"./shim":29}],28:[function(require,module,exports){
// 	"use strict";
	
// 	module.exports = function () {
// 		var sign = Math.sign;
// 		if (typeof sign !== "function") return false;
// 		return (sign(10) === 1) && (sign(-20) === -1);
// 	};
	
// 	},{}],29:[function(require,module,exports){
// 	"use strict";
	
// 	module.exports = function (value) {
// 		value = Number(value);
// 		if (isNaN(value) || (value === 0)) return value;
// 		return value > 0 ? 1 : -1;
// 	};
	
// 	},{}],30:[function(require,module,exports){
// 	"use strict";
	
// 	module.exports = require("./is-implemented")()
// 		? Number.isNaN
// 		: require("./shim");
	
// 	},{"./is-implemented":31,"./shim":32}],31:[function(require,module,exports){
// 	"use strict";
	
// 	module.exports = function () {
// 		var numberIsNaN = Number.isNaN;
// 		if (typeof numberIsNaN !== "function") return false;
// 		return !numberIsNaN({}) && numberIsNaN(NaN) && !numberIsNaN(34);
// 	};
	
// 	},{}],32:[function(require,module,exports){
// 	"use strict";
	
// 	module.exports = function (value) {
// 		// eslint-disable-next-line no-self-compare
// 		return value !== value;
// 	};
	
// 	},{}],33:[function(require,module,exports){
// 	"use strict";
	
// 	var sign = require("../math/sign")
	
// 		, abs = Math.abs, floor = Math.floor;
	
// 	module.exports = function (value) {
// 		if (isNaN(value)) return 0;
// 		value = Number(value);
// 		if ((value === 0) || !isFinite(value)) return value;
// 		return sign(value) * floor(abs(value));
// 	};
	
// 	},{"../math/sign":27}],34:[function(require,module,exports){
// 	"use strict";
	
// 	var toInteger = require("./to-integer")
	
// 		, max = Math.max;
	
// 	module.exports = function (value) {
// 	 return max(0, toInteger(value));
// 	};
	
// 	},{"./to-integer":33}],35:[function(require,module,exports){
// 	// Internal method, used by iteration functions.
// 	// Calls a function for each key-value pair found in object
// 	// Optionally takes compareFn to iterate object in specific order
	
// 	"use strict";
	
// 	var callable                = require("./valid-callable")
// 		, value                   = require("./valid-value")
// 		, bind                    = Function.prototype.bind
// 		, call                    = Function.prototype.call
// 		, keys                    = Object.keys
// 		, objPropertyIsEnumerable = Object.prototype.propertyIsEnumerable;
	
// 	module.exports = function (method, defVal) {
// 		return function (obj, cb /*, thisArg, compareFn*/) {
// 			var list, thisArg = arguments[2], compareFn = arguments[3];
// 			obj = Object(value(obj));
// 			callable(cb);
	
// 			list = keys(obj);
// 			if (compareFn) {
// 				list.sort(typeof compareFn === "function" ? bind.call(compareFn, obj) : undefined);
// 			}
// 			if (typeof method !== "function") method = list[method];
// 			return call.call(method, list, function (key, index) {
// 				if (!objPropertyIsEnumerable.call(obj, key)) return defVal;
// 				return call.call(cb, thisArg, obj[key], key, obj, index);
// 			});
// 		};
// 	};
	
// 	},{"./valid-callable":54,"./valid-value":55}],36:[function(require,module,exports){
// 	"use strict";
	
// 	module.exports = require("./is-implemented")()
// 		? Object.assign
// 		: require("./shim");
	
// 	},{"./is-implemented":37,"./shim":38}],37:[function(require,module,exports){
// 	"use strict";
	
// 	module.exports = function () {
// 		var assign = Object.assign, obj;
// 		if (typeof assign !== "function") return false;
// 		obj = { foo: "raz" };
// 		assign(obj, { bar: "dwa" }, { trzy: "trzy" });
// 		return (obj.foo + obj.bar + obj.trzy) === "razdwatrzy";
// 	};
	
// 	},{}],38:[function(require,module,exports){
// 	"use strict";
	
// 	var keys  = require("../keys")
// 		, value = require("../valid-value")
// 		, max   = Math.max;
	
// 	module.exports = function (dest, src /*, …srcn*/) {
// 		var error, i, length = max(arguments.length, 2), assign;
// 		dest = Object(value(dest));
// 		assign = function (key) {
// 			try {
// 				dest[key] = src[key];
// 			} catch (e) {
// 				if (!error) error = e;
// 			}
// 		};
// 		for (i = 1; i < length; ++i) {
// 			src = arguments[i];
// 			keys(src).forEach(assign);
// 		}
// 		if (error !== undefined) throw error;
// 		return dest;
// 	};
	
// 	},{"../keys":45,"../valid-value":55}],39:[function(require,module,exports){
// 	"use strict";
	
// 	var aFrom  = require("../array/from")
// 		, assign = require("./assign")
// 		, value  = require("./valid-value");
	
// 	module.exports = function (obj/*, propertyNames, options*/) {
// 		var copy = Object(value(obj)), propertyNames = arguments[1], options = Object(arguments[2]);
// 		if (copy !== obj && !propertyNames) return copy;
// 		var result = {};
// 		if (propertyNames) {
// 			aFrom(propertyNames, function (propertyName) {
// 				if (options.ensure || propertyName in obj) result[propertyName] = obj[propertyName];
// 			});
// 		} else {
// 			assign(result, obj);
// 		}
// 		return result;
// 	};
	
// 	},{"../array/from":21,"./assign":36,"./valid-value":55}],40:[function(require,module,exports){
// 	// Workaround for http://code.google.com/p/v8/issues/detail?id=2804
	
// 	"use strict";
	
// 	var create = Object.create, shim;
	
// 	if (!require("./set-prototype-of/is-implemented")()) {
// 		shim = require("./set-prototype-of/shim");
// 	}
	
// 	module.exports = (function () {
// 		var nullObject, polyProps, desc;
// 		if (!shim) return create;
// 		if (shim.level !== 1) return create;
	
// 		nullObject = {};
// 		polyProps = {};
// 		desc = {
// 			configurable: false,
// 			enumerable: false,
// 			writable: true,
// 			value: undefined
// 		};
// 		Object.getOwnPropertyNames(Object.prototype).forEach(function (name) {
// 			if (name === "__proto__") {
// 				polyProps[name] = {
// 					configurable: true,
// 					enumerable: false,
// 					writable: true,
// 					value: undefined
// 				};
// 				return;
// 			}
// 			polyProps[name] = desc;
// 		});
// 		Object.defineProperties(nullObject, polyProps);
	
// 		Object.defineProperty(shim, "nullPolyfill", {
// 			configurable: false,
// 			enumerable: false,
// 			writable: false,
// 			value: nullObject
// 		});
	
// 		return function (prototype, props) {
// 			return create(prototype === null ? nullObject : prototype, props);
// 		};
// 	}());
	
// 	},{"./set-prototype-of/is-implemented":52,"./set-prototype-of/shim":53}],41:[function(require,module,exports){
// 	"use strict";
	
// 	module.exports = require("./_iterate")("forEach");
	
// 	},{"./_iterate":35}],42:[function(require,module,exports){
// 	// Deprecated
	
// 	"use strict";
	
// 	module.exports = function (obj) {
// 	 return typeof obj === "function";
// 	};
	
// 	},{}],43:[function(require,module,exports){
// 	"use strict";
	
// 	var isValue = require("./is-value");
	
// 	var map = { function: true, object: true };
	
// 	module.exports = function (value) {
// 		return (isValue(value) && map[typeof value]) || false;
// 	};
	
// 	},{"./is-value":44}],44:[function(require,module,exports){
// 	"use strict";
	
// 	var _undefined = require("../function/noop")(); // Support ES3 engines
	
// 	module.exports = function (val) {
// 	 return (val !== _undefined) && (val !== null);
// 	};
	
// 	},{"../function/noop":26}],45:[function(require,module,exports){
// 	"use strict";
	
// 	module.exports = require("./is-implemented")() ? Object.keys : require("./shim");
	
// 	},{"./is-implemented":46,"./shim":47}],46:[function(require,module,exports){
// 	"use strict";
	
// 	module.exports = function () {
// 		try {
// 			Object.keys("primitive");
// 			return true;
// 		} catch (e) {
// 			return false;
// 		}
// 	};
	
// 	},{}],47:[function(require,module,exports){
// 	"use strict";
	
// 	var isValue = require("../is-value");
	
// 	var keys = Object.keys;
	
// 	module.exports = function (object) { return keys(isValue(object) ? Object(object) : object); };
	
// 	},{"../is-value":44}],48:[function(require,module,exports){
// 	"use strict";
	
// 	var callable = require("./valid-callable")
// 		, forEach  = require("./for-each")
// 		, call     = Function.prototype.call;
	
// 	module.exports = function (obj, cb /*, thisArg*/) {
// 		var result = {}, thisArg = arguments[2];
// 		callable(cb);
// 		forEach(obj, function (value, key, targetObj, index) {
// 			result[key] = call.call(cb, thisArg, value, key, targetObj, index);
// 		});
// 		return result;
// 	};
	
// 	},{"./for-each":41,"./valid-callable":54}],49:[function(require,module,exports){
// 	"use strict";
	
// 	var isValue = require("./is-value");
	
// 	var forEach = Array.prototype.forEach, create = Object.create;
	
// 	var process = function (src, obj) {
// 		var key;
// 		for (key in src) obj[key] = src[key];
// 	};
	
// 	// eslint-disable-next-line no-unused-vars
// 	module.exports = function (opts1 /*, …options*/) {
// 		var result = create(null);
// 		forEach.call(arguments, function (options) {
// 			if (!isValue(options)) return;
// 			process(Object(options), result);
// 		});
// 		return result;
// 	};
	
// 	},{"./is-value":44}],50:[function(require,module,exports){
// 	"use strict";
	
// 	var forEach = Array.prototype.forEach, create = Object.create;
	
// 	// eslint-disable-next-line no-unused-vars
// 	module.exports = function (arg /*, …args*/) {
// 		var set = create(null);
// 		forEach.call(arguments, function (name) {
// 			set[name] = true;
// 		});
// 		return set;
// 	};
	
// 	},{}],51:[function(require,module,exports){
// 	"use strict";
	
// 	module.exports = require("./is-implemented")()
// 		? Object.setPrototypeOf
// 		: require("./shim");
	
// 	},{"./is-implemented":52,"./shim":53}],52:[function(require,module,exports){
// 	"use strict";
	
// 	var create = Object.create, getPrototypeOf = Object.getPrototypeOf, plainObject = {};
	
// 	module.exports = function (/* CustomCreate*/) {
// 		var setPrototypeOf = Object.setPrototypeOf, customCreate = arguments[0] || create;
// 		if (typeof setPrototypeOf !== "function") return false;
// 		return getPrototypeOf(setPrototypeOf(customCreate(null), plainObject)) === plainObject;
// 	};
	
// 	},{}],53:[function(require,module,exports){
// 	/* eslint no-proto: "off" */
	
// 	// Big thanks to @WebReflection for sorting this out
// 	// https://gist.github.com/WebReflection/5593554
	
// 	"use strict";
	
// 	var isObject        = require("../is-object")
// 		, value           = require("../valid-value")
// 		, objIsPrototypeOf = Object.prototype.isPrototypeOf
// 		, defineProperty  = Object.defineProperty
// 		, nullDesc        = {
// 		configurable: true,
// 		enumerable: false,
// 		writable: true,
// 		value: undefined
// 	}
// 		, validate;
	
// 	validate = function (obj, prototype) {
// 		value(obj);
// 		if (prototype === null || isObject(prototype)) return obj;
// 		throw new TypeError("Prototype must be null or an object");
// 	};
	
// 	module.exports = (function (status) {
// 		var fn, set;
// 		if (!status) return null;
// 		if (status.level === 2) {
// 			if (status.set) {
// 				set = status.set;
// 				fn = function (obj, prototype) {
// 					set.call(validate(obj, prototype), prototype);
// 					return obj;
// 				};
// 			} else {
// 				fn = function (obj, prototype) {
// 					validate(obj, prototype).__proto__ = prototype;
// 					return obj;
// 				};
// 			}
// 		} else {
// 			fn = function self(obj, prototype) {
// 				var isNullBase;
// 				validate(obj, prototype);
// 				isNullBase = objIsPrototypeOf.call(self.nullPolyfill, obj);
// 				if (isNullBase) delete self.nullPolyfill.__proto__;
// 				if (prototype === null) prototype = self.nullPolyfill;
// 				obj.__proto__ = prototype;
// 				if (isNullBase) defineProperty(self.nullPolyfill, "__proto__", nullDesc);
// 				return obj;
// 			};
// 		}
// 		return Object.defineProperty(fn, "level", {
// 			configurable: false,
// 			enumerable: false,
// 			writable: false,
// 			value: status.level
// 		});
// 	}(
// 		(function () {
// 			var tmpObj1 = Object.create(null)
// 				, tmpObj2 = {}
// 				, set
// 				, desc = Object.getOwnPropertyDescriptor(Object.prototype, "__proto__");
	
// 			if (desc) {
// 				try {
// 					set = desc.set; // Opera crashes at this point
// 					set.call(tmpObj1, tmpObj2);
// 				} catch (ignore) {}
// 				if (Object.getPrototypeOf(tmpObj1) === tmpObj2) return { set: set, level: 2 };
// 			}
	
// 			tmpObj1.__proto__ = tmpObj2;
// 			if (Object.getPrototypeOf(tmpObj1) === tmpObj2) return { level: 2 };
	
// 			tmpObj1 = {};
// 			tmpObj1.__proto__ = tmpObj2;
// 			if (Object.getPrototypeOf(tmpObj1) === tmpObj2) return { level: 1 };
	
// 			return false;
// 		})()
// 	));
	
// 	require("../create");
	
// 	},{"../create":40,"../is-object":43,"../valid-value":55}],54:[function(require,module,exports){
// 	"use strict";
	
// 	module.exports = function (fn) {
// 		if (typeof fn !== "function") throw new TypeError(fn + " is not a function");
// 		return fn;
// 	};
	
// 	},{}],55:[function(require,module,exports){
// 	"use strict";
	
// 	var isValue = require("./is-value");
	
// 	module.exports = function (value) {
// 		if (!isValue(value)) throw new TypeError("Cannot use null or undefined");
// 		return value;
// 	};
	
// 	},{"./is-value":44}],56:[function(require,module,exports){
// 	"use strict";
	
// 	module.exports = require("./is-implemented")()
// 		? String.prototype.contains
// 		: require("./shim");
	
// 	},{"./is-implemented":57,"./shim":58}],57:[function(require,module,exports){
// 	"use strict";
	
// 	var str = "razdwatrzy";
	
// 	module.exports = function () {
// 		if (typeof str.contains !== "function") return false;
// 		return (str.contains("dwa") === true) && (str.contains("foo") === false);
// 	};
	
// 	},{}],58:[function(require,module,exports){
// 	"use strict";
	
// 	var indexOf = String.prototype.indexOf;
	
// 	module.exports = function (searchString/*, position*/) {
// 		return indexOf.call(this, searchString, arguments[1]) > -1;
// 	};
	
// 	},{}],59:[function(require,module,exports){
// 	"use strict";
	
// 	var objToString = Object.prototype.toString, id = objToString.call("");
	
// 	module.exports = function (value) {
// 		return (
// 			typeof value === "string" ||
// 			(value &&
// 				typeof value === "object" &&
// 				(value instanceof String || objToString.call(value) === id)) ||
// 			false
// 		);
// 	};
	
// 	},{}],60:[function(require,module,exports){
// 	"use strict";
	
// 	var setPrototypeOf = require("es5-ext/object/set-prototype-of")
// 		, contains       = require("es5-ext/string/#/contains")
// 		, d              = require("d")
// 		, Symbol         = require("es6-symbol")
// 		, Iterator       = require("./");
	
// 	var defineProperty = Object.defineProperty, ArrayIterator;
	
// 	ArrayIterator = module.exports = function (arr, kind) {
// 		if (!(this instanceof ArrayIterator)) throw new TypeError("Constructor requires 'new'");
// 		Iterator.call(this, arr);
// 		if (!kind) kind = "value";
// 		else if (contains.call(kind, "key+value")) kind = "key+value";
// 		else if (contains.call(kind, "key")) kind = "key";
// 		else kind = "value";
// 		defineProperty(this, "__kind__", d("", kind));
// 	};
// 	if (setPrototypeOf) setPrototypeOf(ArrayIterator, Iterator);
	
// 	// Internal %ArrayIteratorPrototype% doesn't expose its constructor
// 	delete ArrayIterator.prototype.constructor;
	
// 	ArrayIterator.prototype = Object.create(Iterator.prototype, {
// 		_resolve: d(function (i) {
// 			if (this.__kind__ === "value") return this.__list__[i];
// 			if (this.__kind__ === "key+value") return [i, this.__list__[i]];
// 			return i;
// 		})
// 	});
// 	defineProperty(ArrayIterator.prototype, Symbol.toStringTag, d("c", "Array Iterator"));
	
// 	},{"./":63,"d":16,"es5-ext/object/set-prototype-of":51,"es5-ext/string/#/contains":56,"es6-symbol":73}],61:[function(require,module,exports){
// 	"use strict";
	
// 	var isArguments = require("es5-ext/function/is-arguments")
// 		, callable    = require("es5-ext/object/valid-callable")
// 		, isString    = require("es5-ext/string/is-string")
// 		, get         = require("./get");
	
// 	var isArray = Array.isArray, call = Function.prototype.call, some = Array.prototype.some;
	
// 	module.exports = function (iterable, cb /*, thisArg*/) {
// 		var mode, thisArg = arguments[2], result, doBreak, broken, i, length, char, code;
// 		if (isArray(iterable) || isArguments(iterable)) mode = "array";
// 		else if (isString(iterable)) mode = "string";
// 		else iterable = get(iterable);
	
// 		callable(cb);
// 		doBreak = function () {
// 			broken = true;
// 		};
// 		if (mode === "array") {
// 			some.call(iterable, function (value) {
// 				call.call(cb, thisArg, value, doBreak);
// 				return broken;
// 			});
// 			return;
// 		}
// 		if (mode === "string") {
// 			length = iterable.length;
// 			for (i = 0; i < length; ++i) {
// 				char = iterable[i];
// 				if (i + 1 < length) {
// 					code = char.charCodeAt(0);
// 					if (code >= 0xd800 && code <= 0xdbff) char += iterable[++i];
// 				}
// 				call.call(cb, thisArg, char, doBreak);
// 				if (broken) break;
// 			}
// 			return;
// 		}
// 		result = iterable.next();
	
// 		while (!result.done) {
// 			call.call(cb, thisArg, result.value, doBreak);
// 			if (broken) return;
// 			result = iterable.next();
// 		}
// 	};
	
// 	},{"./get":62,"es5-ext/function/is-arguments":24,"es5-ext/object/valid-callable":54,"es5-ext/string/is-string":59}],62:[function(require,module,exports){
// 	"use strict";
	
// 	var isArguments    = require("es5-ext/function/is-arguments")
// 		, isString       = require("es5-ext/string/is-string")
// 		, ArrayIterator  = require("./array")
// 		, StringIterator = require("./string")
// 		, iterable       = require("./valid-iterable")
// 		, iteratorSymbol = require("es6-symbol").iterator;
	
// 	module.exports = function (obj) {
// 		if (typeof iterable(obj)[iteratorSymbol] === "function") return obj[iteratorSymbol]();
// 		if (isArguments(obj)) return new ArrayIterator(obj);
// 		if (isString(obj)) return new StringIterator(obj);
// 		return new ArrayIterator(obj);
// 	};
	
// 	},{"./array":60,"./string":65,"./valid-iterable":66,"es5-ext/function/is-arguments":24,"es5-ext/string/is-string":59,"es6-symbol":73}],63:[function(require,module,exports){
// 	"use strict";
	
// 	var clear    = require("es5-ext/array/#/clear")
// 		, assign   = require("es5-ext/object/assign")
// 		, callable = require("es5-ext/object/valid-callable")
// 		, value    = require("es5-ext/object/valid-value")
// 		, d        = require("d")
// 		, autoBind = require("d/auto-bind")
// 		, Symbol   = require("es6-symbol");
	
// 	var defineProperty = Object.defineProperty, defineProperties = Object.defineProperties, Iterator;
	
// 	module.exports = Iterator = function (list, context) {
// 		if (!(this instanceof Iterator)) throw new TypeError("Constructor requires 'new'");
// 		defineProperties(this, {
// 			__list__: d("w", value(list)),
// 			__context__: d("w", context),
// 			__nextIndex__: d("w", 0)
// 		});
// 		if (!context) return;
// 		callable(context.on);
// 		context.on("_add", this._onAdd);
// 		context.on("_delete", this._onDelete);
// 		context.on("_clear", this._onClear);
// 	};
	
// 	// Internal %IteratorPrototype% doesn't expose its constructor
// 	delete Iterator.prototype.constructor;
	
// 	defineProperties(
// 		Iterator.prototype,
// 		assign(
// 			{
// 				_next: d(function () {
// 					var i;
// 					if (!this.__list__) return undefined;
// 					if (this.__redo__) {
// 						i = this.__redo__.shift();
// 						if (i !== undefined) return i;
// 					}
// 					if (this.__nextIndex__ < this.__list__.length) return this.__nextIndex__++;
// 					this._unBind();
// 					return undefined;
// 				}),
// 				next: d(function () {
// 					return this._createResult(this._next());
// 				}),
// 				_createResult: d(function (i) {
// 					if (i === undefined) return { done: true, value: undefined };
// 					return { done: false, value: this._resolve(i) };
// 				}),
// 				_resolve: d(function (i) {
// 					return this.__list__[i];
// 				}),
// 				_unBind: d(function () {
// 					this.__list__ = null;
// 					delete this.__redo__;
// 					if (!this.__context__) return;
// 					this.__context__.off("_add", this._onAdd);
// 					this.__context__.off("_delete", this._onDelete);
// 					this.__context__.off("_clear", this._onClear);
// 					this.__context__ = null;
// 				}),
// 				toString: d(function () {
// 					return "[object " + (this[Symbol.toStringTag] || "Object") + "]";
// 				})
// 			},
// 			autoBind({
// 				_onAdd: d(function (index) {
// 					if (index >= this.__nextIndex__) return;
// 					++this.__nextIndex__;
// 					if (!this.__redo__) {
// 						defineProperty(this, "__redo__", d("c", [index]));
// 						return;
// 					}
// 					this.__redo__.forEach(function (redo, i) {
// 						if (redo >= index) this.__redo__[i] = ++redo;
// 					}, this);
// 					this.__redo__.push(index);
// 				}),
// 				_onDelete: d(function (index) {
// 					var i;
// 					if (index >= this.__nextIndex__) return;
// 					--this.__nextIndex__;
// 					if (!this.__redo__) return;
// 					i = this.__redo__.indexOf(index);
// 					if (i !== -1) this.__redo__.splice(i, 1);
// 					this.__redo__.forEach(function (redo, j) {
// 						if (redo > index) this.__redo__[j] = --redo;
// 					}, this);
// 				}),
// 				_onClear: d(function () {
// 					if (this.__redo__) clear.call(this.__redo__);
// 					this.__nextIndex__ = 0;
// 				})
// 			})
// 		)
// 	);
	
// 	defineProperty(
// 		Iterator.prototype,
// 		Symbol.iterator,
// 		d(function () {
// 			return this;
// 		})
// 	);
	
// 	},{"d":16,"d/auto-bind":15,"es5-ext/array/#/clear":19,"es5-ext/object/assign":36,"es5-ext/object/valid-callable":54,"es5-ext/object/valid-value":55,"es6-symbol":73}],64:[function(require,module,exports){
// 	"use strict";
	
// 	var isArguments = require("es5-ext/function/is-arguments")
// 		, isValue     = require("es5-ext/object/is-value")
// 		, isString    = require("es5-ext/string/is-string");
	
// 	var iteratorSymbol = require("es6-symbol").iterator
// 		, isArray        = Array.isArray;
	
// 	module.exports = function (value) {
// 		if (!isValue(value)) return false;
// 		if (isArray(value)) return true;
// 		if (isString(value)) return true;
// 		if (isArguments(value)) return true;
// 		return typeof value[iteratorSymbol] === "function";
// 	};
	
// 	},{"es5-ext/function/is-arguments":24,"es5-ext/object/is-value":44,"es5-ext/string/is-string":59,"es6-symbol":73}],65:[function(require,module,exports){
// 	// Thanks @mathiasbynens
// 	// http://mathiasbynens.be/notes/javascript-unicode#iterating-over-symbols
	
// 	"use strict";
	
// 	var setPrototypeOf = require("es5-ext/object/set-prototype-of")
// 		, d              = require("d")
// 		, Symbol         = require("es6-symbol")
// 		, Iterator       = require("./");
	
// 	var defineProperty = Object.defineProperty, StringIterator;
	
// 	StringIterator = module.exports = function (str) {
// 		if (!(this instanceof StringIterator)) throw new TypeError("Constructor requires 'new'");
// 		str = String(str);
// 		Iterator.call(this, str);
// 		defineProperty(this, "__length__", d("", str.length));
// 	};
// 	if (setPrototypeOf) setPrototypeOf(StringIterator, Iterator);
	
// 	// Internal %ArrayIteratorPrototype% doesn't expose its constructor
// 	delete StringIterator.prototype.constructor;
	
// 	StringIterator.prototype = Object.create(Iterator.prototype, {
// 		_next: d(function () {
// 			if (!this.__list__) return undefined;
// 			if (this.__nextIndex__ < this.__length__) return this.__nextIndex__++;
// 			this._unBind();
// 			return undefined;
// 		}),
// 		_resolve: d(function (i) {
// 			var char = this.__list__[i], code;
// 			if (this.__nextIndex__ === this.__length__) return char;
// 			code = char.charCodeAt(0);
// 			if (code >= 0xd800 && code <= 0xdbff) return char + this.__list__[this.__nextIndex__++];
// 			return char;
// 		})
// 	});
// 	defineProperty(StringIterator.prototype, Symbol.toStringTag, d("c", "String Iterator"));
	
// 	},{"./":63,"d":16,"es5-ext/object/set-prototype-of":51,"es6-symbol":73}],66:[function(require,module,exports){
// 	"use strict";
	
// 	var isIterable = require("./is-iterable");
	
// 	module.exports = function (value) {
// 		if (!isIterable(value)) throw new TypeError(value + " is not iterable");
// 		return value;
// 	};
	
// 	},{"./is-iterable":64}],67:[function(require,module,exports){
// 	'use strict';
	
// 	module.exports = require('./is-implemented')() ? Map : require('./polyfill');
	
// 	},{"./is-implemented":68,"./polyfill":72}],68:[function(require,module,exports){
// 	'use strict';
	
// 	module.exports = function () {
// 		var map, iterator, result;
// 		if (typeof Map !== 'function') return false;
// 		try {
// 			// WebKit doesn't support arguments and crashes
// 			map = new Map([['raz', 'one'], ['dwa', 'two'], ['trzy', 'three']]);
// 		} catch (e) {
// 			return false;
// 		}
// 		if (String(map) !== '[object Map]') return false;
// 		if (map.size !== 3) return false;
// 		if (typeof map.clear !== 'function') return false;
// 		if (typeof map.delete !== 'function') return false;
// 		if (typeof map.entries !== 'function') return false;
// 		if (typeof map.forEach !== 'function') return false;
// 		if (typeof map.get !== 'function') return false;
// 		if (typeof map.has !== 'function') return false;
// 		if (typeof map.keys !== 'function') return false;
// 		if (typeof map.set !== 'function') return false;
// 		if (typeof map.values !== 'function') return false;
	
// 		iterator = map.entries();
// 		result = iterator.next();
// 		if (result.done !== false) return false;
// 		if (!result.value) return false;
// 		if (result.value[0] !== 'raz') return false;
// 		if (result.value[1] !== 'one') return false;
	
// 		return true;
// 	};
	
// 	},{}],69:[function(require,module,exports){
// 	// Exports true if environment provides native `Map` implementation,
// 	// whatever that is.
	
// 	'use strict';
	
// 	module.exports = (function () {
// 		if (typeof Map === 'undefined') return false;
// 		return (Object.prototype.toString.call(new Map()) === '[object Map]');
// 	}());
	
// 	},{}],70:[function(require,module,exports){
// 	'use strict';
	
// 	module.exports = require('es5-ext/object/primitive-set')('key',
// 		'value', 'key+value');
	
// 	},{"es5-ext/object/primitive-set":50}],71:[function(require,module,exports){
// 	'use strict';
	
// 	var setPrototypeOf    = require('es5-ext/object/set-prototype-of')
// 		, d                 = require('d')
// 		, Iterator          = require('es6-iterator')
// 		, toStringTagSymbol = require('es6-symbol').toStringTag
// 		, kinds             = require('./iterator-kinds')
	
// 		, defineProperties = Object.defineProperties
// 		, unBind = Iterator.prototype._unBind
// 		, MapIterator;
	
// 	MapIterator = module.exports = function (map, kind) {
// 		if (!(this instanceof MapIterator)) return new MapIterator(map, kind);
// 		Iterator.call(this, map.__mapKeysData__, map);
// 		if (!kind || !kinds[kind]) kind = 'key+value';
// 		defineProperties(this, {
// 			__kind__: d('', kind),
// 			__values__: d('w', map.__mapValuesData__)
// 		});
// 	};
// 	if (setPrototypeOf) setPrototypeOf(MapIterator, Iterator);
	
// 	MapIterator.prototype = Object.create(Iterator.prototype, {
// 		constructor: d(MapIterator),
// 		_resolve: d(function (i) {
// 			if (this.__kind__ === 'value') return this.__values__[i];
// 			if (this.__kind__ === 'key') return this.__list__[i];
// 			return [this.__list__[i], this.__values__[i]];
// 		}),
// 		_unBind: d(function () {
// 			this.__values__ = null;
// 			unBind.call(this);
// 		}),
// 		toString: d(function () { return '[object Map Iterator]'; })
// 	});
// 	Object.defineProperty(MapIterator.prototype, toStringTagSymbol,
// 		d('c', 'Map Iterator'));
	
// 	},{"./iterator-kinds":70,"d":16,"es5-ext/object/set-prototype-of":51,"es6-iterator":63,"es6-symbol":73}],72:[function(require,module,exports){
// 	'use strict';
	
// 	var clear          = require('es5-ext/array/#/clear')
// 		, eIndexOf       = require('es5-ext/array/#/e-index-of')
// 		, setPrototypeOf = require('es5-ext/object/set-prototype-of')
// 		, callable       = require('es5-ext/object/valid-callable')
// 		, validValue     = require('es5-ext/object/valid-value')
// 		, d              = require('d')
// 		, ee             = require('event-emitter')
// 		, Symbol         = require('es6-symbol')
// 		, iterator       = require('es6-iterator/valid-iterable')
// 		, forOf          = require('es6-iterator/for-of')
// 		, Iterator       = require('./lib/iterator')
// 		, isNative       = require('./is-native-implemented')
	
// 		, call = Function.prototype.call
// 		, defineProperties = Object.defineProperties, getPrototypeOf = Object.getPrototypeOf
// 		, MapPoly;
	
// 	module.exports = MapPoly = function (/*iterable*/) {
// 		var iterable = arguments[0], keys, values, self;
// 		if (!(this instanceof MapPoly)) throw new TypeError('Constructor requires \'new\'');
// 		if (isNative && setPrototypeOf && (Map !== MapPoly)) {
// 			self = setPrototypeOf(new Map(), getPrototypeOf(this));
// 		} else {
// 			self = this;
// 		}
// 		if (iterable != null) iterator(iterable);
// 		defineProperties(self, {
// 			__mapKeysData__: d('c', keys = []),
// 			__mapValuesData__: d('c', values = [])
// 		});
// 		if (!iterable) return self;
// 		forOf(iterable, function (value) {
// 			var key = validValue(value)[0];
// 			value = value[1];
// 			if (eIndexOf.call(keys, key) !== -1) return;
// 			keys.push(key);
// 			values.push(value);
// 		}, self);
// 		return self;
// 	};
	
// 	if (isNative) {
// 		if (setPrototypeOf) setPrototypeOf(MapPoly, Map);
// 		MapPoly.prototype = Object.create(Map.prototype, {
// 			constructor: d(MapPoly)
// 		});
// 	}
	
// 	ee(defineProperties(MapPoly.prototype, {
// 		clear: d(function () {
// 			if (!this.__mapKeysData__.length) return;
// 			clear.call(this.__mapKeysData__);
// 			clear.call(this.__mapValuesData__);
// 			this.emit('_clear');
// 		}),
// 		delete: d(function (key) {
// 			var index = eIndexOf.call(this.__mapKeysData__, key);
// 			if (index === -1) return false;
// 			this.__mapKeysData__.splice(index, 1);
// 			this.__mapValuesData__.splice(index, 1);
// 			this.emit('_delete', index, key);
// 			return true;
// 		}),
// 		entries: d(function () { return new Iterator(this, 'key+value'); }),
// 		forEach: d(function (cb/*, thisArg*/) {
// 			var thisArg = arguments[1], iterator, result;
// 			callable(cb);
// 			iterator = this.entries();
// 			result = iterator._next();
// 			while (result !== undefined) {
// 				call.call(cb, thisArg, this.__mapValuesData__[result],
// 					this.__mapKeysData__[result], this);
// 				result = iterator._next();
// 			}
// 		}),
// 		get: d(function (key) {
// 			var index = eIndexOf.call(this.__mapKeysData__, key);
// 			if (index === -1) return;
// 			return this.__mapValuesData__[index];
// 		}),
// 		has: d(function (key) {
// 			return (eIndexOf.call(this.__mapKeysData__, key) !== -1);
// 		}),
// 		keys: d(function () { return new Iterator(this, 'key'); }),
// 		set: d(function (key, value) {
// 			var index = eIndexOf.call(this.__mapKeysData__, key), emit;
// 			if (index === -1) {
// 				index = this.__mapKeysData__.push(key) - 1;
// 				emit = true;
// 			}
// 			this.__mapValuesData__[index] = value;
// 			if (emit) this.emit('_add', index, key);
// 			return this;
// 		}),
// 		size: d.gs(function () { return this.__mapKeysData__.length; }),
// 		values: d(function () { return new Iterator(this, 'value'); }),
// 		toString: d(function () { return '[object Map]'; })
// 	}));
// 	Object.defineProperty(MapPoly.prototype, Symbol.iterator, d(function () {
// 		return this.entries();
// 	}));
// 	Object.defineProperty(MapPoly.prototype, Symbol.toStringTag, d('c', 'Map'));
	
// 	},{"./is-native-implemented":69,"./lib/iterator":71,"d":16,"es5-ext/array/#/clear":19,"es5-ext/array/#/e-index-of":20,"es5-ext/object/set-prototype-of":51,"es5-ext/object/valid-callable":54,"es5-ext/object/valid-value":55,"es6-iterator/for-of":61,"es6-iterator/valid-iterable":66,"es6-symbol":73,"event-emitter":78}],73:[function(require,module,exports){
// 	'use strict';
	
// 	module.exports = require('./is-implemented')() ? Symbol : require('./polyfill');
	
// 	},{"./is-implemented":74,"./polyfill":76}],74:[function(require,module,exports){
// 	'use strict';
	
// 	var validTypes = { object: true, symbol: true };
	
// 	module.exports = function () {
// 		var symbol;
// 		if (typeof Symbol !== 'function') return false;
// 		symbol = Symbol('test symbol');
// 		try { String(symbol); } catch (e) { return false; }
	
// 		// Return 'true' also for polyfills
// 		if (!validTypes[typeof Symbol.iterator]) return false;
// 		if (!validTypes[typeof Symbol.toPrimitive]) return false;
// 		if (!validTypes[typeof Symbol.toStringTag]) return false;
	
// 		return true;
// 	};
	
// 	},{}],75:[function(require,module,exports){
// 	'use strict';
	
// 	module.exports = function (x) {
// 		if (!x) return false;
// 		if (typeof x === 'symbol') return true;
// 		if (!x.constructor) return false;
// 		if (x.constructor.name !== 'Symbol') return false;
// 		return (x[x.constructor.toStringTag] === 'Symbol');
// 	};
	
// 	},{}],76:[function(require,module,exports){
// 	// ES2015 Symbol polyfill for environments that do not (or partially) support it
	
// 	'use strict';
	
// 	var d              = require('d')
// 		, validateSymbol = require('./validate-symbol')
	
// 		, create = Object.create, defineProperties = Object.defineProperties
// 		, defineProperty = Object.defineProperty, objPrototype = Object.prototype
// 		, NativeSymbol, SymbolPolyfill, HiddenSymbol, globalSymbols = create(null)
// 		, isNativeSafe;
	
// 	if (typeof Symbol === 'function') {
// 		NativeSymbol = Symbol;
// 		try {
// 			String(NativeSymbol());
// 			isNativeSafe = true;
// 		} catch (ignore) {}
// 	}
	
// 	var generateName = (function () {
// 		var created = create(null);
// 		return function (desc) {
// 			var postfix = 0, name, ie11BugWorkaround;
// 			while (created[desc + (postfix || '')]) ++postfix;
// 			desc += (postfix || '');
// 			created[desc] = true;
// 			name = '@@' + desc;
// 			defineProperty(objPrototype, name, d.gs(null, function (value) {
// 				// For IE11 issue see:
// 				// https://connect.microsoft.com/IE/feedbackdetail/view/1928508/
// 				//    ie11-broken-getters-on-dom-objects
// 				// https://github.com/medikoo/es6-symbol/issues/12
// 				if (ie11BugWorkaround) return;
// 				ie11BugWorkaround = true;
// 				defineProperty(this, name, d(value));
// 				ie11BugWorkaround = false;
// 			}));
// 			return name;
// 		};
// 	}());
	
// 	// Internal constructor (not one exposed) for creating Symbol instances.
// 	// This one is used to ensure that `someSymbol instanceof Symbol` always return false
// 	HiddenSymbol = function Symbol(description) {
// 		if (this instanceof HiddenSymbol) throw new TypeError('Symbol is not a constructor');
// 		return SymbolPolyfill(description);
// 	};
	
// 	// Exposed `Symbol` constructor
// 	// (returns instances of HiddenSymbol)
// 	module.exports = SymbolPolyfill = function Symbol(description) {
// 		var symbol;
// 		if (this instanceof Symbol) throw new TypeError('Symbol is not a constructor');
// 		if (isNativeSafe) return NativeSymbol(description);
// 		symbol = create(HiddenSymbol.prototype);
// 		description = (description === undefined ? '' : String(description));
// 		return defineProperties(symbol, {
// 			__description__: d('', description),
// 			__name__: d('', generateName(description))
// 		});
// 	};
// 	defineProperties(SymbolPolyfill, {
// 		for: d(function (key) {
// 			if (globalSymbols[key]) return globalSymbols[key];
// 			return (globalSymbols[key] = SymbolPolyfill(String(key)));
// 		}),
// 		keyFor: d(function (s) {
// 			var key;
// 			validateSymbol(s);
// 			for (key in globalSymbols) if (globalSymbols[key] === s) return key;
// 		}),
	
// 		// To ensure proper interoperability with other native functions (e.g. Array.from)
// 		// fallback to eventual native implementation of given symbol
// 		hasInstance: d('', (NativeSymbol && NativeSymbol.hasInstance) || SymbolPolyfill('hasInstance')),
// 		isConcatSpreadable: d('', (NativeSymbol && NativeSymbol.isConcatSpreadable) ||
// 			SymbolPolyfill('isConcatSpreadable')),
// 		iterator: d('', (NativeSymbol && NativeSymbol.iterator) || SymbolPolyfill('iterator')),
// 		match: d('', (NativeSymbol && NativeSymbol.match) || SymbolPolyfill('match')),
// 		replace: d('', (NativeSymbol && NativeSymbol.replace) || SymbolPolyfill('replace')),
// 		search: d('', (NativeSymbol && NativeSymbol.search) || SymbolPolyfill('search')),
// 		species: d('', (NativeSymbol && NativeSymbol.species) || SymbolPolyfill('species')),
// 		split: d('', (NativeSymbol && NativeSymbol.split) || SymbolPolyfill('split')),
// 		toPrimitive: d('', (NativeSymbol && NativeSymbol.toPrimitive) || SymbolPolyfill('toPrimitive')),
// 		toStringTag: d('', (NativeSymbol && NativeSymbol.toStringTag) || SymbolPolyfill('toStringTag')),
// 		unscopables: d('', (NativeSymbol && NativeSymbol.unscopables) || SymbolPolyfill('unscopables'))
// 	});
	
// 	// Internal tweaks for real symbol producer
// 	defineProperties(HiddenSymbol.prototype, {
// 		constructor: d(SymbolPolyfill),
// 		toString: d('', function () { return this.__name__; })
// 	});
	
// 	// Proper implementation of methods exposed on Symbol.prototype
// 	// They won't be accessible on produced symbol instances as they derive from HiddenSymbol.prototype
// 	defineProperties(SymbolPolyfill.prototype, {
// 		toString: d(function () { return 'Symbol (' + validateSymbol(this).__description__ + ')'; }),
// 		valueOf: d(function () { return validateSymbol(this); })
// 	});
// 	defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toPrimitive, d('', function () {
// 		var symbol = validateSymbol(this);
// 		if (typeof symbol === 'symbol') return symbol;
// 		return symbol.toString();
// 	}));
// 	defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toStringTag, d('c', 'Symbol'));
	
// 	// Proper implementaton of toPrimitive and toStringTag for returned symbol instances
// 	defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toStringTag,
// 		d('c', SymbolPolyfill.prototype[SymbolPolyfill.toStringTag]));
	
// 	// Note: It's important to define `toPrimitive` as last one, as some implementations
// 	// implement `toPrimitive` natively without implementing `toStringTag` (or other specified symbols)
// 	// And that may invoke error in definition flow:
// 	// See: https://github.com/medikoo/es6-symbol/issues/13#issuecomment-164146149
// 	defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toPrimitive,
// 		d('c', SymbolPolyfill.prototype[SymbolPolyfill.toPrimitive]));
	
// 	},{"./validate-symbol":77,"d":16}],77:[function(require,module,exports){
// 	'use strict';
	
// 	var isSymbol = require('./is-symbol');
	
// 	module.exports = function (value) {
// 		if (!isSymbol(value)) throw new TypeError(value + " is not a symbol");
// 		return value;
// 	};
	
// 	},{"./is-symbol":75}],78:[function(require,module,exports){
// 	'use strict';
	
// 	var d        = require('d')
// 		, callable = require('es5-ext/object/valid-callable')
	
// 		, apply = Function.prototype.apply, call = Function.prototype.call
// 		, create = Object.create, defineProperty = Object.defineProperty
// 		, defineProperties = Object.defineProperties
// 		, hasOwnProperty = Object.prototype.hasOwnProperty
// 		, descriptor = { configurable: true, enumerable: false, writable: true }
	
// 		, on, once, off, emit, methods, descriptors, base;
	
// 	on = function (type, listener) {
// 		var data;
	
// 		callable(listener);
	
// 		if (!hasOwnProperty.call(this, '__ee__')) {
// 			data = descriptor.value = create(null);
// 			defineProperty(this, '__ee__', descriptor);
// 			descriptor.value = null;
// 		} else {
// 			data = this.__ee__;
// 		}
// 		if (!data[type]) data[type] = listener;
// 		else if (typeof data[type] === 'object') data[type].push(listener);
// 		else data[type] = [data[type], listener];
	
// 		return this;
// 	};
	
// 	once = function (type, listener) {
// 		var once, self;
	
// 		callable(listener);
// 		self = this;
// 		on.call(this, type, once = function () {
// 			off.call(self, type, once);
// 			apply.call(listener, this, arguments);
// 		});
	
// 		once.__eeOnceListener__ = listener;
// 		return this;
// 	};
	
// 	off = function (type, listener) {
// 		var data, listeners, candidate, i;
	
// 		callable(listener);
	
// 		if (!hasOwnProperty.call(this, '__ee__')) return this;
// 		data = this.__ee__;
// 		if (!data[type]) return this;
// 		listeners = data[type];
	
// 		if (typeof listeners === 'object') {
// 			for (i = 0; (candidate = listeners[i]); ++i) {
// 				if ((candidate === listener) ||
// 						(candidate.__eeOnceListener__ === listener)) {
// 					if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];
// 					else listeners.splice(i, 1);
// 				}
// 			}
// 		} else {
// 			if ((listeners === listener) ||
// 					(listeners.__eeOnceListener__ === listener)) {
// 				delete data[type];
// 			}
// 		}
	
// 		return this;
// 	};
	
// 	emit = function (type) {
// 		var i, l, listener, listeners, args;
	
// 		if (!hasOwnProperty.call(this, '__ee__')) return;
// 		listeners = this.__ee__[type];
// 		if (!listeners) return;
	
// 		if (typeof listeners === 'object') {
// 			l = arguments.length;
// 			args = new Array(l - 1);
// 			for (i = 1; i < l; ++i) args[i - 1] = arguments[i];
	
// 			listeners = listeners.slice();
// 			for (i = 0; (listener = listeners[i]); ++i) {
// 				apply.call(listener, this, args);
// 			}
// 		} else {
// 			switch (arguments.length) {
// 			case 1:
// 				call.call(listeners, this);
// 				break;
// 			case 2:
// 				call.call(listeners, this, arguments[1]);
// 				break;
// 			case 3:
// 				call.call(listeners, this, arguments[1], arguments[2]);
// 				break;
// 			default:
// 				l = arguments.length;
// 				args = new Array(l - 1);
// 				for (i = 1; i < l; ++i) {
// 					args[i - 1] = arguments[i];
// 				}
// 				apply.call(listeners, this, args);
// 			}
// 		}
// 	};
	
// 	methods = {
// 		on: on,
// 		once: once,
// 		off: off,
// 		emit: emit
// 	};
	
// 	descriptors = {
// 		on: d(on),
// 		once: d(once),
// 		off: d(off),
// 		emit: d(emit)
// 	};
	
// 	base = defineProperties({}, descriptors);
	
// 	module.exports = exports = function (o) {
// 		return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
// 	};
// 	exports.methods = methods;
	
// 	},{"d":16,"es5-ext/object/valid-callable":54}],79:[function(require,module,exports){
// 	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
// 		var e, m
// 		var eLen = (nBytes * 8) - mLen - 1
// 		var eMax = (1 << eLen) - 1
// 		var eBias = eMax >> 1
// 		var nBits = -7
// 		var i = isLE ? (nBytes - 1) : 0
// 		var d = isLE ? -1 : 1
// 		var s = buffer[offset + i]
	
// 		i += d
	
// 		e = s & ((1 << (-nBits)) - 1)
// 		s >>= (-nBits)
// 		nBits += eLen
// 		for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}
	
// 		m = e & ((1 << (-nBits)) - 1)
// 		e >>= (-nBits)
// 		nBits += mLen
// 		for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}
	
// 		if (e === 0) {
// 			e = 1 - eBias
// 		} else if (e === eMax) {
// 			return m ? NaN : ((s ? -1 : 1) * Infinity)
// 		} else {
// 			m = m + Math.pow(2, mLen)
// 			e = e - eBias
// 		}
// 		return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
// 	}
	
// 	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
// 		var e, m, c
// 		var eLen = (nBytes * 8) - mLen - 1
// 		var eMax = (1 << eLen) - 1
// 		var eBias = eMax >> 1
// 		var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
// 		var i = isLE ? 0 : (nBytes - 1)
// 		var d = isLE ? 1 : -1
// 		var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0
	
// 		value = Math.abs(value)
	
// 		if (isNaN(value) || value === Infinity) {
// 			m = isNaN(value) ? 1 : 0
// 			e = eMax
// 		} else {
// 			e = Math.floor(Math.log(value) / Math.LN2)
// 			if (value * (c = Math.pow(2, -e)) < 1) {
// 				e--
// 				c *= 2
// 			}
// 			if (e + eBias >= 1) {
// 				value += rt / c
// 			} else {
// 				value += rt * Math.pow(2, 1 - eBias)
// 			}
// 			if (value * c >= 2) {
// 				e++
// 				c /= 2
// 			}
	
// 			if (e + eBias >= eMax) {
// 				m = 0
// 				e = eMax
// 			} else if (e + eBias >= 1) {
// 				m = ((value * c) - 1) * Math.pow(2, mLen)
// 				e = e + eBias
// 			} else {
// 				m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
// 				e = 0
// 			}
// 		}
	
// 		for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}
	
// 		e = (e << mLen) | m
// 		eLen += mLen
// 		for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}
	
// 		buffer[offset + i - d] |= s * 128
// 	}
	
// 	},{}],80:[function(require,module,exports){
// 	if (typeof Object.create === 'function') {
// 		// implementation from standard node.js 'util' module
// 		module.exports = function inherits(ctor, superCtor) {
// 			ctor.super_ = superCtor
// 			ctor.prototype = Object.create(superCtor.prototype, {
// 				constructor: {
// 					value: ctor,
// 					enumerable: false,
// 					writable: true,
// 					configurable: true
// 				}
// 			});
// 		};
// 	} else {
// 		// old school shim for old browsers
// 		module.exports = function inherits(ctor, superCtor) {
// 			ctor.super_ = superCtor
// 			var TempCtor = function () {}
// 			TempCtor.prototype = superCtor.prototype
// 			ctor.prototype = new TempCtor()
// 			ctor.prototype.constructor = ctor
// 		}
// 	}
	
// 	},{}],81:[function(require,module,exports){
// 	/*!
// 	 * Determine if an object is a Buffer
// 	 *
// 	 * @author   Feross Aboukhadijeh <https://feross.org>
// 	 * @license  MIT
// 	 */
	
// 	// The _isBuffer check is for Safari 5-7 support, because it's missing
// 	// Object.prototype.constructor. Remove this eventually
// 	module.exports = function (obj) {
// 		return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
// 	}
	
// 	function isBuffer (obj) {
// 		return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
// 	}
	
// 	// For Node v0.10 support. Remove this eventually.
// 	function isSlowBuffer (obj) {
// 		return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
// 	}
	
// 	},{}],82:[function(require,module,exports){
// 	'use strict'
	
// 	var Buffer = require('safe-buffer').Buffer
	
// 	/* Protocol - protocol constants */
// 	var protocol = module.exports
	
// 	/* Command code => mnemonic */
// 	protocol.types = {
// 		0: 'reserved',
// 		1: 'connect',
// 		2: 'connack',
// 		3: 'publish',
// 		4: 'puback',
// 		5: 'pubrec',
// 		6: 'pubrel',
// 		7: 'pubcomp',
// 		8: 'subscribe',
// 		9: 'suback',
// 		10: 'unsubscribe',
// 		11: 'unsuback',
// 		12: 'pingreq',
// 		13: 'pingresp',
// 		14: 'disconnect',
// 		15: 'auth'
// 	}
	
// 	/* Mnemonic => Command code */
// 	protocol.codes = {}
// 	for (var k in protocol.types) {
// 		var v = protocol.types[k]
// 		protocol.codes[v] = k
// 	}
	
// 	/* Header */
// 	protocol.CMD_SHIFT = 4
// 	protocol.CMD_MASK = 0xF0
// 	protocol.DUP_MASK = 0x08
// 	protocol.QOS_MASK = 0x03
// 	protocol.QOS_SHIFT = 1
// 	protocol.RETAIN_MASK = 0x01
	
// 	/* Length */
// 	protocol.LENGTH_MASK = 0x7F
// 	protocol.LENGTH_FIN_MASK = 0x80
	
// 	/* Connack */
// 	protocol.SESSIONPRESENT_MASK = 0x01
// 	protocol.SESSIONPRESENT_HEADER = Buffer.from([protocol.SESSIONPRESENT_MASK])
// 	protocol.CONNACK_HEADER = Buffer.from([protocol.codes['connack'] << protocol.CMD_SHIFT])
	
// 	/* Connect */
// 	protocol.USERNAME_MASK = 0x80
// 	protocol.PASSWORD_MASK = 0x40
// 	protocol.WILL_RETAIN_MASK = 0x20
// 	protocol.WILL_QOS_MASK = 0x18
// 	protocol.WILL_QOS_SHIFT = 3
// 	protocol.WILL_FLAG_MASK = 0x04
// 	protocol.CLEAN_SESSION_MASK = 0x02
// 	protocol.CONNECT_HEADER = Buffer.from([protocol.codes['connect'] << protocol.CMD_SHIFT])
	
// 	/* Properties */
// 	protocol.properties = {
// 		sessionExpiryInterval: 17,
// 		willDelayInterval: 24,
// 		receiveMaximum: 33,
// 		maximumPacketSize: 39,
// 		topicAliasMaximum: 34,
// 		requestResponseInformation: 25,
// 		requestProblemInformation: 23,
// 		userProperties: 38,
// 		authenticationMethod: 21,
// 		authenticationData: 22,
// 		payloadFormatIndicator: 1,
// 		messageExpiryInterval: 2,
// 		contentType: 3,
// 		responseTopic: 8,
// 		correlationData: 9,
// 		maximumQoS: 36,
// 		retainAvailable: 37,
// 		assignedClientIdentifier: 18,
// 		reasonString: 31,
// 		wildcardSubscriptionAvailable: 40,
// 		subscriptionIdentifiersAvailable: 41,
// 		sharedSubscriptionAvailable: 42,
// 		serverKeepAlive: 19,
// 		responseInformation: 26,
// 		serverReference: 28,
// 		topicAlias: 35,
// 		subscriptionIdentifier: 11
// 	}
// 	protocol.propertiesCodes = {}
// 	for (var prop in protocol.properties) {
// 		var id = protocol.properties[prop]
// 		protocol.propertiesCodes[id] = prop
// 	}
// 	protocol.propertiesTypes = {
// 		sessionExpiryInterval: 'int32',
// 		willDelayInterval: 'int32',
// 		receiveMaximum: 'int16',
// 		maximumPacketSize: 'int32',
// 		topicAliasMaximum: 'int16',
// 		requestResponseInformation: 'byte',
// 		requestProblemInformation: 'byte',
// 		userProperties: 'pair',
// 		authenticationMethod: 'string',
// 		authenticationData: 'binary',
// 		payloadFormatIndicator: 'byte',
// 		messageExpiryInterval: 'int32',
// 		contentType: 'string',
// 		responseTopic: 'string',
// 		correlationData: 'binary',
// 		maximumQoS: 'int8',
// 		retainAvailable: 'byte',
// 		assignedClientIdentifier: 'string',
// 		reasonString: 'string',
// 		wildcardSubscriptionAvailable: 'byte',
// 		subscriptionIdentifiersAvailable: 'byte',
// 		sharedSubscriptionAvailable: 'byte',
// 		serverKeepAlive: 'int32',
// 		responseInformation: 'string',
// 		serverReference: 'string',
// 		topicAlias: 'int16',
// 		subscriptionIdentifier: 'var'
// 	}
	
// 	function genHeader (type) {
// 		return [0, 1, 2].map(function (qos) {
// 			return [0, 1].map(function (dup) {
// 				return [0, 1].map(function (retain) {
// 					var buf = new Buffer(1)
// 					buf.writeUInt8(
// 						protocol.codes[type] << protocol.CMD_SHIFT |
// 						(dup ? protocol.DUP_MASK : 0) |
// 						qos << protocol.QOS_SHIFT | retain, 0, true)
// 					return buf
// 				})
// 			})
// 		})
// 	}
	
// 	/* Publish */
// 	protocol.PUBLISH_HEADER = genHeader('publish')
	
// 	/* Subscribe */
// 	protocol.SUBSCRIBE_HEADER = genHeader('subscribe')
// 	protocol.SUBSCRIBE_OPTIONS_QOS_MASK = 0x03
// 	protocol.SUBSCRIBE_OPTIONS_NL_MASK = 0x01
// 	protocol.SUBSCRIBE_OPTIONS_NL_SHIFT = 2
// 	protocol.SUBSCRIBE_OPTIONS_RAP_MASK = 0x01
// 	protocol.SUBSCRIBE_OPTIONS_RAP_SHIFT = 3
// 	protocol.SUBSCRIBE_OPTIONS_RH_MASK = 0x03
// 	protocol.SUBSCRIBE_OPTIONS_RH_SHIFT = 4
// 	protocol.SUBSCRIBE_OPTIONS_RH = [0x00, 0x10, 0x20]
// 	protocol.SUBSCRIBE_OPTIONS_NL = 0x04
// 	protocol.SUBSCRIBE_OPTIONS_RAP = 0x08
// 	protocol.SUBSCRIBE_OPTIONS_QOS = [0x00, 0x01, 0x02]
	
// 	/* Unsubscribe */
// 	protocol.UNSUBSCRIBE_HEADER = genHeader('unsubscribe')
	
// 	/* Confirmations */
// 	protocol.ACKS = {
// 		unsuback: genHeader('unsuback'),
// 		puback: genHeader('puback'),
// 		pubcomp: genHeader('pubcomp'),
// 		pubrel: genHeader('pubrel'),
// 		pubrec: genHeader('pubrec')
// 	}
	
// 	protocol.SUBACK_HEADER = Buffer.from([protocol.codes['suback'] << protocol.CMD_SHIFT])
	
// 	/* Protocol versions */
// 	protocol.VERSION3 = Buffer.from([3])
// 	protocol.VERSION4 = Buffer.from([4])
// 	protocol.VERSION5 = Buffer.from([5])
	
// 	/* QoS */
// 	protocol.QOS = [0, 1, 2].map(function (qos) {
// 		return Buffer.from([qos])
// 	})
	
// 	/* Empty packets */
// 	protocol.EMPTY = {
// 		pingreq: Buffer.from([protocol.codes['pingreq'] << 4, 0]),
// 		pingresp: Buffer.from([protocol.codes['pingresp'] << 4, 0]),
// 		disconnect: Buffer.from([protocol.codes['disconnect'] << 4, 0])
// 	}
	
// 	},{"safe-buffer":110}],83:[function(require,module,exports){
// 	'use strict'
	
// 	var Buffer = require('safe-buffer').Buffer
// 	var writeToStream = require('./writeToStream')
// 	var EE = require('events').EventEmitter
// 	var inherits = require('inherits')
	
// 	function generate (packet, opts) {
// 		var stream = new Accumulator()
// 		writeToStream(packet, stream, opts)
// 		return stream.concat()
// 	}
	
// 	function Accumulator () {
// 		this._array = new Array(20)
// 		this._i = 0
// 	}
	
// 	inherits(Accumulator, EE)
	
// 	Accumulator.prototype.write = function (chunk) {
// 		this._array[this._i++] = chunk
// 		return true
// 	}
	
// 	Accumulator.prototype.concat = function () {
// 		var length = 0
// 		var lengths = new Array(this._array.length)
// 		var list = this._array
// 		var pos = 0
// 		var i
// 		var result
	
// 		for (i = 0; i < list.length && list[i] !== undefined; i++) {
// 			if (typeof list[i] !== 'string') lengths[i] = list[i].length
// 			else lengths[i] = Buffer.byteLength(list[i])
	
// 			length += lengths[i]
// 		}
	
// 		result = Buffer.allocUnsafe(length)
	
// 		for (i = 0; i < list.length && list[i] !== undefined; i++) {
// 			if (typeof list[i] !== 'string') {
// 				list[i].copy(result, pos)
// 				pos += lengths[i]
// 			} else {
// 				result.write(list[i], pos)
// 				pos += lengths[i]
// 			}
// 		}
	
// 		return result
// 	}
	
// 	module.exports = generate
	
// 	},{"./writeToStream":89,"events":13,"inherits":80,"safe-buffer":110}],84:[function(require,module,exports){
// 	'use strict'
	
// 	exports.parser = require('./parser')
// 	exports.generate = require('./generate')
// 	exports.writeToStream = require('./writeToStream')
	
// 	},{"./generate":83,"./parser":88,"./writeToStream":89}],85:[function(require,module,exports){
// 	var DuplexStream = require('readable-stream/duplex')
// 		, util         = require('util')
// 		, Buffer       = require('safe-buffer').Buffer
	
	
// 	function BufferList (callback) {
// 		if (!(this instanceof BufferList))
// 			return new BufferList(callback)
	
// 		this._bufs  = []
// 		this.length = 0
	
// 		if (typeof callback == 'function') {
// 			this._callback = callback
	
// 			var piper = function piper (err) {
// 				if (this._callback) {
// 					this._callback(err)
// 					this._callback = null
// 				}
// 			}.bind(this)
	
// 			this.on('pipe', function onPipe (src) {
// 				src.on('error', piper)
// 			})
// 			this.on('unpipe', function onUnpipe (src) {
// 				src.removeListener('error', piper)
// 			})
// 		} else {
// 			this.append(callback)
// 		}
	
// 		DuplexStream.call(this)
// 	}
	
	
// 	util.inherits(BufferList, DuplexStream)
	
	
// 	BufferList.prototype._offset = function _offset (offset) {
// 		var tot = 0, i = 0, _t
// 		if (offset === 0) return [ 0, 0 ]
// 		for (; i < this._bufs.length; i++) {
// 			_t = tot + this._bufs[i].length
// 			if (offset < _t || i == this._bufs.length - 1)
// 				return [ i, offset - tot ]
// 			tot = _t
// 		}
// 	}
	
	
// 	BufferList.prototype.append = function append (buf) {
// 		var i = 0
	
// 		if (Buffer.isBuffer(buf)) {
// 			this._appendBuffer(buf);
// 		} else if (Array.isArray(buf)) {
// 			for (; i < buf.length; i++)
// 				this.append(buf[i])
// 		} else if (buf instanceof BufferList) {
// 			// unwrap argument into individual BufferLists
// 			for (; i < buf._bufs.length; i++)
// 				this.append(buf._bufs[i])
// 		} else if (buf != null) {
// 			// coerce number arguments to strings, since Buffer(number) does
// 			// uninitialized memory allocation
// 			if (typeof buf == 'number')
// 				buf = buf.toString()
	
// 			this._appendBuffer(Buffer.from(buf));
// 		}
	
// 		return this
// 	}
	
	
// 	BufferList.prototype._appendBuffer = function appendBuffer (buf) {
// 		this._bufs.push(buf)
// 		this.length += buf.length
// 	}
	
	
// 	BufferList.prototype._write = function _write (buf, encoding, callback) {
// 		this._appendBuffer(buf)
	
// 		if (typeof callback == 'function')
// 			callback()
// 	}
	
	
// 	BufferList.prototype._read = function _read (size) {
// 		if (!this.length)
// 			return this.push(null)
	
// 		size = Math.min(size, this.length)
// 		this.push(this.slice(0, size))
// 		this.consume(size)
// 	}
	
	
// 	BufferList.prototype.end = function end (chunk) {
// 		DuplexStream.prototype.end.call(this, chunk)
	
// 		if (this._callback) {
// 			this._callback(null, this.slice())
// 			this._callback = null
// 		}
// 	}
	
	
// 	BufferList.prototype.get = function get (index) {
// 		return this.slice(index, index + 1)[0]
// 	}
	
	
// 	BufferList.prototype.slice = function slice (start, end) {
// 		if (typeof start == 'number' && start < 0)
// 			start += this.length
// 		if (typeof end == 'number' && end < 0)
// 			end += this.length
// 		return this.copy(null, 0, start, end)
// 	}
	
	
// 	BufferList.prototype.copy = function copy (dst, dstStart, srcStart, srcEnd) {
// 		if (typeof srcStart != 'number' || srcStart < 0)
// 			srcStart = 0
// 		if (typeof srcEnd != 'number' || srcEnd > this.length)
// 			srcEnd = this.length
// 		if (srcStart >= this.length)
// 			return dst || Buffer.alloc(0)
// 		if (srcEnd <= 0)
// 			return dst || Buffer.alloc(0)
	
// 		var copy   = !!dst
// 			, off    = this._offset(srcStart)
// 			, len    = srcEnd - srcStart
// 			, bytes  = len
// 			, bufoff = (copy && dstStart) || 0
// 			, start  = off[1]
// 			, l
// 			, i
	
// 		// copy/slice everything
// 		if (srcStart === 0 && srcEnd == this.length) {
// 			if (!copy) { // slice, but full concat if multiple buffers
// 				return this._bufs.length === 1
// 					? this._bufs[0]
// 					: Buffer.concat(this._bufs, this.length)
// 			}
	
// 			// copy, need to copy individual buffers
// 			for (i = 0; i < this._bufs.length; i++) {
// 				this._bufs[i].copy(dst, bufoff)
// 				bufoff += this._bufs[i].length
// 			}
	
// 			return dst
// 		}
	
// 		// easy, cheap case where it's a subset of one of the buffers
// 		if (bytes <= this._bufs[off[0]].length - start) {
// 			return copy
// 				? this._bufs[off[0]].copy(dst, dstStart, start, start + bytes)
// 				: this._bufs[off[0]].slice(start, start + bytes)
// 		}
	
// 		if (!copy) // a slice, we need something to copy in to
// 			dst = Buffer.allocUnsafe(len)
	
// 		for (i = off[0]; i < this._bufs.length; i++) {
// 			l = this._bufs[i].length - start
	
// 			if (bytes > l) {
// 				this._bufs[i].copy(dst, bufoff, start)
// 			} else {
// 				this._bufs[i].copy(dst, bufoff, start, start + bytes)
// 				break
// 			}
	
// 			bufoff += l
// 			bytes -= l
	
// 			if (start)
// 				start = 0
// 		}
	
// 		return dst
// 	}
	
// 	BufferList.prototype.shallowSlice = function shallowSlice (start, end) {
// 		start = start || 0
// 		end = end || this.length
	
// 		if (start < 0)
// 			start += this.length
// 		if (end < 0)
// 			end += this.length
	
// 		var startOffset = this._offset(start)
// 			, endOffset = this._offset(end)
// 			, buffers = this._bufs.slice(startOffset[0], endOffset[0] + 1)
	
// 		if (endOffset[1] == 0)
// 			buffers.pop()
// 		else
// 			buffers[buffers.length-1] = buffers[buffers.length-1].slice(0, endOffset[1])
	
// 		if (startOffset[1] != 0)
// 			buffers[0] = buffers[0].slice(startOffset[1])
	
// 		return new BufferList(buffers)
// 	}
	
// 	BufferList.prototype.toString = function toString (encoding, start, end) {
// 		return this.slice(start, end).toString(encoding)
// 	}
	
// 	BufferList.prototype.consume = function consume (bytes) {
// 		while (this._bufs.length) {
// 			if (bytes >= this._bufs[0].length) {
// 				bytes -= this._bufs[0].length
// 				this.length -= this._bufs[0].length
// 				this._bufs.shift()
// 			} else {
// 				this._bufs[0] = this._bufs[0].slice(bytes)
// 				this.length -= bytes
// 				break
// 			}
// 		}
// 		return this
// 	}
	
	
// 	BufferList.prototype.duplicate = function duplicate () {
// 		var i = 0
// 			, copy = new BufferList()
	
// 		for (; i < this._bufs.length; i++)
// 			copy.append(this._bufs[i])
	
// 		return copy
// 	}
	
	
// 	BufferList.prototype.destroy = function destroy () {
// 		this._bufs.length = 0
// 		this.length = 0
// 		this.push(null)
// 	}
	
	
// 	;(function () {
// 		var methods = {
// 				'readDoubleBE' : 8
// 			, 'readDoubleLE' : 8
// 			, 'readFloatBE'  : 4
// 			, 'readFloatLE'  : 4
// 			, 'readInt32BE'  : 4
// 			, 'readInt32LE'  : 4
// 			, 'readUInt32BE' : 4
// 			, 'readUInt32LE' : 4
// 			, 'readInt16BE'  : 2
// 			, 'readInt16LE'  : 2
// 			, 'readUInt16BE' : 2
// 			, 'readUInt16LE' : 2
// 			, 'readInt8'     : 1
// 			, 'readUInt8'    : 1
// 		}
	
// 		for (var m in methods) {
// 			(function (m) {
// 				BufferList.prototype[m] = function (offset) {
// 					return this.slice(offset, offset + methods[m])[m](0)
// 				}
// 			}(m))
// 		}
// 	}())
	
	
// 	module.exports = BufferList
	
// 	},{"readable-stream/duplex":97,"safe-buffer":110,"util":117}],86:[function(require,module,exports){
// 	'use strict'
	
// 	var Buffer = require('safe-buffer').Buffer
// 	var max = 65536
// 	var cache = {}
	
// 	function generateBuffer (i) {
// 		var buffer = Buffer.allocUnsafe(2)
// 		buffer.writeUInt8(i >> 8, 0)
// 		buffer.writeUInt8(i & 0x00FF, 0 + 1)
	
// 		return buffer
// 	}
	
// 	function generateCache () {
// 		for (var i = 0; i < max; i++) {
// 			cache[i] = generateBuffer(i)
// 		}
// 	}
	
// 	/**
// 	 * calcVariableByteIntLength - calculate the variable byte integer
// 	 * length field
// 	 *
// 	 * @api private
// 	 */
// 	function calcVariableByteIntLength (length) {
// 		if (length >= 0 && length < 128) return 1
// 		else if (length >= 128 && length < 16384) return 2
// 		else if (length >= 16384 && length < 2097152) return 3
// 		else if (length >= 2097152 && length < 268435456) return 4
// 		else return 0
// 	}
	
// 	function genBufVariableByteInt (num) {
// 		var digit = 0
// 		var pos = 0
// 		var length = calcVariableByteIntLength(num)
// 		var buffer = Buffer.allocUnsafe(length)
	
// 		do {
// 			digit = num % 128 | 0
// 			num = num / 128 | 0
// 			if (num > 0) digit = digit | 0x80
	
// 			buffer.writeUInt8(digit, pos++)
// 		} while (num > 0)
	
// 		return {
// 			data: buffer,
// 			length: length
// 		}
// 	}
	
// 	function generate4ByteBuffer (num) {
// 		var buffer = Buffer.allocUnsafe(4)
// 		buffer.writeUInt32BE(num, 0)
// 		return buffer
// 	}
	
// 	module.exports = {
// 		cache: cache,
// 		generateCache: generateCache,
// 		generateNumber: generateBuffer,
// 		genBufVariableByteInt: genBufVariableByteInt,
// 		generate4ByteBuffer: generate4ByteBuffer
// 	}
	
// 	},{"safe-buffer":110}],87:[function(require,module,exports){
	
// 	function Packet () {
// 		this.cmd = null
// 		this.retain = false
// 		this.qos = 0
// 		this.dup = false
// 		this.length = -1
// 		this.topic = null
// 		this.payload = null
// 	}
	
// 	module.exports = Packet
	
// 	},{}],88:[function(require,module,exports){
// 	'use strict'
	
// 	var bl = require('bl')
// 	var inherits = require('inherits')
// 	var EE = require('events').EventEmitter
// 	var Packet = require('./packet')
// 	var constants = require('./constants')
	
// 	function Parser (opt) {
// 		if (!(this instanceof Parser)) return new Parser(opt)
	
// 		this.settings = opt || {}
	
// 		this._states = [
// 			'_parseHeader',
// 			'_parseLength',
// 			'_parsePayload',
// 			'_newPacket'
// 		]
	
// 		this._resetState()
// 	}
	
// 	inherits(Parser, EE)
	
// 	Parser.prototype._resetState = function () {
// 		this.packet = new Packet()
// 		this.error = null
// 		this._list = bl()
// 		this._stateCounter = 0
// 	}
	
// 	Parser.prototype.parse = function (buf) {
// 		if (this.error) this._resetState()
	
// 		this._list.append(buf)
	
// 		while ((this.packet.length !== -1 || this._list.length > 0) &&
// 		this[this._states[this._stateCounter]]() &&
// 		!this.error) {
// 			this._stateCounter++
	
// 			if (this._stateCounter >= this._states.length) this._stateCounter = 0
// 		}
	
// 		return this._list.length
// 	}
	
// 	Parser.prototype._parseHeader = function () {
// 		// There is at least one byte in the buffer
// 		var zero = this._list.readUInt8(0)
// 		this.packet.cmd = constants.types[zero >> constants.CMD_SHIFT]
// 		this.packet.retain = (zero & constants.RETAIN_MASK) !== 0
// 		this.packet.qos = (zero >> constants.QOS_SHIFT) & constants.QOS_MASK
// 		this.packet.dup = (zero & constants.DUP_MASK) !== 0
	
// 		this._list.consume(1)
	
// 		return true
// 	}
	
// 	Parser.prototype._parseLength = function () {
// 		// There is at least one byte in the list
// 		var result = this._parseVarByteNum(true)
	
// 		if (result) {
// 			this.packet.length = result.value
// 			this._list.consume(result.bytes)
// 		}
	
// 		return !!result
// 	}
	
// 	Parser.prototype._parsePayload = function () {
// 		var result = false
	
// 		// Do we have a payload? Do we have enough data to complete the payload?
// 		// PINGs have no payload
// 		if (this.packet.length === 0 || this._list.length >= this.packet.length) {
// 			this._pos = 0
	
// 			switch (this.packet.cmd) {
// 				case 'connect':
// 					this._parseConnect()
// 					break
// 				case 'connack':
// 					this._parseConnack()
// 					break
// 				case 'publish':
// 					this._parsePublish()
// 					break
// 				case 'puback':
// 				case 'pubrec':
// 				case 'pubrel':
// 				case 'pubcomp':
// 					this._parseConfirmation()
// 					break
// 				case 'subscribe':
// 					this._parseSubscribe()
// 					break
// 				case 'suback':
// 					this._parseSuback()
// 					break
// 				case 'unsubscribe':
// 					this._parseUnsubscribe()
// 					break
// 				case 'unsuback':
// 					this._parseUnsuback()
// 					break
// 				case 'pingreq':
// 				case 'pingresp':
// 					// These are empty, nothing to do
// 					break
// 				case 'disconnect':
// 					this._parseDisconnect()
// 					break
// 				case 'auth':
// 					this._parseAuth()
// 					break
// 				default:
// 					this._emitError(new Error('Not supported'))
// 			}
	
// 			result = true
// 		}
	
// 		return result
// 	}
	
// 	Parser.prototype._parseConnect = function () {
// 		var protocolId // Protocol ID
// 		var clientId // Client ID
// 		var topic // Will topic
// 		var payload // Will payload
// 		var password // Password
// 		var username // Username
// 		var flags = {}
// 		var packet = this.packet
	
// 		// Parse protocolId
// 		protocolId = this._parseString()
	
// 		if (protocolId === null) return this._emitError(new Error('Cannot parse protocolId'))
// 		if (protocolId !== 'MQTT' && protocolId !== 'MQIsdp') {
// 			return this._emitError(new Error('Invalid protocolId'))
// 		}
	
// 		packet.protocolId = protocolId
	
// 		// Parse constants version number
// 		if (this._pos >= this._list.length) return this._emitError(new Error('Packet too short'))
	
// 		packet.protocolVersion = this._list.readUInt8(this._pos)
	
// 		if (packet.protocolVersion !== 3 && packet.protocolVersion !== 4 && packet.protocolVersion !== 5) {
// 			return this._emitError(new Error('Invalid protocol version'))
// 		}
	
// 		this._pos++
	
// 		if (this._pos >= this._list.length) {
// 			return this._emitError(new Error('Packet too short'))
// 		}
	
// 		// Parse connect flags
// 		flags.username = (this._list.readUInt8(this._pos) & constants.USERNAME_MASK)
// 		flags.password = (this._list.readUInt8(this._pos) & constants.PASSWORD_MASK)
// 		flags.will = (this._list.readUInt8(this._pos) & constants.WILL_FLAG_MASK)
	
// 		if (flags.will) {
// 			packet.will = {}
// 			packet.will.retain = (this._list.readUInt8(this._pos) & constants.WILL_RETAIN_MASK) !== 0
// 			packet.will.qos = (this._list.readUInt8(this._pos) &
// 														constants.WILL_QOS_MASK) >> constants.WILL_QOS_SHIFT
// 		}
	
// 		packet.clean = (this._list.readUInt8(this._pos) & constants.CLEAN_SESSION_MASK) !== 0
// 		this._pos++
	
// 		// Parse keepalive
// 		packet.keepalive = this._parseNum()
// 		if (packet.keepalive === -1) return this._emitError(new Error('Packet too short'))
	
// 		// parse properties
// 		if (packet.protocolVersion === 5) {
// 			var properties = this._parseProperties()
// 			if (Object.getOwnPropertyNames(properties).length) {
// 				packet.properties = properties
// 			}
// 		}
// 		// Parse clientId
// 		clientId = this._parseString()
// 		if (clientId === null) return this._emitError(new Error('Packet too short'))
// 		packet.clientId = clientId
	
// 		if (flags.will) {
// 			if (packet.protocolVersion === 5) {
// 				var willProperties = this._parseProperties()
// 				if (Object.getOwnPropertyNames(willProperties).length) {
// 					packet.will.properties = willProperties
// 				}
// 			}
// 			// Parse will topic
// 			topic = this._parseString()
// 			if (topic === null) return this._emitError(new Error('Cannot parse will topic'))
// 			packet.will.topic = topic
	
// 			// Parse will payload
// 			payload = this._parseBuffer()
// 			if (payload === null) return this._emitError(new Error('Cannot parse will payload'))
// 			packet.will.payload = payload
// 		}
	
// 		// Parse username
// 		if (flags.username) {
// 			username = this._parseString()
// 			if (username === null) return this._emitError(new Error('Cannot parse username'))
// 			packet.username = username
// 		}
	
// 		// Parse password
// 		if (flags.password) {
// 			password = this._parseBuffer()
// 			if (password === null) return this._emitError(new Error('Cannot parse password'))
// 			packet.password = password
// 		}
// 		// need for right parse auth packet and self set up
// 		this.settings = packet
	
// 		return packet
// 	}
	
// 	Parser.prototype._parseConnack = function () {
// 		var packet = this.packet
	
// 		if (this._list.length < 2) return null
	
// 		packet.sessionPresent = !!(this._list.readUInt8(this._pos++) & constants.SESSIONPRESENT_MASK)
// 		if (this.settings.protocolVersion === 5) {
// 			packet.reasonCode = this._list.readUInt8(this._pos++)
// 		} else {
// 			packet.returnCode = this._list.readUInt8(this._pos++)
// 		}
	
// 		if (packet.returnCode === -1 || packet.reasonCode === -1) return this._emitError(new Error('Cannot parse return code'))
// 		// mqtt 5 properties
// 		if (this.settings.protocolVersion === 5) {
// 			var properties = this._parseProperties()
// 			if (Object.getOwnPropertyNames(properties).length) {
// 				packet.properties = properties
// 			}
// 		}
// 	}
	
// 	Parser.prototype._parsePublish = function () {
// 		var packet = this.packet
// 		packet.topic = this._parseString()
	
// 		if (packet.topic === null) return this._emitError(new Error('Cannot parse topic'))
	
// 		// Parse messageId
// 		if (packet.qos > 0) if (!this._parseMessageId()) { return }
	
// 		// Properties mqtt 5
// 		if (this.settings.protocolVersion === 5) {
// 			var properties = this._parseProperties()
// 			if (Object.getOwnPropertyNames(properties).length) {
// 				packet.properties = properties
// 			}
// 		}
	
// 		packet.payload = this._list.slice(this._pos, packet.length)
// 	}
	
// 	Parser.prototype._parseSubscribe = function () {
// 		var packet = this.packet
// 		var topic
// 		var options
// 		var qos
// 		var rh
// 		var rap
// 		var nl
// 		var subscription
	
// 		if (packet.qos !== 1) {
// 			return this._emitError(new Error('Wrong subscribe header'))
// 		}
	
// 		packet.subscriptions = []
	
// 		if (!this._parseMessageId()) { return }
	
// 		// Properties mqtt 5
// 		if (this.settings.protocolVersion === 5) {
// 			var properties = this._parseProperties()
// 			if (Object.getOwnPropertyNames(properties).length) {
// 				packet.properties = properties
// 			}
// 		}
	
// 		while (this._pos < packet.length) {
// 			// Parse topic
// 			topic = this._parseString()
// 			if (topic === null) return this._emitError(new Error('Cannot parse topic'))
	
// 			options = this._parseByte()
// 			qos = options & constants.SUBSCRIBE_OPTIONS_QOS_MASK
// 			nl = ((options >> constants.SUBSCRIBE_OPTIONS_NL_SHIFT) & constants.SUBSCRIBE_OPTIONS_NL_MASK) !== 0
// 			rap = ((options >> constants.SUBSCRIBE_OPTIONS_RAP_SHIFT) & constants.SUBSCRIBE_OPTIONS_RAP_MASK) !== 0
// 			rh = (options >> constants.SUBSCRIBE_OPTIONS_RH_SHIFT) & constants.SUBSCRIBE_OPTIONS_RH_MASK
	
// 			subscription = { topic: topic, qos: qos }
	
// 			// mqtt 5 options
// 			if (this.settings.protocolVersion === 5) {
// 				subscription.nl = nl
// 				subscription.rap = rap
// 				subscription.rh = rh
// 			}
	
// 			// Push pair to subscriptions
// 			packet.subscriptions.push(subscription)
// 		}
// 	}
	
// 	Parser.prototype._parseSuback = function () {
// 		var packet = this.packet
// 		this.packet.granted = []
	
// 		if (!this._parseMessageId()) { return }
	
// 		// Properties mqtt 5
// 		if (this.settings.protocolVersion === 5) {
// 			var properties = this._parseProperties()
// 			if (Object.getOwnPropertyNames(properties).length) {
// 				packet.properties = properties
// 			}
// 		}
	
// 		// Parse granted QoSes
// 		while (this._pos < this.packet.length) {
// 			this.packet.granted.push(this._list.readUInt8(this._pos++))
// 		}
// 	}
	
// 	Parser.prototype._parseUnsubscribe = function () {
// 		var packet = this.packet
	
// 		packet.unsubscriptions = []
	
// 		// Parse messageId
// 		if (!this._parseMessageId()) { return }
	
// 		// Properties mqtt 5
// 		if (this.settings.protocolVersion === 5) {
// 			var properties = this._parseProperties()
// 			if (Object.getOwnPropertyNames(properties).length) {
// 				packet.properties = properties
// 			}
// 		}
	
// 		while (this._pos < packet.length) {
// 			var topic
	
// 			// Parse topic
// 			topic = this._parseString()
// 			if (topic === null) return this._emitError(new Error('Cannot parse topic'))
	
// 			// Push topic to unsubscriptions
// 			packet.unsubscriptions.push(topic)
// 		}
// 	}
	
// 	Parser.prototype._parseUnsuback = function () {
// 		var packet = this.packet
// 		if (!this._parseMessageId()) return this._emitError(new Error('Cannot parse messageId'))
// 		// Properties mqtt 5
// 		if (this.settings.protocolVersion === 5) {
// 			var properties = this._parseProperties()
// 			if (Object.getOwnPropertyNames(properties).length) {
// 				packet.properties = properties
// 			}
// 			// Parse granted QoSes
// 			packet.granted = []
// 			while (this._pos < this.packet.length) {
// 				this.packet.granted.push(this._list.readUInt8(this._pos++))
// 			}
// 		}
// 	}
	
// 	// parse packets like puback, pubrec, pubrel, pubcomp
// 	Parser.prototype._parseConfirmation = function () {
// 		var packet = this.packet
	
// 		this._parseMessageId()
	
// 		if (this.settings.protocolVersion === 5) {
// 			if (packet.length > 2) {
// 				// response code
// 				packet.reasonCode = this._parseByte()
// 				// properies mqtt 5
// 				var properties = this._parseProperties()
// 				if (Object.getOwnPropertyNames(properties).length) {
// 					packet.properties = properties
// 				}
// 			}
// 		}
	
// 		return true
// 	}
	
// 	// parse disconnect packet
// 	Parser.prototype._parseDisconnect = function () {
// 		var packet = this.packet
	
// 		if (this.settings.protocolVersion === 5) {
// 			// response code
// 			packet.reasonCode = this._parseByte()
// 			// properies mqtt 5
// 			var properties = this._parseProperties()
// 			if (Object.getOwnPropertyNames(properties).length) {
// 				packet.properties = properties
// 			}
// 		}
	
// 		return true
// 	}
	
// 	// parse auth packet
// 	Parser.prototype._parseAuth = function () {
// 		var packet = this.packet
	
// 		if (this.settings.protocolVersion !== 5) {
// 			return this._emitError(new Error('Not supported auth packet for this version MQTT'))
// 		}
	
// 		// response code
// 		packet.reasonCode = this._parseByte()
// 		// properies mqtt 5
// 		var properties = this._parseProperties()
// 		if (Object.getOwnPropertyNames(properties).length) {
// 			packet.properties = properties
// 		}
	
// 		return true
// 	}
	
// 	Parser.prototype._parseMessageId = function () {
// 		var packet = this.packet
	
// 		packet.messageId = this._parseNum()
	
// 		if (packet.messageId === null) {
// 			this._emitError(new Error('Cannot parse messageId'))
// 			return false
// 		}
	
// 		return true
// 	}
	
// 	Parser.prototype._parseString = function (maybeBuffer) {
// 		var length = this._parseNum()
// 		var result
// 		var end = length + this._pos
	
// 		if (length === -1 || end > this._list.length || end > this.packet.length) return null
	
// 		result = this._list.toString('utf8', this._pos, end)
// 		this._pos += length
	
// 		return result
// 	}
	
// 	Parser.prototype._parseStringPair = function () {
// 		return {
// 			name: this._parseString(),
// 			value: this._parseString()
// 		}
// 	}
	
// 	Parser.prototype._parseBuffer = function () {
// 		var length = this._parseNum()
// 		var result
// 		var end = length + this._pos
	
// 		if (length === -1 || end > this._list.length || end > this.packet.length) return null
	
// 		result = this._list.slice(this._pos, end)
	
// 		this._pos += length
	
// 		return result
// 	}
	
// 	Parser.prototype._parseNum = function () {
// 		if (this._list.length - this._pos < 2) return -1
	
// 		var result = this._list.readUInt16BE(this._pos)
// 		this._pos += 2
	
// 		return result
// 	}
	
// 	Parser.prototype._parse4ByteNum = function () {
// 		if (this._list.length - this._pos < 4) return -1
	
// 		var result = this._list.readUInt32BE(this._pos)
// 		this._pos += 4
	
// 		return result
// 	}
	
// 	Parser.prototype._parseVarByteNum = function (fullInfoFlag) {
// 		var bytes = 0
// 		var mul = 1
// 		var length = 0
// 		var result = true
// 		var current
// 		var padding = this._pos ? this._pos : 0
	
// 		while (bytes < 5) {
// 			current = this._list.readUInt8(padding + bytes++)
// 			length += mul * (current & constants.LENGTH_MASK)
// 			mul *= 0x80
	
// 			if ((current & constants.LENGTH_FIN_MASK) === 0) break
// 			if (this._list.length <= bytes) {
// 				result = false
// 				break
// 			}
// 		}
	
// 		if (padding) {
// 			this._pos += bytes
// 		}
	
// 		result = result
// 			? fullInfoFlag ? {
// 				bytes: bytes,
// 				value: length
// 			} : length
// 			: false
	
// 		return result
// 	}
	
// 	Parser.prototype._parseByte = function () {
// 		var result = this._list.readUInt8(this._pos)
// 		this._pos++
// 		return result
// 	}
	
// 	Parser.prototype._parseByType = function (type) {
// 		switch (type) {
// 			case 'byte': {
// 				return this._parseByte() !== 0
// 			}
// 			case 'int8': {
// 				return this._parseByte()
// 			}
// 			case 'int16': {
// 				return this._parseNum()
// 			}
// 			case 'int32': {
// 				return this._parse4ByteNum()
// 			}
// 			case 'var': {
// 				return this._parseVarByteNum()
// 			}
// 			case 'string': {
// 				return this._parseString()
// 			}
// 			case 'pair': {
// 				return this._parseStringPair()
// 			}
// 			case 'binary': {
// 				return this._parseBuffer()
// 			}
// 		}
// 	}
	
// 	Parser.prototype._parseProperties = function () {
// 		var length = this._parseVarByteNum()
// 		var start = this._pos
// 		var end = start + length
// 		var result = {}
// 		while (this._pos < end) {
// 			var type = this._parseByte()
// 			var name = constants.propertiesCodes[type]
// 			if (!name) {
// 				this._emitError(new Error('Unknown property'))
// 				return false
// 			}
// 			// user properties process
// 			if (name === 'userProperties') {
// 				if (!result[name]) {
// 					result[name] = {}
// 				}
// 				var currentUserProperty = this._parseByType(constants.propertiesTypes[name])
// 				result[name][currentUserProperty.name] = currentUserProperty.value
// 				continue
// 			}
// 			result[name] = this._parseByType(constants.propertiesTypes[name])
// 		}
// 		return result
// 	}
	
// 	Parser.prototype._newPacket = function () {
// 		if (this.packet) {
// 			this._list.consume(this.packet.length)
// 			this.emit('packet', this.packet)
// 		}
	
// 		this.packet = new Packet()
	
// 		this._pos = 0
	
// 		return true
// 	}
	
// 	Parser.prototype._emitError = function (err) {
// 		this.error = err
// 		this.emit('error', err)
// 	}
	
// 	module.exports = Parser
	
// 	},{"./constants":82,"./packet":87,"bl":85,"events":13,"inherits":80}],89:[function(require,module,exports){
// 	'use strict'
	
// 	var protocol = require('./constants')
// 	var Buffer = require('safe-buffer').Buffer
// 	var empty = Buffer.allocUnsafe(0)
// 	var zeroBuf = Buffer.from([0])
// 	var numbers = require('./numbers')
// 	var nextTick = require('process-nextick-args').nextTick
	
// 	var numCache = numbers.cache
// 	var generateNumber = numbers.generateNumber
// 	var generateCache = numbers.generateCache
// 	var genBufVariableByteInt = numbers.genBufVariableByteInt
// 	var generate4ByteBuffer = numbers.generate4ByteBuffer
// 	var writeNumber = writeNumberCached
// 	var toGenerate = true
	
// 	function generate (packet, stream, opts) {
// 		if (stream.cork) {
// 			stream.cork()
// 			nextTick(uncork, stream)
// 		}
	
// 		if (toGenerate) {
// 			toGenerate = false
// 			generateCache()
// 		}
	
// 		switch (packet.cmd) {
// 			case 'connect':
// 				return connect(packet, stream, opts)
// 			case 'connack':
// 				return connack(packet, stream, opts)
// 			case 'publish':
// 				return publish(packet, stream, opts)
// 			case 'puback':
// 			case 'pubrec':
// 			case 'pubrel':
// 			case 'pubcomp':
// 				return confirmation(packet, stream, opts)
// 			case 'subscribe':
// 				return subscribe(packet, stream, opts)
// 			case 'suback':
// 				return suback(packet, stream, opts)
// 			case 'unsubscribe':
// 				return unsubscribe(packet, stream, opts)
// 			case 'unsuback':
// 				return unsuback(packet, stream, opts)
// 			case 'pingreq':
// 			case 'pingresp':
// 				return emptyPacket(packet, stream, opts)
// 			case 'disconnect':
// 				return disconnect(packet, stream, opts)
// 			case 'auth':
// 				return auth(packet, stream, opts)
// 			default:
// 				stream.emit('error', new Error('Unknown command'))
// 				return false
// 		}
// 	}
// 	/**
// 	 * Controls numbers cache.
// 	 * Set to "false" to allocate buffers on-the-flight instead of pre-generated cache
// 	 */
// 	Object.defineProperty(generate, 'cacheNumbers', {
// 		get: function () {
// 			return writeNumber === writeNumberCached
// 		},
// 		set: function (value) {
// 			if (value) {
// 				if (!numCache || Object.keys(numCache).length === 0) toGenerate = true
// 				writeNumber = writeNumberCached
// 			} else {
// 				toGenerate = false
// 				writeNumber = writeNumberGenerated
// 			}
// 		}
// 	})
	
// 	function uncork (stream) {
// 		stream.uncork()
// 	}
	
// 	function connect (packet, stream, opts) {
// 		var settings = packet || {}
// 		var protocolId = settings.protocolId || 'MQTT'
// 		var protocolVersion = settings.protocolVersion || 4
// 		var will = settings.will
// 		var clean = settings.clean
// 		var keepalive = settings.keepalive || 0
// 		var clientId = settings.clientId || ''
// 		var username = settings.username
// 		var password = settings.password
// 		/* mqtt5 new oprions */
// 		var properties = settings.properties
	
// 		if (clean === undefined) clean = true
	
// 		var length = 0
	
// 		// Must be a string and non-falsy
// 		if (!protocolId ||
// 			 (typeof protocolId !== 'string' && !Buffer.isBuffer(protocolId))) {
// 			stream.emit('error', new Error('Invalid protocolId'))
// 			return false
// 		} else length += protocolId.length + 2
	
// 		// Must be 3 or 4 or 5
// 		if (protocolVersion !== 3 && protocolVersion !== 4 && protocolVersion !== 5) {
// 			stream.emit('error', new Error('Invalid protocol version'))
// 			return false
// 		} else length += 1
	
// 		// ClientId might be omitted in 3.1.1, but only if cleanSession is set to 1
// 		if ((typeof clientId === 'string' || Buffer.isBuffer(clientId)) &&
// 			 (clientId || protocolVersion === 4) && (clientId || clean)) {
// 			length += clientId.length + 2
// 		} else {
// 			if (protocolVersion < 4) {
// 				stream.emit('error', new Error('clientId must be supplied before 3.1.1'))
// 				return false
// 			}
// 			if ((clean * 1) === 0) {
// 				stream.emit('error', new Error('clientId must be given if cleanSession set to 0'))
// 				return false
// 			}
// 		}
	
// 		// Must be a two byte number
// 		if (typeof keepalive !== 'number' ||
// 				keepalive < 0 ||
// 				keepalive > 65535 ||
// 				keepalive % 1 !== 0) {
// 			stream.emit('error', new Error('Invalid keepalive'))
// 			return false
// 		} else length += 2
	
// 		// Connect flags
// 		length += 1
	
// 		// Properties
// 		if (protocolVersion === 5) {
// 			var propertiesData = getProperties(stream, properties)
// 			length += propertiesData.length
// 		}
	
// 		// If will exists...
// 		if (will) {
// 			// It must be an object
// 			if (typeof will !== 'object') {
// 				stream.emit('error', new Error('Invalid will'))
// 				return false
// 			}
// 			// It must have topic typeof string
// 			if (!will.topic || typeof will.topic !== 'string') {
// 				stream.emit('error', new Error('Invalid will topic'))
// 				return false
// 			} else {
// 				length += Buffer.byteLength(will.topic) + 2
// 			}
	
// 			// Payload
// 			if (will.payload) {
// 				if (will.payload.length >= 0) {
// 					if (typeof will.payload === 'string') {
// 						length += Buffer.byteLength(will.payload) + 2
// 					} else {
// 						length += will.payload.length + 2
// 					}
// 				} else {
// 					stream.emit('error', new Error('Invalid will payload'))
// 					return false
// 				}
	
// 				// will properties
// 				var willProperties = {}
// 				if (protocolVersion === 5) {
// 					willProperties = getProperties(stream, will.properties)
// 					length += willProperties.length
// 				}
// 			}
// 		}
	
// 		// Username
// 		var providedUsername = false
// 		if (username != null) {
// 			if (isStringOrBuffer(username)) {
// 				providedUsername = true
// 				length += Buffer.byteLength(username) + 2
// 			} else {
// 				stream.emit('error', new Error('Invalid username'))
// 				return false
// 			}
// 		}
	
// 		// Password
// 		if (password != null) {
// 			if (!providedUsername) {
// 				stream.emit('error', new Error('Username is required to use password'))
// 				return false
// 			}
	
// 			if (isStringOrBuffer(password)) {
// 				length += byteLength(password) + 2
// 			} else {
// 				stream.emit('error', new Error('Invalid password'))
// 				return false
// 			}
// 		}
	
// 		// Generate header
// 		stream.write(protocol.CONNECT_HEADER)
	
// 		// Generate length
// 		writeVarByteInt(stream, length)
	
// 		// Generate protocol ID
// 		writeStringOrBuffer(stream, protocolId)
// 		stream.write(
// 			protocolVersion === 4
// 				? protocol.VERSION4
// 				: protocolVersion === 5
// 					? protocol.VERSION5
// 					: protocol.VERSION3
// 		)
	
// 		// Connect flags
// 		var flags = 0
// 		flags |= (username != null) ? protocol.USERNAME_MASK : 0
// 		flags |= (password != null) ? protocol.PASSWORD_MASK : 0
// 		flags |= (will && will.retain) ? protocol.WILL_RETAIN_MASK : 0
// 		flags |= (will && will.qos) ? will.qos << protocol.WILL_QOS_SHIFT : 0
// 		flags |= will ? protocol.WILL_FLAG_MASK : 0
// 		flags |= clean ? protocol.CLEAN_SESSION_MASK : 0
	
// 		stream.write(Buffer.from([flags]))
	
// 		// Keepalive
// 		writeNumber(stream, keepalive)
	
// 		// Properties
// 		if (protocolVersion === 5) {
// 			propertiesData.write()
// 		}
	
// 		// Client ID
// 		writeStringOrBuffer(stream, clientId)
	
// 		// Will
// 		if (will) {
// 			if (protocolVersion === 5) {
// 				willProperties.write()
// 			}
// 			writeString(stream, will.topic)
// 			writeStringOrBuffer(stream, will.payload)
// 		}
	
// 		// Username and password
// 		if (username != null) {
// 			writeStringOrBuffer(stream, username)
// 		}
// 		if (password != null) {
// 			writeStringOrBuffer(stream, password)
// 		}
// 		// This is a small packet that happens only once on a stream
// 		// We assume the stream is always free to receive more data after this
// 		return true
// 	}
	
// 	function connack (packet, stream, opts) {
// 		var version = opts ? opts.protocolVersion : 4
// 		var settings = packet || {}
// 		var rc = version === 5 ? settings.reasonCode : settings.returnCode
// 		var properties = settings.properties
// 		var length = 2 // length of rc and sessionHeader
	
// 		// Check return code
// 		if (typeof rc !== 'number') {
// 			stream.emit('error', new Error('Invalid return code'))
// 			return false
// 		}
// 		// mqtt5 properties
// 		var propertiesData = null
// 		if (version === 5) {
// 			propertiesData = getProperties(stream, properties)
// 			length += propertiesData.length
// 		}
	
// 		stream.write(protocol.CONNACK_HEADER)
// 		// length
// 		writeVarByteInt(stream, length)
// 		stream.write(settings.sessionPresent ? protocol.SESSIONPRESENT_HEADER : zeroBuf)
	
// 		stream.write(Buffer.from([rc]))
// 		if (propertiesData != null) {
// 			propertiesData.write()
// 		}
// 		return true
// 	}
	
// 	function publish (packet, stream, opts) {
// 		var version = opts ? opts.protocolVersion : 4
// 		var settings = packet || {}
// 		var qos = settings.qos || 0
// 		var retain = settings.retain ? protocol.RETAIN_MASK : 0
// 		var topic = settings.topic
// 		var payload = settings.payload || empty
// 		var id = settings.messageId
// 		var properties = settings.properties
	
// 		var length = 0
	
// 		// Topic must be a non-empty string or Buffer
// 		if (typeof topic === 'string') length += Buffer.byteLength(topic) + 2
// 		else if (Buffer.isBuffer(topic)) length += topic.length + 2
// 		else {
// 			stream.emit('error', new Error('Invalid topic'))
// 			return false
// 		}
	
// 		// Get the payload length
// 		if (!Buffer.isBuffer(payload)) length += Buffer.byteLength(payload)
// 		else length += payload.length
	
// 		// Message ID must a number if qos > 0
// 		if (qos && typeof id !== 'number') {
// 			stream.emit('error', new Error('Invalid messageId'))
// 			return false
// 		} else if (qos) length += 2
	
// 		// mqtt5 properties
// 		var propertiesData = null
// 		if (version === 5) {
// 			propertiesData = getProperties(stream, properties)
// 			length += propertiesData.length
// 		}
	
// 		// Header
// 		stream.write(protocol.PUBLISH_HEADER[qos][settings.dup ? 1 : 0][retain ? 1 : 0])
	
// 		// Remaining length
// 		writeVarByteInt(stream, length)
	
// 		// Topic
// 		writeNumber(stream, byteLength(topic))
// 		stream.write(topic)
	
// 		// Message ID
// 		if (qos > 0) writeNumber(stream, id)
	
// 		// Properties
// 		if (propertiesData != null) {
// 			propertiesData.write()
// 		}
	
// 		// Payload
// 		return stream.write(payload)
// 	}
	
// 	/* Puback, pubrec, pubrel and pubcomp */
// 	function confirmation (packet, stream, opts) {
// 		var version = opts ? opts.protocolVersion : 4
// 		var settings = packet || {}
// 		var type = settings.cmd || 'puback'
// 		var id = settings.messageId
// 		var dup = (settings.dup && type === 'pubrel') ? protocol.DUP_MASK : 0
// 		var qos = 0
// 		var reasonCode = settings.reasonCode
// 		var properties = settings.properties
// 		var length = version === 5 ? 3 : 2
	
// 		if (type === 'pubrel') qos = 1
	
// 		// Check message ID
// 		if (typeof id !== 'number') {
// 			stream.emit('error', new Error('Invalid messageId'))
// 			return false
// 		}
	
// 		// properies mqtt 5
// 		var propertiesData = null
// 		if (version === 5) {
// 			propertiesData = getPropertiesByMaximumPacketSize(stream, properties, opts, length)
// 			if (!propertiesData) { return false }
// 			length += propertiesData.length
// 		}
	
// 		// Header
// 		stream.write(protocol.ACKS[type][qos][dup][0])
	
// 		// Length
// 		writeVarByteInt(stream, length)
	
// 		// Message ID
// 		writeNumber(stream, id)
	
// 		// reason code in header
// 		if (version === 5) {
// 			stream.write(Buffer.from([reasonCode]))
// 		}
	
// 		// properies mqtt 5
// 		if (propertiesData !== null) {
// 			propertiesData.write()
// 		}
// 		return true
// 	}
	
// 	function subscribe (packet, stream, opts) {
// 		var version = opts ? opts.protocolVersion : 4
// 		var settings = packet || {}
// 		var dup = settings.dup ? protocol.DUP_MASK : 0
// 		var id = settings.messageId
// 		var subs = settings.subscriptions
// 		var properties = settings.properties
	
// 		var length = 0
	
// 		// Check message ID
// 		if (typeof id !== 'number') {
// 			stream.emit('error', new Error('Invalid messageId'))
// 			return false
// 		} else length += 2
	
// 		// properies mqtt 5
// 		var propertiesData = null
// 		if (version === 5) {
// 			propertiesData = getProperties(stream, properties)
// 			length += propertiesData.length
// 		}
	
// 		// Check subscriptions
// 		if (typeof subs === 'object' && subs.length) {
// 			for (var i = 0; i < subs.length; i += 1) {
// 				var itopic = subs[i].topic
// 				var iqos = subs[i].qos
	
// 				if (typeof itopic !== 'string') {
// 					stream.emit('error', new Error('Invalid subscriptions - invalid topic'))
// 					return false
// 				}
// 				if (typeof iqos !== 'number') {
// 					stream.emit('error', new Error('Invalid subscriptions - invalid qos'))
// 					return false
// 				}
	
// 				if (version === 5) {
// 					var nl = subs[i].nl || false
// 					if (typeof nl !== 'boolean') {
// 						stream.emit('error', new Error('Invalid subscriptions - invalid No Local'))
// 						return false
// 					}
// 					var rap = subs[i].rap || false
// 					if (typeof rap !== 'boolean') {
// 						stream.emit('error', new Error('Invalid subscriptions - invalid Retain as Published'))
// 						return false
// 					}
// 					var rh = subs[i].rh || 0
// 					if (typeof rh !== 'number' || rh > 2) {
// 						stream.emit('error', new Error('Invalid subscriptions - invalid Retain Handling'))
// 						return false
// 					}
// 				}
	
// 				length += Buffer.byteLength(itopic) + 2 + 1
// 			}
// 		} else {
// 			stream.emit('error', new Error('Invalid subscriptions'))
// 			return false
// 		}
	
// 		// Generate header
// 		stream.write(protocol.SUBSCRIBE_HEADER[1][dup ? 1 : 0][0])
	
// 		// Generate length
// 		writeVarByteInt(stream, length)
	
// 		// Generate message ID
// 		writeNumber(stream, id)
	
// 		// properies mqtt 5
// 		if (propertiesData !== null) {
// 			propertiesData.write()
// 		}
	
// 		var result = true
	
// 		// Generate subs
// 		for (var j = 0; j < subs.length; j++) {
// 			var sub = subs[j]
// 			var jtopic = sub.topic
// 			var jqos = sub.qos
// 			var jnl = +sub.nl
// 			var jrap = +sub.rap
// 			var jrh = sub.rh
// 			var joptions
	
// 			// Write topic string
// 			writeString(stream, jtopic)
	
// 			// options process
// 			joptions = protocol.SUBSCRIBE_OPTIONS_QOS[jqos]
// 			if (version === 5) {
// 				joptions |= jnl ? protocol.SUBSCRIBE_OPTIONS_NL : 0
// 				joptions |= jrap ? protocol.SUBSCRIBE_OPTIONS_RAP : 0
// 				joptions |= jrh ? protocol.SUBSCRIBE_OPTIONS_RH[jrh] : 0
// 			}
// 			// Write options
// 			result = stream.write(Buffer.from([joptions]))
// 		}
	
// 		return result
// 	}
	
// 	function suback (packet, stream, opts) {
// 		var version = opts ? opts.protocolVersion : 4
// 		var settings = packet || {}
// 		var id = settings.messageId
// 		var granted = settings.granted
// 		var properties = settings.properties
// 		var length = 0
	
// 		// Check message ID
// 		if (typeof id !== 'number') {
// 			stream.emit('error', new Error('Invalid messageId'))
// 			return false
// 		} else length += 2
	
// 		// Check granted qos vector
// 		if (typeof granted === 'object' && granted.length) {
// 			for (var i = 0; i < granted.length; i += 1) {
// 				if (typeof granted[i] !== 'number') {
// 					stream.emit('error', new Error('Invalid qos vector'))
// 					return false
// 				}
// 				length += 1
// 			}
// 		} else {
// 			stream.emit('error', new Error('Invalid qos vector'))
// 			return false
// 		}
	
// 		// properies mqtt 5
// 		var propertiesData = null
// 		if (version === 5) {
// 			propertiesData = getPropertiesByMaximumPacketSize(stream, properties, opts, length)
// 			if (!propertiesData) { return false }
// 			length += propertiesData.length
// 		}
	
// 		// header
// 		stream.write(protocol.SUBACK_HEADER)
	
// 		// Length
// 		writeVarByteInt(stream, length)
	
// 		// Message ID
// 		writeNumber(stream, id)
	
// 		// properies mqtt 5
// 		if (propertiesData !== null) {
// 			propertiesData.write()
// 		}
	
// 		return stream.write(Buffer.from(granted))
// 	}
	
// 	function unsubscribe (packet, stream, opts) {
// 		var version = opts ? opts.protocolVersion : 4
// 		var settings = packet || {}
// 		var id = settings.messageId
// 		var dup = settings.dup ? protocol.DUP_MASK : 0
// 		var unsubs = settings.unsubscriptions
// 		var properties = settings.properties
	
// 		var length = 0
	
// 		// Check message ID
// 		if (typeof id !== 'number') {
// 			stream.emit('error', new Error('Invalid messageId'))
// 			return false
// 		} else {
// 			length += 2
// 		}
// 		// Check unsubs
// 		if (typeof unsubs === 'object' && unsubs.length) {
// 			for (var i = 0; i < unsubs.length; i += 1) {
// 				if (typeof unsubs[i] !== 'string') {
// 					stream.emit('error', new Error('Invalid unsubscriptions'))
// 					return false
// 				}
// 				length += Buffer.byteLength(unsubs[i]) + 2
// 			}
// 		} else {
// 			stream.emit('error', new Error('Invalid unsubscriptions'))
// 			return false
// 		}
// 		// properies mqtt 5
// 		var propertiesData = null
// 		if (version === 5) {
// 			propertiesData = getProperties(stream, properties)
// 			length += propertiesData.length
// 		}
	
// 		// Header
// 		stream.write(protocol.UNSUBSCRIBE_HEADER[1][dup ? 1 : 0][0])
	
// 		// Length
// 		writeVarByteInt(stream, length)
	
// 		// Message ID
// 		writeNumber(stream, id)
	
// 		// properies mqtt 5
// 		if (propertiesData !== null) {
// 			propertiesData.write()
// 		}
	
// 		// Unsubs
// 		var result = true
// 		for (var j = 0; j < unsubs.length; j++) {
// 			result = writeString(stream, unsubs[j])
// 		}
	
// 		return result
// 	}
	
// 	function unsuback (packet, stream, opts) {
// 		var version = opts ? opts.protocolVersion : 4
// 		var settings = packet || {}
// 		var id = settings.messageId
// 		var dup = settings.dup ? protocol.DUP_MASK : 0
// 		var granted = settings.granted
// 		var properties = settings.properties
// 		var type = settings.cmd
// 		var qos = 0
	
// 		var length = 2
	
// 		// Check message ID
// 		if (typeof id !== 'number') {
// 			stream.emit('error', new Error('Invalid messageId'))
// 			return false
// 		}
	
// 		// Check granted
// 		if (version === 5) {
// 			if (typeof granted === 'object' && granted.length) {
// 				for (var i = 0; i < granted.length; i += 1) {
// 					if (typeof granted[i] !== 'number') {
// 						stream.emit('error', new Error('Invalid qos vector'))
// 						return false
// 					}
// 					length += 1
// 				}
// 			} else {
// 				stream.emit('error', new Error('Invalid qos vector'))
// 				return false
// 			}
// 		}
	
// 		// properies mqtt 5
// 		var propertiesData = null
// 		if (version === 5) {
// 			propertiesData = getPropertiesByMaximumPacketSize(stream, properties, opts, length)
// 			if (!propertiesData) { return false }
// 			length += propertiesData.length
// 		}
	
// 		// Header
// 		stream.write(protocol.ACKS[type][qos][dup][0])
	
// 		// Length
// 		writeVarByteInt(stream, length)
	
// 		// Message ID
// 		writeNumber(stream, id)
	
// 		// properies mqtt 5
// 		if (propertiesData !== null) {
// 			propertiesData.write()
// 		}
	
// 		// payload
// 		if (version === 5) {
// 			stream.write(Buffer.from(granted))
// 		}
// 		return true
// 	}
	
// 	function emptyPacket (packet, stream, opts) {
// 		return stream.write(protocol.EMPTY[packet.cmd])
// 	}
	
// 	function disconnect (packet, stream, opts) {
// 		var version = opts ? opts.protocolVersion : 4
// 		var settings = packet || {}
// 		var reasonCode = settings.reasonCode
// 		var properties = settings.properties
// 		var length = version === 5 ? 1 : 0
	
// 		// properies mqtt 5
// 		var propertiesData = null
// 		if (version === 5) {
// 			propertiesData = getPropertiesByMaximumPacketSize(stream, properties, opts, length)
// 			if (!propertiesData) { return false }
// 			length += propertiesData.length
// 		}
	
// 		// Header
// 		stream.write(Buffer.from([protocol.codes['disconnect'] << 4]))
	
// 		// Length
// 		writeVarByteInt(stream, length)
	
// 		// reason code in header
// 		if (version === 5) {
// 			stream.write(Buffer.from([reasonCode]))
// 		}
	
// 		// properies mqtt 5
// 		if (propertiesData !== null) {
// 			propertiesData.write()
// 		}
	
// 		return true
// 	}
	
// 	function auth (packet, stream, opts) {
// 		var version = opts ? opts.protocolVersion : 4
// 		var settings = packet || {}
// 		var reasonCode = settings.reasonCode
// 		var properties = settings.properties
// 		var length = version === 5 ? 1 : 0
	
// 		if (version !== 5) stream.emit('error', new Error('Invalid mqtt version for auth packet'))
	
// 		// properies mqtt 5
// 		var propertiesData = getPropertiesByMaximumPacketSize(stream, properties, opts, length)
// 		if (!propertiesData) { return false }
// 		length += propertiesData.length
	
// 		// Header
// 		stream.write(Buffer.from([protocol.codes['auth'] << 4]))
	
// 		// Length
// 		writeVarByteInt(stream, length)
	
// 		// reason code in header
// 		stream.write(Buffer.from([reasonCode]))
	
// 		// properies mqtt 5
// 		if (propertiesData !== null) {
// 			propertiesData.write()
// 		}
// 		return true
// 	}
	
// 	/**
// 	 * writeVarByteInt - write an MQTT style variable byte integer to the buffer
// 	 *
// 	 * @param <Buffer> buffer - destination
// 	 * @param <Number> pos - offset
// 	 * @param <Number> length - length (>0)
// 	 * @returns <Number> number of bytes written
// 	 *
// 	 * @api private
// 	 */
	
// 	var varByteIntCache = {}
// 	function writeVarByteInt (stream, num) {
// 		var buffer = varByteIntCache[num]
	
// 		if (!buffer) {
// 			buffer = genBufVariableByteInt(num).data
// 			if (num < 16384) varByteIntCache[num] = buffer
// 		}
	
// 		stream.write(buffer)
// 	}
	
// 	/**
// 	 * writeString - write a utf8 string to the buffer
// 	 *
// 	 * @param <Buffer> buffer - destination
// 	 * @param <Number> pos - offset
// 	 * @param <String> string - string to write
// 	 * @return <Number> number of bytes written
// 	 *
// 	 * @api private
// 	 */
	
// 	function writeString (stream, string) {
// 		var strlen = Buffer.byteLength(string)
// 		writeNumber(stream, strlen)
	
// 		stream.write(string, 'utf8')
// 	}
	
// 	/**
// 	 * writeStringPair - write a utf8 string pairs to the buffer
// 	 *
// 	 * @param <Buffer> buffer - destination
// 	 * @param <String> name - string name to write
// 	 * @param <String> value - string value to write
// 	 * @return <Number> number of bytes written
// 	 *
// 	 * @api private
// 	 */
// 	function writeStringPair (stream, name, value) {
// 		writeString(stream, name)
// 		writeString(stream, value)
// 	}
	
// 	/**
// 	 * writeNumber - write a two byte number to the buffer
// 	 *
// 	 * @param <Buffer> buffer - destination
// 	 * @param <Number> pos - offset
// 	 * @param <String> number - number to write
// 	 * @return <Number> number of bytes written
// 	 *
// 	 * @api private
// 	 */
// 	function writeNumberCached (stream, number) {
// 		return stream.write(numCache[number])
// 	}
// 	function writeNumberGenerated (stream, number) {
// 		return stream.write(generateNumber(number))
// 	}
// 	function write4ByteNumber (stream, number) {
// 		return stream.write(generate4ByteBuffer(number))
// 	}
// 	/**
// 	 * writeStringOrBuffer - write a String or Buffer with the its length prefix
// 	 *
// 	 * @param <Buffer> buffer - destination
// 	 * @param <Number> pos - offset
// 	 * @param <String> toWrite - String or Buffer
// 	 * @return <Number> number of bytes written
// 	 */
// 	function writeStringOrBuffer (stream, toWrite) {
// 		if (typeof toWrite === 'string') {
// 			writeString(stream, toWrite)
// 		} else if (toWrite) {
// 			writeNumber(stream, toWrite.length)
// 			stream.write(toWrite)
// 		} else writeNumber(stream, 0)
// 	}
	
// 	function getProperties (stream, properties) {
// 		/* connect properties */
// 		if (typeof properties !== 'object' || properties.length != null) {
// 			return {
// 				length: 1,
// 				write: function () {
// 					writeProperties(stream, {}, 0)
// 				}
// 			}
// 		}
// 		var propertiesLength = 0
// 		function getLengthProperty (name) {
// 			var type = protocol.propertiesTypes[name]
// 			var value = properties[name]
// 			var length = 0
// 			switch (type) {
// 				case 'byte': {
// 					if (typeof value !== 'boolean') {
// 						stream.emit('error', new Error('Invalid ' + name))
// 						return false
// 					}
// 					length += 1 + 1
// 					break
// 				}
// 				case 'int8': {
// 					if (typeof value !== 'number') {
// 						stream.emit('error', new Error('Invalid ' + name))
// 						return false
// 					}
// 					length += 1 + 1
// 					break
// 				}
// 				case 'binary': {
// 					if (value && value === null) {
// 						stream.emit('error', new Error('Invalid ' + name))
// 						return false
// 					}
// 					length += 1 + Buffer.byteLength(value) + 2
// 					break
// 				}
// 				case 'int16': {
// 					if (typeof value !== 'number') {
// 						stream.emit('error', new Error('Invalid ' + name))
// 						return false
// 					}
// 					length += 1 + 2
// 					break
// 				}
// 				case 'int32': {
// 					if (typeof value !== 'number') {
// 						stream.emit('error', new Error('Invalid ' + name))
// 						return false
// 					}
// 					length += 1 + 4
// 					break
// 				}
// 				case 'var': {
// 					if (typeof value !== 'number') {
// 						stream.emit('error', new Error('Invalid ' + name))
// 						return false
// 					}
// 					length += 1 + genBufVariableByteInt(value).length
// 					break
// 				}
// 				case 'string': {
// 					if (typeof value !== 'string') {
// 						stream.emit('error', new Error('Invalid ' + name))
// 						return false
// 					}
// 					length += 1 + 2 + Buffer.byteLength(value.toString())
// 					break
// 				}
// 				case 'pair': {
// 					if (typeof value !== 'object') {
// 						stream.emit('error', new Error('Invalid ' + name))
// 						return false
// 					}
// 					length += Object.getOwnPropertyNames(value).reduce(function (result, name) {
// 						result += 1 + 2 + Buffer.byteLength(name.toString()) + 2 + Buffer.byteLength(value[name].toString())
// 						return result
// 					}, 0)
// 					break
// 				}
// 				default: {
// 					stream.emit('error', new Error('Invalid property ' + name))
// 					return false
// 				}
// 			}
// 			return length
// 		}
// 		if (properties) {
// 			for (var propName in properties) {
// 				var propLength = getLengthProperty(propName)
// 				if (!propLength) return false
// 				propertiesLength += propLength
// 			}
// 		}
// 		var propertiesLengthLength = genBufVariableByteInt(propertiesLength).length
	
// 		return {
// 			length: propertiesLengthLength + propertiesLength,
// 			write: function () {
// 				writeProperties(stream, properties, propertiesLength)
// 			}
// 		}
// 	}
	
// 	function getPropertiesByMaximumPacketSize (stream, properties, opts, length) {
// 		var mayEmptyProps = ['reasonString', 'userProperties']
// 		var maximumPacketSize = opts && opts.properties && opts.properties.maximumPacketSize ? opts.properties.maximumPacketSize : 0
	
// 		var propertiesData = getProperties(stream, properties)
// 		if (maximumPacketSize) {
// 			while (length + propertiesData.length > maximumPacketSize) {
// 				var currentMayEmptyProp = mayEmptyProps.shift()
// 				if (currentMayEmptyProp && properties[currentMayEmptyProp]) {
// 					delete properties[currentMayEmptyProp]
// 					propertiesData = getProperties(stream, properties)
// 				} else {
// 					return false
// 				}
// 			}
// 		}
// 		return propertiesData
// 	}
	
// 	function writeProperties (stream, properties, propertiesLength) {
// 		/* write properties to stream */
// 		writeVarByteInt(stream, propertiesLength)
// 		for (var propName in properties) {
// 			if (properties.hasOwnProperty(propName) && properties[propName] !== null) {
// 				var value = properties[propName]
// 				var type = protocol.propertiesTypes[propName]
// 				switch (type) {
// 					case 'byte': {
// 						stream.write(Buffer.from([protocol.properties[propName]]))
// 						stream.write(Buffer.from([+value]))
// 						break
// 					}
// 					case 'int8': {
// 						stream.write(Buffer.from([protocol.properties[propName]]))
// 						stream.write(Buffer.from([value]))
// 						break
// 					}
// 					case 'binary': {
// 						stream.write(Buffer.from([protocol.properties[propName]]))
// 						writeStringOrBuffer(stream, value)
// 						break
// 					}
// 					case 'int16': {
// 						stream.write(Buffer.from([protocol.properties[propName]]))
// 						writeNumber(stream, value)
// 						break
// 					}
// 					case 'int32': {
// 						stream.write(Buffer.from([protocol.properties[propName]]))
// 						write4ByteNumber(stream, value)
// 						break
// 					}
// 					case 'var': {
// 						stream.write(Buffer.from([protocol.properties[propName]]))
// 						writeVarByteInt(stream, value)
// 						break
// 					}
// 					case 'string': {
// 						stream.write(Buffer.from([protocol.properties[propName]]))
// 						writeString(stream, value)
// 						break
// 					}
// 					case 'pair': {
// 						Object.getOwnPropertyNames(value).forEach(function (name) {
// 							stream.write(Buffer.from([protocol.properties[propName]]))
// 							writeStringPair(stream, name.toString(), value[name].toString())
// 						})
// 						break
// 					}
// 					default: {
// 						stream.emit('error', new Error('Invalid property ' + propName))
// 						return false
// 					}
// 				}
// 			}
// 		}
// 	}
	
// 	function byteLength (bufOrString) {
// 		if (!bufOrString) return 0
// 		else if (bufOrString instanceof Buffer) return bufOrString.length
// 		else return Buffer.byteLength(bufOrString)
// 	}
	
// 	function isStringOrBuffer (field) {
// 		return typeof field === 'string' || field instanceof Buffer
// 	}
	
// 	module.exports = generate
	
// 	},{"./constants":82,"./numbers":86,"process-nextick-args":91,"safe-buffer":110}],90:[function(require,module,exports){
// 	var wrappy = require('wrappy')
// 	module.exports = wrappy(once)
// 	module.exports.strict = wrappy(onceStrict)
	
// 	once.proto = once(function () {
// 		Object.defineProperty(Function.prototype, 'once', {
// 			value: function () {
// 				return once(this)
// 			},
// 			configurable: true
// 		})
	
// 		Object.defineProperty(Function.prototype, 'onceStrict', {
// 			value: function () {
// 				return onceStrict(this)
// 			},
// 			configurable: true
// 		})
// 	})
	
// 	function once (fn) {
// 		var f = function () {
// 			if (f.called) return f.value
// 			f.called = true
// 			return f.value = fn.apply(this, arguments)
// 		}
// 		f.called = false
// 		return f
// 	}
	
// 	function onceStrict (fn) {
// 		var f = function () {
// 			if (f.called)
// 				throw new Error(f.onceError)
// 			f.called = true
// 			return f.value = fn.apply(this, arguments)
// 		}
// 		var name = fn.name || 'Function wrapped with `once`'
// 		f.onceError = name + " shouldn't be called more than once"
// 		f.called = false
// 		return f
// 	}
	
// 	},{"wrappy":120}],91:[function(require,module,exports){
// 	(function (process){
// 	'use strict';
	
// 	if (!process.version ||
// 			process.version.indexOf('v0.') === 0 ||
// 			process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
// 		module.exports = { nextTick: nextTick };
// 	} else {
// 		module.exports = process
// 	}
	
// 	function nextTick(fn, arg1, arg2, arg3) {
// 		if (typeof fn !== 'function') {
// 			throw new TypeError('"callback" argument must be a function');
// 		}
// 		var len = arguments.length;
// 		var args, i;
// 		switch (len) {
// 		case 0:
// 		case 1:
// 			return process.nextTick(fn);
// 		case 2:
// 			return process.nextTick(function afterTickOne() {
// 				fn.call(null, arg1);
// 			});
// 		case 3:
// 			return process.nextTick(function afterTickTwo() {
// 				fn.call(null, arg1, arg2);
// 			});
// 		case 4:
// 			return process.nextTick(function afterTickThree() {
// 				fn.call(null, arg1, arg2, arg3);
// 			});
// 		default:
// 			args = new Array(len - 1);
// 			i = 0;
// 			while (i < args.length) {
// 				args[i++] = arguments[i];
// 			}
// 			return process.nextTick(function afterTick() {
// 				fn.apply(null, args);
// 			});
// 		}
// 	}
	
	
// 	}).call(this,require('_process'))
// 	},{"_process":92}],92:[function(require,module,exports){
// 	// shim for using process in browser
// 	var process = module.exports = {};
	
// 	// cached from whatever global is present so that test runners that stub it
// 	// don't break things.  But we need to wrap it in a try catch in case it is
// 	// wrapped in strict mode code which doesn't define any globals.  It's inside a
// 	// function because try/catches deoptimize in certain engines.
	
// 	var cachedSetTimeout;
// 	var cachedClearTimeout;
	
// 	function defaultSetTimout() {
// 			throw new Error('setTimeout has not been defined');
// 	}
// 	function defaultClearTimeout () {
// 			throw new Error('clearTimeout has not been defined');
// 	}
// 	(function () {
// 			try {
// 					if (typeof setTimeout === 'function') {
// 							cachedSetTimeout = setTimeout;
// 					} else {
// 							cachedSetTimeout = defaultSetTimout;
// 					}
// 			} catch (e) {
// 					cachedSetTimeout = defaultSetTimout;
// 			}
// 			try {
// 					if (typeof clearTimeout === 'function') {
// 							cachedClearTimeout = clearTimeout;
// 					} else {
// 							cachedClearTimeout = defaultClearTimeout;
// 					}
// 			} catch (e) {
// 					cachedClearTimeout = defaultClearTimeout;
// 			}
// 	} ())
// 	function runTimeout(fun) {
// 			if (cachedSetTimeout === setTimeout) {
// 					//normal enviroments in sane situations
// 					return setTimeout(fun, 0);
// 			}
// 			// if setTimeout wasn't available but was latter defined
// 			if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
// 					cachedSetTimeout = setTimeout;
// 					return setTimeout(fun, 0);
// 			}
// 			try {
// 					// when when somebody has screwed with setTimeout but no I.E. maddness
// 					return cachedSetTimeout(fun, 0);
// 			} catch(e){
// 					try {
// 							// When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
// 							return cachedSetTimeout.call(null, fun, 0);
// 					} catch(e){
// 							// same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
// 							return cachedSetTimeout.call(this, fun, 0);
// 					}
// 			}
	
	
// 	}
// 	function runClearTimeout(marker) {
// 			if (cachedClearTimeout === clearTimeout) {
// 					//normal enviroments in sane situations
// 					return clearTimeout(marker);
// 			}
// 			// if clearTimeout wasn't available but was latter defined
// 			if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
// 					cachedClearTimeout = clearTimeout;
// 					return clearTimeout(marker);
// 			}
// 			try {
// 					// when when somebody has screwed with setTimeout but no I.E. maddness
// 					return cachedClearTimeout(marker);
// 			} catch (e){
// 					try {
// 							// When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
// 							return cachedClearTimeout.call(null, marker);
// 					} catch (e){
// 							// same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
// 							// Some versions of I.E. have different rules for clearTimeout vs setTimeout
// 							return cachedClearTimeout.call(this, marker);
// 					}
// 			}
	
	
	
// 	}
// 	var queue = [];
// 	var draining = false;
// 	var currentQueue;
// 	var queueIndex = -1;
	
// 	function cleanUpNextTick() {
// 			if (!draining || !currentQueue) {
// 					return;
// 			}
// 			draining = false;
// 			if (currentQueue.length) {
// 					queue = currentQueue.concat(queue);
// 			} else {
// 					queueIndex = -1;
// 			}
// 			if (queue.length) {
// 					drainQueue();
// 			}
// 	}
	
// 	function drainQueue() {
// 			if (draining) {
// 					return;
// 			}
// 			var timeout = runTimeout(cleanUpNextTick);
// 			draining = true;
	
// 			var len = queue.length;
// 			while(len) {
// 					currentQueue = queue;
// 					queue = [];
// 					while (++queueIndex < len) {
// 							if (currentQueue) {
// 									currentQueue[queueIndex].run();
// 							}
// 					}
// 					queueIndex = -1;
// 					len = queue.length;
// 			}
// 			currentQueue = null;
// 			draining = false;
// 			runClearTimeout(timeout);
// 	}
	
// 	process.nextTick = function (fun) {
// 			var args = new Array(arguments.length - 1);
// 			if (arguments.length > 1) {
// 					for (var i = 1; i < arguments.length; i++) {
// 							args[i - 1] = arguments[i];
// 					}
// 			}
// 			queue.push(new Item(fun, args));
// 			if (queue.length === 1 && !draining) {
// 					runTimeout(drainQueue);
// 			}
// 	};
	
// 	// v8 likes predictible objects
// 	function Item(fun, array) {
// 			this.fun = fun;
// 			this.array = array;
// 	}
// 	Item.prototype.run = function () {
// 			this.fun.apply(null, this.array);
// 	};
// 	process.title = 'browser';
// 	process.browser = true;
// 	process.env = {};
// 	process.argv = [];
// 	process.version = ''; // empty string to avoid regexp issues
// 	process.versions = {};
	
// 	function noop() {}
	
// 	process.on = noop;
// 	process.addListener = noop;
// 	process.once = noop;
// 	process.off = noop;
// 	process.removeListener = noop;
// 	process.removeAllListeners = noop;
// 	process.emit = noop;
// 	process.prependListener = noop;
// 	process.prependOnceListener = noop;
	
// 	process.listeners = function (name) { return [] }
	
// 	process.binding = function (name) {
// 			throw new Error('process.binding is not supported');
// 	};
	
// 	process.cwd = function () { return '/' };
// 	process.chdir = function (dir) {
// 			throw new Error('process.chdir is not supported');
// 	};
// 	process.umask = function() { return 0; };
	
// 	},{}],93:[function(require,module,exports){
// 	(function (global){
// 	/*! https://mths.be/punycode v1.4.1 by @mathias */
// 	;(function(root) {
	
// 		/** Detect free variables */
// 		var freeExports = typeof exports == 'object' && exports &&
// 			!exports.nodeType && exports;
// 		var freeModule = typeof module == 'object' && module &&
// 			!module.nodeType && module;
// 		var freeGlobal = typeof global == 'object' && global;
// 		if (
// 			freeGlobal.global === freeGlobal ||
// 			freeGlobal.window === freeGlobal ||
// 			freeGlobal.self === freeGlobal
// 		) {
// 			root = freeGlobal;
// 		}
	
// 		/**
// 		 * The `punycode` object.
// 		 * @name punycode
// 		 * @type Object
// 		 */
// 		var punycode,
	
// 		/** Highest positive signed 32-bit float value */
// 		maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1
	
// 		/** Bootstring parameters */
// 		base = 36,
// 		tMin = 1,
// 		tMax = 26,
// 		skew = 38,
// 		damp = 700,
// 		initialBias = 72,
// 		initialN = 128, // 0x80
// 		delimiter = '-', // '\x2D'
	
// 		/** Regular expressions */
// 		regexPunycode = /^xn--/,
// 		regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
// 		regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators
	
// 		/** Error messages */
// 		errors = {
// 			'overflow': 'Overflow: input needs wider integers to process',
// 			'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
// 			'invalid-input': 'Invalid input'
// 		},
	
// 		/** Convenience shortcuts */
// 		baseMinusTMin = base - tMin,
// 		floor = Math.floor,
// 		stringFromCharCode = String.fromCharCode,
	
// 		/** Temporary variable */
// 		key;
	
// 		/*--------------------------------------------------------------------------*/
	
// 		/**
// 		 * A generic error utility function.
// 		 * @private
// 		 * @param {String} type The error type.
// 		 * @returns {Error} Throws a `RangeError` with the applicable error message.
// 		 */
// 		function error(type) {
// 			throw new RangeError(errors[type]);
// 		}
	
// 		/**
// 		 * A generic `Array#map` utility function.
// 		 * @private
// 		 * @param {Array} array The array to iterate over.
// 		 * @param {Function} callback The function that gets called for every array
// 		 * item.
// 		 * @returns {Array} A new array of values returned by the callback function.
// 		 */
// 		function map(array, fn) {
// 			var length = array.length;
// 			var result = [];
// 			while (length--) {
// 				result[length] = fn(array[length]);
// 			}
// 			return result;
// 		}
	
// 		/**
// 		 * A simple `Array#map`-like wrapper to work with domain name strings or email
// 		 * addresses.
// 		 * @private
// 		 * @param {String} domain The domain name or email address.
// 		 * @param {Function} callback The function that gets called for every
// 		 * character.
// 		 * @returns {Array} A new string of characters returned by the callback
// 		 * function.
// 		 */
// 		function mapDomain(string, fn) {
// 			var parts = string.split('@');
// 			var result = '';
// 			if (parts.length > 1) {
// 				// In email addresses, only the domain name should be punycoded. Leave
// 				// the local part (i.e. everything up to `@`) intact.
// 				result = parts[0] + '@';
// 				string = parts[1];
// 			}
// 			// Avoid `split(regex)` for IE8 compatibility. See #17.
// 			string = string.replace(regexSeparators, '\x2E');
// 			var labels = string.split('.');
// 			var encoded = map(labels, fn).join('.');
// 			return result + encoded;
// 		}
	
// 		/**
// 		 * Creates an array containing the numeric code points of each Unicode
// 		 * character in the string. While JavaScript uses UCS-2 internally,
// 		 * this function will convert a pair of surrogate halves (each of which
// 		 * UCS-2 exposes as separate characters) into a single code point,
// 		 * matching UTF-16.
// 		 * @see `punycode.ucs2.encode`
// 		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
// 		 * @memberOf punycode.ucs2
// 		 * @name decode
// 		 * @param {String} string The Unicode input string (UCS-2).
// 		 * @returns {Array} The new array of code points.
// 		 */
// 		function ucs2decode(string) {
// 			var output = [],
// 					counter = 0,
// 					length = string.length,
// 					value,
// 					extra;
// 			while (counter < length) {
// 				value = string.charCodeAt(counter++);
// 				if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
// 					// high surrogate, and there is a next character
// 					extra = string.charCodeAt(counter++);
// 					if ((extra & 0xFC00) == 0xDC00) { // low surrogate
// 						output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
// 					} else {
// 						// unmatched surrogate; only append this code unit, in case the next
// 						// code unit is the high surrogate of a surrogate pair
// 						output.push(value);
// 						counter--;
// 					}
// 				} else {
// 					output.push(value);
// 				}
// 			}
// 			return output;
// 		}
	
// 		/**
// 		 * Creates a string based on an array of numeric code points.
// 		 * @see `punycode.ucs2.decode`
// 		 * @memberOf punycode.ucs2
// 		 * @name encode
// 		 * @param {Array} codePoints The array of numeric code points.
// 		 * @returns {String} The new Unicode string (UCS-2).
// 		 */
// 		function ucs2encode(array) {
// 			return map(array, function(value) {
// 				var output = '';
// 				if (value > 0xFFFF) {
// 					value -= 0x10000;
// 					output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
// 					value = 0xDC00 | value & 0x3FF;
// 				}
// 				output += stringFromCharCode(value);
// 				return output;
// 			}).join('');
// 		}
	
// 		/**
// 		 * Converts a basic code point into a digit/integer.
// 		 * @see `digitToBasic()`
// 		 * @private
// 		 * @param {Number} codePoint The basic numeric code point value.
// 		 * @returns {Number} The numeric value of a basic code point (for use in
// 		 * representing integers) in the range `0` to `base - 1`, or `base` if
// 		 * the code point does not represent a value.
// 		 */
// 		function basicToDigit(codePoint) {
// 			if (codePoint - 48 < 10) {
// 				return codePoint - 22;
// 			}
// 			if (codePoint - 65 < 26) {
// 				return codePoint - 65;
// 			}
// 			if (codePoint - 97 < 26) {
// 				return codePoint - 97;
// 			}
// 			return base;
// 		}
	
// 		/**
// 		 * Converts a digit/integer into a basic code point.
// 		 * @see `basicToDigit()`
// 		 * @private
// 		 * @param {Number} digit The numeric value of a basic code point.
// 		 * @returns {Number} The basic code point whose value (when used for
// 		 * representing integers) is `digit`, which needs to be in the range
// 		 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
// 		 * used; else, the lowercase form is used. The behavior is undefined
// 		 * if `flag` is non-zero and `digit` has no uppercase form.
// 		 */
// 		function digitToBasic(digit, flag) {
// 			//  0..25 map to ASCII a..z or A..Z
// 			// 26..35 map to ASCII 0..9
// 			return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
// 		}
	
// 		/**
// 		 * Bias adaptation function as per section 3.4 of RFC 3492.
// 		 * https://tools.ietf.org/html/rfc3492#section-3.4
// 		 * @private
// 		 */
// 		function adapt(delta, numPoints, firstTime) {
// 			var k = 0;
// 			delta = firstTime ? floor(delta / damp) : delta >> 1;
// 			delta += floor(delta / numPoints);
// 			for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
// 				delta = floor(delta / baseMinusTMin);
// 			}
// 			return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
// 		}
	
// 		/**
// 		 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
// 		 * symbols.
// 		 * @memberOf punycode
// 		 * @param {String} input The Punycode string of ASCII-only symbols.
// 		 * @returns {String} The resulting string of Unicode symbols.
// 		 */
// 		function decode(input) {
// 			// Don't use UCS-2
// 			var output = [],
// 					inputLength = input.length,
// 					out,
// 					i = 0,
// 					n = initialN,
// 					bias = initialBias,
// 					basic,
// 					j,
// 					index,
// 					oldi,
// 					w,
// 					k,
// 					digit,
// 					t,
// 					/** Cached calculation results */
// 					baseMinusT;
	
// 			// Handle the basic code points: let `basic` be the number of input code
// 			// points before the last delimiter, or `0` if there is none, then copy
// 			// the first basic code points to the output.
	
// 			basic = input.lastIndexOf(delimiter);
// 			if (basic < 0) {
// 				basic = 0;
// 			}
	
// 			for (j = 0; j < basic; ++j) {
// 				// if it's not a basic code point
// 				if (input.charCodeAt(j) >= 0x80) {
// 					error('not-basic');
// 				}
// 				output.push(input.charCodeAt(j));
// 			}
	
// 			// Main decoding loop: start just after the last delimiter if any basic code
// 			// points were copied; start at the beginning otherwise.
	
// 			for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {
	
// 				// `index` is the index of the next character to be consumed.
// 				// Decode a generalized variable-length integer into `delta`,
// 				// which gets added to `i`. The overflow checking is easier
// 				// if we increase `i` as we go, then subtract off its starting
// 				// value at the end to obtain `delta`.
// 				for (oldi = i, w = 1, k = base; /* no condition */; k += base) {
	
// 					if (index >= inputLength) {
// 						error('invalid-input');
// 					}
	
// 					digit = basicToDigit(input.charCodeAt(index++));
	
// 					if (digit >= base || digit > floor((maxInt - i) / w)) {
// 						error('overflow');
// 					}
	
// 					i += digit * w;
// 					t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
	
// 					if (digit < t) {
// 						break;
// 					}
	
// 					baseMinusT = base - t;
// 					if (w > floor(maxInt / baseMinusT)) {
// 						error('overflow');
// 					}
	
// 					w *= baseMinusT;
	
// 				}
	
// 				out = output.length + 1;
// 				bias = adapt(i - oldi, out, oldi == 0);
	
// 				// `i` was supposed to wrap around from `out` to `0`,
// 				// incrementing `n` each time, so we'll fix that now:
// 				if (floor(i / out) > maxInt - n) {
// 					error('overflow');
// 				}
	
// 				n += floor(i / out);
// 				i %= out;
	
// 				// Insert `n` at position `i` of the output
// 				output.splice(i++, 0, n);
	
// 			}
	
// 			return ucs2encode(output);
// 		}
	
// 		/**
// 		 * Converts a string of Unicode symbols (e.g. a domain name label) to a
// 		 * Punycode string of ASCII-only symbols.
// 		 * @memberOf punycode
// 		 * @param {String} input The string of Unicode symbols.
// 		 * @returns {String} The resulting Punycode string of ASCII-only symbols.
// 		 */
// 		function encode(input) {
// 			var n,
// 					delta,
// 					handledCPCount,
// 					basicLength,
// 					bias,
// 					j,
// 					m,
// 					q,
// 					k,
// 					t,
// 					currentValue,
// 					output = [],
// 					/** `inputLength` will hold the number of code points in `input`. */
// 					inputLength,
// 					/** Cached calculation results */
// 					handledCPCountPlusOne,
// 					baseMinusT,
// 					qMinusT;
	
// 			// Convert the input in UCS-2 to Unicode
// 			input = ucs2decode(input);
	
// 			// Cache the length
// 			inputLength = input.length;
	
// 			// Initialize the state
// 			n = initialN;
// 			delta = 0;
// 			bias = initialBias;
	
// 			// Handle the basic code points
// 			for (j = 0; j < inputLength; ++j) {
// 				currentValue = input[j];
// 				if (currentValue < 0x80) {
// 					output.push(stringFromCharCode(currentValue));
// 				}
// 			}
	
// 			handledCPCount = basicLength = output.length;
	
// 			// `handledCPCount` is the number of code points that have been handled;
// 			// `basicLength` is the number of basic code points.
	
// 			// Finish the basic string - if it is not empty - with a delimiter
// 			if (basicLength) {
// 				output.push(delimiter);
// 			}
	
// 			// Main encoding loop:
// 			while (handledCPCount < inputLength) {
	
// 				// All non-basic code points < n have been handled already. Find the next
// 				// larger one:
// 				for (m = maxInt, j = 0; j < inputLength; ++j) {
// 					currentValue = input[j];
// 					if (currentValue >= n && currentValue < m) {
// 						m = currentValue;
// 					}
// 				}
	
// 				// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
// 				// but guard against overflow
// 				handledCPCountPlusOne = handledCPCount + 1;
// 				if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
// 					error('overflow');
// 				}
	
// 				delta += (m - n) * handledCPCountPlusOne;
// 				n = m;
	
// 				for (j = 0; j < inputLength; ++j) {
// 					currentValue = input[j];
	
// 					if (currentValue < n && ++delta > maxInt) {
// 						error('overflow');
// 					}
	
// 					if (currentValue == n) {
// 						// Represent delta as a generalized variable-length integer
// 						for (q = delta, k = base; /* no condition */; k += base) {
// 							t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
// 							if (q < t) {
// 								break;
// 							}
// 							qMinusT = q - t;
// 							baseMinusT = base - t;
// 							output.push(
// 								stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
// 							);
// 							q = floor(qMinusT / baseMinusT);
// 						}
	
// 						output.push(stringFromCharCode(digitToBasic(q, 0)));
// 						bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
// 						delta = 0;
// 						++handledCPCount;
// 					}
// 				}
	
// 				++delta;
// 				++n;
	
// 			}
// 			return output.join('');
// 		}
	
// 		/**
// 		 * Converts a Punycode string representing a domain name or an email address
// 		 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
// 		 * it doesn't matter if you call it on a string that has already been
// 		 * converted to Unicode.
// 		 * @memberOf punycode
// 		 * @param {String} input The Punycoded domain name or email address to
// 		 * convert to Unicode.
// 		 * @returns {String} The Unicode representation of the given Punycode
// 		 * string.
// 		 */
// 		function toUnicode(input) {
// 			return mapDomain(input, function(string) {
// 				return regexPunycode.test(string)
// 					? decode(string.slice(4).toLowerCase())
// 					: string;
// 			});
// 		}
	
// 		/**
// 		 * Converts a Unicode string representing a domain name or an email address to
// 		 * Punycode. Only the non-ASCII parts of the domain name will be converted,
// 		 * i.e. it doesn't matter if you call it with a domain that's already in
// 		 * ASCII.
// 		 * @memberOf punycode
// 		 * @param {String} input The domain name or email address to convert, as a
// 		 * Unicode string.
// 		 * @returns {String} The Punycode representation of the given domain name or
// 		 * email address.
// 		 */
// 		function toASCII(input) {
// 			return mapDomain(input, function(string) {
// 				return regexNonASCII.test(string)
// 					? 'xn--' + encode(string)
// 					: string;
// 			});
// 		}
	
// 		/*--------------------------------------------------------------------------*/
	
// 		/** Define the public API */
// 		punycode = {
// 			/**
// 			 * A string representing the current Punycode.js version number.
// 			 * @memberOf punycode
// 			 * @type String
// 			 */
// 			'version': '1.4.1',
// 			/**
// 			 * An object of methods to convert from JavaScript's internal character
// 			 * representation (UCS-2) to Unicode code points, and back.
// 			 * @see <https://mathiasbynens.be/notes/javascript-encoding>
// 			 * @memberOf punycode
// 			 * @type Object
// 			 */
// 			'ucs2': {
// 				'decode': ucs2decode,
// 				'encode': ucs2encode
// 			},
// 			'decode': decode,
// 			'encode': encode,
// 			'toASCII': toASCII,
// 			'toUnicode': toUnicode
// 		};
	
// 		/** Expose `punycode` */
// 		// Some AMD build optimizers, like r.js, check for specific condition patterns
// 		// like the following:
// 		if (
// 			typeof define == 'function' &&
// 			typeof define.amd == 'object' &&
// 			define.amd
// 		) {
// 			define('punycode', function() {
// 				return punycode;
// 			});
// 		} else if (freeExports && freeModule) {
// 			if (module.exports == freeExports) {
// 				// in Node.js, io.js, or RingoJS v0.8.0+
// 				freeModule.exports = punycode;
// 			} else {
// 				// in Narwhal or RingoJS v0.7.0-
// 				for (key in punycode) {
// 					punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
// 				}
// 			}
// 		} else {
// 			// in Rhino or a web browser
// 			root.punycode = punycode;
// 		}
	
// 	}(this));
	
// 	}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
// 	},{}],94:[function(require,module,exports){
// 	// Copyright Joyent, Inc. and other Node contributors.
// 	//
// 	// Permission is hereby granted, free of charge, to any person obtaining a
// 	// copy of this software and associated documentation files (the
// 	// "Software"), to deal in the Software without restriction, including
// 	// without limitation the rights to use, copy, modify, merge, publish,
// 	// distribute, sublicense, and/or sell copies of the Software, and to permit
// 	// persons to whom the Software is furnished to do so, subject to the
// 	// following conditions:
// 	//
// 	// The above copyright notice and this permission notice shall be included
// 	// in all copies or substantial portions of the Software.
// 	//
// 	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// 	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// 	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// 	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// 	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// 	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// 	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
// 	'use strict';
	
// 	// If obj.hasOwnProperty has been overridden, then calling
// 	// obj.hasOwnProperty(prop) will break.
// 	// See: https://github.com/joyent/node/issues/1707
// 	function hasOwnProperty(obj, prop) {
// 		return Object.prototype.hasOwnProperty.call(obj, prop);
// 	}
	
// 	module.exports = function(qs, sep, eq, options) {
// 		sep = sep || '&';
// 		eq = eq || '=';
// 		var obj = {};
	
// 		if (typeof qs !== 'string' || qs.length === 0) {
// 			return obj;
// 		}
	
// 		var regexp = /\+/g;
// 		qs = qs.split(sep);
	
// 		var maxKeys = 1000;
// 		if (options && typeof options.maxKeys === 'number') {
// 			maxKeys = options.maxKeys;
// 		}
	
// 		var len = qs.length;
// 		// maxKeys <= 0 means that we should not limit keys count
// 		if (maxKeys > 0 && len > maxKeys) {
// 			len = maxKeys;
// 		}
	
// 		for (var i = 0; i < len; ++i) {
// 			var x = qs[i].replace(regexp, '%20'),
// 					idx = x.indexOf(eq),
// 					kstr, vstr, k, v;
	
// 			if (idx >= 0) {
// 				kstr = x.substr(0, idx);
// 				vstr = x.substr(idx + 1);
// 			} else {
// 				kstr = x;
// 				vstr = '';
// 			}
	
// 			k = decodeURIComponent(kstr);
// 			v = decodeURIComponent(vstr);
	
// 			if (!hasOwnProperty(obj, k)) {
// 				obj[k] = v;
// 			} else if (isArray(obj[k])) {
// 				obj[k].push(v);
// 			} else {
// 				obj[k] = [obj[k], v];
// 			}
// 		}
	
// 		return obj;
// 	};
	
// 	var isArray = Array.isArray || function (xs) {
// 		return Object.prototype.toString.call(xs) === '[object Array]';
// 	};
	
// 	},{}],95:[function(require,module,exports){
// 	// Copyright Joyent, Inc. and other Node contributors.
// 	//
// 	// Permission is hereby granted, free of charge, to any person obtaining a
// 	// copy of this software and associated documentation files (the
// 	// "Software"), to deal in the Software without restriction, including
// 	// without limitation the rights to use, copy, modify, merge, publish,
// 	// distribute, sublicense, and/or sell copies of the Software, and to permit
// 	// persons to whom the Software is furnished to do so, subject to the
// 	// following conditions:
// 	//
// 	// The above copyright notice and this permission notice shall be included
// 	// in all copies or substantial portions of the Software.
// 	//
// 	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// 	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// 	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// 	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// 	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// 	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// 	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
// 	'use strict';
	
// 	var stringifyPrimitive = function(v) {
// 		switch (typeof v) {
// 			case 'string':
// 				return v;
	
// 			case 'boolean':
// 				return v ? 'true' : 'false';
	
// 			case 'number':
// 				return isFinite(v) ? v : '';
	
// 			default:
// 				return '';
// 		}
// 	};
	
// 	module.exports = function(obj, sep, eq, name) {
// 		sep = sep || '&';
// 		eq = eq || '=';
// 		if (obj === null) {
// 			obj = undefined;
// 		}
	
// 		if (typeof obj === 'object') {
// 			return map(objectKeys(obj), function(k) {
// 				var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
// 				if (isArray(obj[k])) {
// 					return map(obj[k], function(v) {
// 						return ks + encodeURIComponent(stringifyPrimitive(v));
// 					}).join(sep);
// 				} else {
// 					return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
// 				}
// 			}).join(sep);
	
// 		}
	
// 		if (!name) return '';
// 		return encodeURIComponent(stringifyPrimitive(name)) + eq +
// 					 encodeURIComponent(stringifyPrimitive(obj));
// 	};
	
// 	var isArray = Array.isArray || function (xs) {
// 		return Object.prototype.toString.call(xs) === '[object Array]';
// 	};
	
// 	function map (xs, f) {
// 		if (xs.map) return xs.map(f);
// 		var res = [];
// 		for (var i = 0; i < xs.length; i++) {
// 			res.push(f(xs[i], i));
// 		}
// 		return res;
// 	}
	
// 	var objectKeys = Object.keys || function (obj) {
// 		var res = [];
// 		for (var key in obj) {
// 			if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
// 		}
// 		return res;
// 	};
	
// 	},{}],96:[function(require,module,exports){
// 	'use strict';
	
// 	exports.decode = exports.parse = require('./decode');
// 	exports.encode = exports.stringify = require('./encode');
	
// 	},{"./decode":94,"./encode":95}],97:[function(require,module,exports){
// 	module.exports = require('./lib/_stream_duplex.js');
	
// 	},{"./lib/_stream_duplex.js":98}],98:[function(require,module,exports){
// 	// Copyright Joyent, Inc. and other Node contributors.
// 	//
// 	// Permission is hereby granted, free of charge, to any person obtaining a
// 	// copy of this software and associated documentation files (the
// 	// "Software"), to deal in the Software without restriction, including
// 	// without limitation the rights to use, copy, modify, merge, publish,
// 	// distribute, sublicense, and/or sell copies of the Software, and to permit
// 	// persons to whom the Software is furnished to do so, subject to the
// 	// following conditions:
// 	//
// 	// The above copyright notice and this permission notice shall be included
// 	// in all copies or substantial portions of the Software.
// 	//
// 	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// 	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// 	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// 	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// 	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// 	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// 	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
// 	// a duplex stream is just a stream that is both readable and writable.
// 	// Since JS doesn't have multiple prototypal inheritance, this class
// 	// prototypally inherits from Readable, and then parasitically from
// 	// Writable.
	
// 	'use strict';
	
// 	/*<replacement>*/
	
// 	var pna = require('process-nextick-args');
// 	/*</replacement>*/
	
// 	/*<replacement>*/
// 	var objectKeys = Object.keys || function (obj) {
// 		var keys = [];
// 		for (var key in obj) {
// 			keys.push(key);
// 		}return keys;
// 	};
// 	/*</replacement>*/
	
// 	module.exports = Duplex;
	
// 	/*<replacement>*/
// 	var util = require('core-util-is');
// 	util.inherits = require('inherits');
// 	/*</replacement>*/
	
// 	var Readable = require('./_stream_readable');
// 	var Writable = require('./_stream_writable');
	
// 	util.inherits(Duplex, Readable);
	
// 	{
// 		// avoid scope creep, the keys array can then be collected
// 		var keys = objectKeys(Writable.prototype);
// 		for (var v = 0; v < keys.length; v++) {
// 			var method = keys[v];
// 			if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
// 		}
// 	}
	
// 	function Duplex(options) {
// 		if (!(this instanceof Duplex)) return new Duplex(options);
	
// 		Readable.call(this, options);
// 		Writable.call(this, options);
	
// 		if (options && options.readable === false) this.readable = false;
	
// 		if (options && options.writable === false) this.writable = false;
	
// 		this.allowHalfOpen = true;
// 		if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;
	
// 		this.once('end', onend);
// 	}
	
// 	Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
// 		// making it explicit this property is not enumerable
// 		// because otherwise some prototype manipulation in
// 		// userland will fail
// 		enumerable: false,
// 		get: function () {
// 			return this._writableState.highWaterMark;
// 		}
// 	});
	
// 	// the no-half-open enforcer
// 	function onend() {
// 		// if we allow half-open state, or if the writable side ended,
// 		// then we're ok.
// 		if (this.allowHalfOpen || this._writableState.ended) return;
	
// 		// no more data can be written.
// 		// But allow more writes to happen in this tick.
// 		pna.nextTick(onEndNT, this);
// 	}
	
// 	function onEndNT(self) {
// 		self.end();
// 	}
	
// 	Object.defineProperty(Duplex.prototype, 'destroyed', {
// 		get: function () {
// 			if (this._readableState === undefined || this._writableState === undefined) {
// 				return false;
// 			}
// 			return this._readableState.destroyed && this._writableState.destroyed;
// 		},
// 		set: function (value) {
// 			// we ignore the value if the stream
// 			// has not been initialized yet
// 			if (this._readableState === undefined || this._writableState === undefined) {
// 				return;
// 			}
	
// 			// backward compatibility, the user is explicitly
// 			// managing destroyed
// 			this._readableState.destroyed = value;
// 			this._writableState.destroyed = value;
// 		}
// 	});
	
// 	Duplex.prototype._destroy = function (err, cb) {
// 		this.push(null);
// 		this.end();
	
// 		pna.nextTick(cb, err);
// 	};
// 	},{"./_stream_readable":100,"./_stream_writable":102,"core-util-is":14,"inherits":80,"process-nextick-args":91}],99:[function(require,module,exports){
// 	// Copyright Joyent, Inc. and other Node contributors.
// 	//
// 	// Permission is hereby granted, free of charge, to any person obtaining a
// 	// copy of this software and associated documentation files (the
// 	// "Software"), to deal in the Software without restriction, including
// 	// without limitation the rights to use, copy, modify, merge, publish,
// 	// distribute, sublicense, and/or sell copies of the Software, and to permit
// 	// persons to whom the Software is furnished to do so, subject to the
// 	// following conditions:
// 	//
// 	// The above copyright notice and this permission notice shall be included
// 	// in all copies or substantial portions of the Software.
// 	//
// 	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// 	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// 	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// 	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// 	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// 	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// 	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
// 	// a passthrough stream.
// 	// basically just the most minimal sort of Transform stream.
// 	// Every written chunk gets output as-is.
	
// 	'use strict';
	
// 	module.exports = PassThrough;
	
// 	var Transform = require('./_stream_transform');
	
// 	/*<replacement>*/
// 	var util = require('core-util-is');
// 	util.inherits = require('inherits');
// 	/*</replacement>*/
	
// 	util.inherits(PassThrough, Transform);
	
// 	function PassThrough(options) {
// 		if (!(this instanceof PassThrough)) return new PassThrough(options);
	
// 		Transform.call(this, options);
// 	}
	
// 	PassThrough.prototype._transform = function (chunk, encoding, cb) {
// 		cb(null, chunk);
// 	};
// 	},{"./_stream_transform":101,"core-util-is":14,"inherits":80}],100:[function(require,module,exports){
// 	(function (process,global){
// 	// Copyright Joyent, Inc. and other Node contributors.
// 	//
// 	// Permission is hereby granted, free of charge, to any person obtaining a
// 	// copy of this software and associated documentation files (the
// 	// "Software"), to deal in the Software without restriction, including
// 	// without limitation the rights to use, copy, modify, merge, publish,
// 	// distribute, sublicense, and/or sell copies of the Software, and to permit
// 	// persons to whom the Software is furnished to do so, subject to the
// 	// following conditions:
// 	//
// 	// The above copyright notice and this permission notice shall be included
// 	// in all copies or substantial portions of the Software.
// 	//
// 	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// 	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// 	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// 	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// 	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// 	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// 	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
// 	'use strict';
	
// 	/*<replacement>*/
	
// 	var pna = require('process-nextick-args');
// 	/*</replacement>*/
	
// 	module.exports = Readable;
	
// 	/*<replacement>*/
// 	var isArray = require('isarray');
// 	/*</replacement>*/
	
// 	/*<replacement>*/
// 	var Duplex;
// 	/*</replacement>*/
	
// 	Readable.ReadableState = ReadableState;
	
// 	/*<replacement>*/
// 	var EE = require('events').EventEmitter;
	
// 	var EElistenerCount = function (emitter, type) {
// 		return emitter.listeners(type).length;
// 	};
// 	/*</replacement>*/
	
// 	/*<replacement>*/
// 	var Stream = require('./internal/streams/stream');
// 	/*</replacement>*/
	
// 	/*<replacement>*/
	
// 	var Buffer = require('safe-buffer').Buffer;
// 	var OurUint8Array = global.Uint8Array || function () {};
// 	function _uint8ArrayToBuffer(chunk) {
// 		return Buffer.from(chunk);
// 	}
// 	function _isUint8Array(obj) {
// 		return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
// 	}
	
// 	/*</replacement>*/
	
// 	/*<replacement>*/
// 	var util = require('core-util-is');
// 	util.inherits = require('inherits');
// 	/*</replacement>*/
	
// 	/*<replacement>*/
// 	var debugUtil = require('util');
// 	var debug = void 0;
// 	if (debugUtil && debugUtil.debuglog) {
// 		debug = debugUtil.debuglog('stream');
// 	} else {
// 		debug = function () {};
// 	}
// 	/*</replacement>*/
	
// 	var BufferList = require('./internal/streams/BufferList');
// 	var destroyImpl = require('./internal/streams/destroy');
// 	var StringDecoder;
	
// 	util.inherits(Readable, Stream);
	
// 	var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];
	
// 	function prependListener(emitter, event, fn) {
// 		// Sadly this is not cacheable as some libraries bundle their own
// 		// event emitter implementation with them.
// 		if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);
	
// 		// This is a hack to make sure that our error handler is attached before any
// 		// userland ones.  NEVER DO THIS. This is here only because this code needs
// 		// to continue to work with older versions of Node.js that do not include
// 		// the prependListener() method. The goal is to eventually remove this hack.
// 		if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
// 	}
	
// 	function ReadableState(options, stream) {
// 		Duplex = Duplex || require('./_stream_duplex');
	
// 		options = options || {};
	
// 		// Duplex streams are both readable and writable, but share
// 		// the same options object.
// 		// However, some cases require setting options to different
// 		// values for the readable and the writable sides of the duplex stream.
// 		// These options can be provided separately as readableXXX and writableXXX.
// 		var isDuplex = stream instanceof Duplex;
	
// 		// object stream flag. Used to make read(n) ignore n and to
// 		// make all the buffer merging and length checks go away
// 		this.objectMode = !!options.objectMode;
	
// 		if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;
	
// 		// the point at which it stops calling _read() to fill the buffer
// 		// Note: 0 is a valid value, means "don't call _read preemptively ever"
// 		var hwm = options.highWaterMark;
// 		var readableHwm = options.readableHighWaterMark;
// 		var defaultHwm = this.objectMode ? 16 : 16 * 1024;
	
// 		if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;else this.highWaterMark = defaultHwm;
	
// 		// cast to ints.
// 		this.highWaterMark = Math.floor(this.highWaterMark);
	
// 		// A linked list is used to store data chunks instead of an array because the
// 		// linked list can remove elements from the beginning faster than
// 		// array.shift()
// 		this.buffer = new BufferList();
// 		this.length = 0;
// 		this.pipes = null;
// 		this.pipesCount = 0;
// 		this.flowing = null;
// 		this.ended = false;
// 		this.endEmitted = false;
// 		this.reading = false;
	
// 		// a flag to be able to tell if the event 'readable'/'data' is emitted
// 		// immediately, or on a later tick.  We set this to true at first, because
// 		// any actions that shouldn't happen until "later" should generally also
// 		// not happen before the first read call.
// 		this.sync = true;
	
// 		// whenever we return null, then we set a flag to say
// 		// that we're awaiting a 'readable' event emission.
// 		this.needReadable = false;
// 		this.emittedReadable = false;
// 		this.readableListening = false;
// 		this.resumeScheduled = false;
	
// 		// has it been destroyed
// 		this.destroyed = false;
	
// 		// Crypto is kind of old and crusty.  Historically, its default string
// 		// encoding is 'binary' so we have to make this configurable.
// 		// Everything else in the universe uses 'utf8', though.
// 		this.defaultEncoding = options.defaultEncoding || 'utf8';
	
// 		// the number of writers that are awaiting a drain event in .pipe()s
// 		this.awaitDrain = 0;
	
// 		// if true, a maybeReadMore has been scheduled
// 		this.readingMore = false;
	
// 		this.decoder = null;
// 		this.encoding = null;
// 		if (options.encoding) {
// 			if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
// 			this.decoder = new StringDecoder(options.encoding);
// 			this.encoding = options.encoding;
// 		}
// 	}
	
// 	function Readable(options) {
// 		Duplex = Duplex || require('./_stream_duplex');
	
// 		if (!(this instanceof Readable)) return new Readable(options);
	
// 		this._readableState = new ReadableState(options, this);
	
// 		// legacy
// 		this.readable = true;
	
// 		if (options) {
// 			if (typeof options.read === 'function') this._read = options.read;
	
// 			if (typeof options.destroy === 'function') this._destroy = options.destroy;
// 		}
	
// 		Stream.call(this);
// 	}
	
// 	Object.defineProperty(Readable.prototype, 'destroyed', {
// 		get: function () {
// 			if (this._readableState === undefined) {
// 				return false;
// 			}
// 			return this._readableState.destroyed;
// 		},
// 		set: function (value) {
// 			// we ignore the value if the stream
// 			// has not been initialized yet
// 			if (!this._readableState) {
// 				return;
// 			}
	
// 			// backward compatibility, the user is explicitly
// 			// managing destroyed
// 			this._readableState.destroyed = value;
// 		}
// 	});
	
// 	Readable.prototype.destroy = destroyImpl.destroy;
// 	Readable.prototype._undestroy = destroyImpl.undestroy;
// 	Readable.prototype._destroy = function (err, cb) {
// 		this.push(null);
// 		cb(err);
// 	};
	
// 	// Manually shove something into the read() buffer.
// 	// This returns true if the highWaterMark has not been hit yet,
// 	// similar to how Writable.write() returns true if you should
// 	// write() some more.
// 	Readable.prototype.push = function (chunk, encoding) {
// 		var state = this._readableState;
// 		var skipChunkCheck;
	
// 		if (!state.objectMode) {
// 			if (typeof chunk === 'string') {
// 				encoding = encoding || state.defaultEncoding;
// 				if (encoding !== state.encoding) {
// 					chunk = Buffer.from(chunk, encoding);
// 					encoding = '';
// 				}
// 				skipChunkCheck = true;
// 			}
// 		} else {
// 			skipChunkCheck = true;
// 		}
	
// 		return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
// 	};
	
// 	// Unshift should *always* be something directly out of read()
// 	Readable.prototype.unshift = function (chunk) {
// 		return readableAddChunk(this, chunk, null, true, false);
// 	};
	
// 	function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
// 		var state = stream._readableState;
// 		if (chunk === null) {
// 			state.reading = false;
// 			onEofChunk(stream, state);
// 		} else {
// 			var er;
// 			if (!skipChunkCheck) er = chunkInvalid(state, chunk);
// 			if (er) {
// 				stream.emit('error', er);
// 			} else if (state.objectMode || chunk && chunk.length > 0) {
// 				if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
// 					chunk = _uint8ArrayToBuffer(chunk);
// 				}
	
// 				if (addToFront) {
// 					if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream, state, chunk, true);
// 				} else if (state.ended) {
// 					stream.emit('error', new Error('stream.push() after EOF'));
// 				} else {
// 					state.reading = false;
// 					if (state.decoder && !encoding) {
// 						chunk = state.decoder.write(chunk);
// 						if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
// 					} else {
// 						addChunk(stream, state, chunk, false);
// 					}
// 				}
// 			} else if (!addToFront) {
// 				state.reading = false;
// 			}
// 		}
	
// 		return needMoreData(state);
// 	}
	
// 	function addChunk(stream, state, chunk, addToFront) {
// 		if (state.flowing && state.length === 0 && !state.sync) {
// 			stream.emit('data', chunk);
// 			stream.read(0);
// 		} else {
// 			// update the buffer info.
// 			state.length += state.objectMode ? 1 : chunk.length;
// 			if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);
	
// 			if (state.needReadable) emitReadable(stream);
// 		}
// 		maybeReadMore(stream, state);
// 	}
	
// 	function chunkInvalid(state, chunk) {
// 		var er;
// 		if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
// 			er = new TypeError('Invalid non-string/buffer chunk');
// 		}
// 		return er;
// 	}
	
// 	// if it's past the high water mark, we can push in some more.
// 	// Also, if we have no data yet, we can stand some
// 	// more bytes.  This is to work around cases where hwm=0,
// 	// such as the repl.  Also, if the push() triggered a
// 	// readable event, and the user called read(largeNumber) such that
// 	// needReadable was set, then we ought to push more, so that another
// 	// 'readable' event will be triggered.
// 	function needMoreData(state) {
// 		return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
// 	}
	
// 	Readable.prototype.isPaused = function () {
// 		return this._readableState.flowing === false;
// 	};
	
// 	// backwards compatibility.
// 	Readable.prototype.setEncoding = function (enc) {
// 		if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
// 		this._readableState.decoder = new StringDecoder(enc);
// 		this._readableState.encoding = enc;
// 		return this;
// 	};
	
// 	// Don't raise the hwm > 8MB
// 	var MAX_HWM = 0x800000;
// 	function computeNewHighWaterMark(n) {
// 		if (n >= MAX_HWM) {
// 			n = MAX_HWM;
// 		} else {
// 			// Get the next highest power of 2 to prevent increasing hwm excessively in
// 			// tiny amounts
// 			n--;
// 			n |= n >>> 1;
// 			n |= n >>> 2;
// 			n |= n >>> 4;
// 			n |= n >>> 8;
// 			n |= n >>> 16;
// 			n++;
// 		}
// 		return n;
// 	}
	
// 	// This function is designed to be inlinable, so please take care when making
// 	// changes to the function body.
// 	function howMuchToRead(n, state) {
// 		if (n <= 0 || state.length === 0 && state.ended) return 0;
// 		if (state.objectMode) return 1;
// 		if (n !== n) {
// 			// Only flow one buffer at a time
// 			if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
// 		}
// 		// If we're asking for more than the current hwm, then raise the hwm.
// 		if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
// 		if (n <= state.length) return n;
// 		// Don't have enough
// 		if (!state.ended) {
// 			state.needReadable = true;
// 			return 0;
// 		}
// 		return state.length;
// 	}
	
// 	// you can override either this method, or the async _read(n) below.
// 	Readable.prototype.read = function (n) {
// 		debug('read', n);
// 		n = parseInt(n, 10);
// 		var state = this._readableState;
// 		var nOrig = n;
	
// 		if (n !== 0) state.emittedReadable = false;
	
// 		// if we're doing read(0) to trigger a readable event, but we
// 		// already have a bunch of data in the buffer, then just trigger
// 		// the 'readable' event and move on.
// 		if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
// 			debug('read: emitReadable', state.length, state.ended);
// 			if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
// 			return null;
// 		}
	
// 		n = howMuchToRead(n, state);
	
// 		// if we've ended, and we're now clear, then finish it up.
// 		if (n === 0 && state.ended) {
// 			if (state.length === 0) endReadable(this);
// 			return null;
// 		}
	
// 		// All the actual chunk generation logic needs to be
// 		// *below* the call to _read.  The reason is that in certain
// 		// synthetic stream cases, such as passthrough streams, _read
// 		// may be a completely synchronous operation which may change
// 		// the state of the read buffer, providing enough data when
// 		// before there was *not* enough.
// 		//
// 		// So, the steps are:
// 		// 1. Figure out what the state of things will be after we do
// 		// a read from the buffer.
// 		//
// 		// 2. If that resulting state will trigger a _read, then call _read.
// 		// Note that this may be asynchronous, or synchronous.  Yes, it is
// 		// deeply ugly to write APIs this way, but that still doesn't mean
// 		// that the Readable class should behave improperly, as streams are
// 		// designed to be sync/async agnostic.
// 		// Take note if the _read call is sync or async (ie, if the read call
// 		// has returned yet), so that we know whether or not it's safe to emit
// 		// 'readable' etc.
// 		//
// 		// 3. Actually pull the requested chunks out of the buffer and return.
	
// 		// if we need a readable event, then we need to do some reading.
// 		var doRead = state.needReadable;
// 		debug('need readable', doRead);
	
// 		// if we currently have less than the highWaterMark, then also read some
// 		if (state.length === 0 || state.length - n < state.highWaterMark) {
// 			doRead = true;
// 			debug('length less than watermark', doRead);
// 		}
	
// 		// however, if we've ended, then there's no point, and if we're already
// 		// reading, then it's unnecessary.
// 		if (state.ended || state.reading) {
// 			doRead = false;
// 			debug('reading or ended', doRead);
// 		} else if (doRead) {
// 			debug('do read');
// 			state.reading = true;
// 			state.sync = true;
// 			// if the length is currently zero, then we *need* a readable event.
// 			if (state.length === 0) state.needReadable = true;
// 			// call internal read method
// 			this._read(state.highWaterMark);
// 			state.sync = false;
// 			// If _read pushed data synchronously, then `reading` will be false,
// 			// and we need to re-evaluate how much data we can return to the user.
// 			if (!state.reading) n = howMuchToRead(nOrig, state);
// 		}
	
// 		var ret;
// 		if (n > 0) ret = fromList(n, state);else ret = null;
	
// 		if (ret === null) {
// 			state.needReadable = true;
// 			n = 0;
// 		} else {
// 			state.length -= n;
// 		}
	
// 		if (state.length === 0) {
// 			// If we have nothing in the buffer, then we want to know
// 			// as soon as we *do* get something into the buffer.
// 			if (!state.ended) state.needReadable = true;
	
// 			// If we tried to read() past the EOF, then emit end on the next tick.
// 			if (nOrig !== n && state.ended) endReadable(this);
// 		}
	
// 		if (ret !== null) this.emit('data', ret);
	
// 		return ret;
// 	};
	
// 	function onEofChunk(stream, state) {
// 		if (state.ended) return;
// 		if (state.decoder) {
// 			var chunk = state.decoder.end();
// 			if (chunk && chunk.length) {
// 				state.buffer.push(chunk);
// 				state.length += state.objectMode ? 1 : chunk.length;
// 			}
// 		}
// 		state.ended = true;
	
// 		// emit 'readable' now to make sure it gets picked up.
// 		emitReadable(stream);
// 	}
	
// 	// Don't emit readable right away in sync mode, because this can trigger
// 	// another read() call => stack overflow.  This way, it might trigger
// 	// a nextTick recursion warning, but that's not so bad.
// 	function emitReadable(stream) {
// 		var state = stream._readableState;
// 		state.needReadable = false;
// 		if (!state.emittedReadable) {
// 			debug('emitReadable', state.flowing);
// 			state.emittedReadable = true;
// 			if (state.sync) pna.nextTick(emitReadable_, stream);else emitReadable_(stream);
// 		}
// 	}
	
// 	function emitReadable_(stream) {
// 		debug('emit readable');
// 		stream.emit('readable');
// 		flow(stream);
// 	}
	
// 	// at this point, the user has presumably seen the 'readable' event,
// 	// and called read() to consume some data.  that may have triggered
// 	// in turn another _read(n) call, in which case reading = true if
// 	// it's in progress.
// 	// However, if we're not ended, or reading, and the length < hwm,
// 	// then go ahead and try to read some more preemptively.
// 	function maybeReadMore(stream, state) {
// 		if (!state.readingMore) {
// 			state.readingMore = true;
// 			pna.nextTick(maybeReadMore_, stream, state);
// 		}
// 	}
	
// 	function maybeReadMore_(stream, state) {
// 		var len = state.length;
// 		while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
// 			debug('maybeReadMore read 0');
// 			stream.read(0);
// 			if (len === state.length)
// 				// didn't get any data, stop spinning.
// 				break;else len = state.length;
// 		}
// 		state.readingMore = false;
// 	}
	
// 	// abstract method.  to be overridden in specific implementation classes.
// 	// call cb(er, data) where data is <= n in length.
// 	// for virtual (non-string, non-buffer) streams, "length" is somewhat
// 	// arbitrary, and perhaps not very meaningful.
// 	Readable.prototype._read = function (n) {
// 		this.emit('error', new Error('_read() is not implemented'));
// 	};
	
// 	Readable.prototype.pipe = function (dest, pipeOpts) {
// 		var src = this;
// 		var state = this._readableState;
	
// 		switch (state.pipesCount) {
// 			case 0:
// 				state.pipes = dest;
// 				break;
// 			case 1:
// 				state.pipes = [state.pipes, dest];
// 				break;
// 			default:
// 				state.pipes.push(dest);
// 				break;
// 		}
// 		state.pipesCount += 1;
// 		debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);
	
// 		var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
	
// 		var endFn = doEnd ? onend : unpipe;
// 		if (state.endEmitted) pna.nextTick(endFn);else src.once('end', endFn);
	
// 		dest.on('unpipe', onunpipe);
// 		function onunpipe(readable, unpipeInfo) {
// 			debug('onunpipe');
// 			if (readable === src) {
// 				if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
// 					unpipeInfo.hasUnpiped = true;
// 					cleanup();
// 				}
// 			}
// 		}
	
// 		function onend() {
// 			debug('onend');
// 			dest.end();
// 		}
	
// 		// when the dest drains, it reduces the awaitDrain counter
// 		// on the source.  This would be more elegant with a .once()
// 		// handler in flow(), but adding and removing repeatedly is
// 		// too slow.
// 		var ondrain = pipeOnDrain(src);
// 		dest.on('drain', ondrain);
	
// 		var cleanedUp = false;
// 		function cleanup() {
// 			debug('cleanup');
// 			// cleanup event handlers once the pipe is broken
// 			dest.removeListener('close', onclose);
// 			dest.removeListener('finish', onfinish);
// 			dest.removeListener('drain', ondrain);
// 			dest.removeListener('error', onerror);
// 			dest.removeListener('unpipe', onunpipe);
// 			src.removeListener('end', onend);
// 			src.removeListener('end', unpipe);
// 			src.removeListener('data', ondata);
	
// 			cleanedUp = true;
	
// 			// if the reader is waiting for a drain event from this
// 			// specific writer, then it would cause it to never start
// 			// flowing again.
// 			// So, if this is awaiting a drain, then we just call it now.
// 			// If we don't know, then assume that we are waiting for one.
// 			if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
// 		}
	
// 		// If the user pushes more data while we're writing to dest then we'll end up
// 		// in ondata again. However, we only want to increase awaitDrain once because
// 		// dest will only emit one 'drain' event for the multiple writes.
// 		// => Introduce a guard on increasing awaitDrain.
// 		var increasedAwaitDrain = false;
// 		src.on('data', ondata);
// 		function ondata(chunk) {
// 			debug('ondata');
// 			increasedAwaitDrain = false;
// 			var ret = dest.write(chunk);
// 			if (false === ret && !increasedAwaitDrain) {
// 				// If the user unpiped during `dest.write()`, it is possible
// 				// to get stuck in a permanently paused state if that write
// 				// also returned false.
// 				// => Check whether `dest` is still a piping destination.
// 				if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
// 					debug('false write response, pause', src._readableState.awaitDrain);
// 					src._readableState.awaitDrain++;
// 					increasedAwaitDrain = true;
// 				}
// 				src.pause();
// 			}
// 		}
	
// 		// if the dest has an error, then stop piping into it.
// 		// however, don't suppress the throwing behavior for this.
// 		function onerror(er) {
// 			debug('onerror', er);
// 			unpipe();
// 			dest.removeListener('error', onerror);
// 			if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
// 		}
	
// 		// Make sure our error handler is attached before userland ones.
// 		prependListener(dest, 'error', onerror);
	
// 		// Both close and finish should trigger unpipe, but only once.
// 		function onclose() {
// 			dest.removeListener('finish', onfinish);
// 			unpipe();
// 		}
// 		dest.once('close', onclose);
// 		function onfinish() {
// 			debug('onfinish');
// 			dest.removeListener('close', onclose);
// 			unpipe();
// 		}
// 		dest.once('finish', onfinish);
	
// 		function unpipe() {
// 			debug('unpipe');
// 			src.unpipe(dest);
// 		}
	
// 		// tell the dest that it's being piped to
// 		dest.emit('pipe', src);
	
// 		// start the flow if it hasn't been started already.
// 		if (!state.flowing) {
// 			debug('pipe resume');
// 			src.resume();
// 		}
	
// 		return dest;
// 	};
	
// 	function pipeOnDrain(src) {
// 		return function () {
// 			var state = src._readableState;
// 			debug('pipeOnDrain', state.awaitDrain);
// 			if (state.awaitDrain) state.awaitDrain--;
// 			if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
// 				state.flowing = true;
// 				flow(src);
// 			}
// 		};
// 	}
	
// 	Readable.prototype.unpipe = function (dest) {
// 		var state = this._readableState;
// 		var unpipeInfo = { hasUnpiped: false };
	
// 		// if we're not piping anywhere, then do nothing.
// 		if (state.pipesCount === 0) return this;
	
// 		// just one destination.  most common case.
// 		if (state.pipesCount === 1) {
// 			// passed in one, but it's not the right one.
// 			if (dest && dest !== state.pipes) return this;
	
// 			if (!dest) dest = state.pipes;
	
// 			// got a match.
// 			state.pipes = null;
// 			state.pipesCount = 0;
// 			state.flowing = false;
// 			if (dest) dest.emit('unpipe', this, unpipeInfo);
// 			return this;
// 		}
	
// 		// slow case. multiple pipe destinations.
	
// 		if (!dest) {
// 			// remove all.
// 			var dests = state.pipes;
// 			var len = state.pipesCount;
// 			state.pipes = null;
// 			state.pipesCount = 0;
// 			state.flowing = false;
	
// 			for (var i = 0; i < len; i++) {
// 				dests[i].emit('unpipe', this, unpipeInfo);
// 			}return this;
// 		}
	
// 		// try to find the right one.
// 		var index = indexOf(state.pipes, dest);
// 		if (index === -1) return this;
	
// 		state.pipes.splice(index, 1);
// 		state.pipesCount -= 1;
// 		if (state.pipesCount === 1) state.pipes = state.pipes[0];
	
// 		dest.emit('unpipe', this, unpipeInfo);
	
// 		return this;
// 	};
	
// 	// set up data events if they are asked for
// 	// Ensure readable listeners eventually get something
// 	Readable.prototype.on = function (ev, fn) {
// 		var res = Stream.prototype.on.call(this, ev, fn);
	
// 		if (ev === 'data') {
// 			// Start flowing on next tick if stream isn't explicitly paused
// 			if (this._readableState.flowing !== false) this.resume();
// 		} else if (ev === 'readable') {
// 			var state = this._readableState;
// 			if (!state.endEmitted && !state.readableListening) {
// 				state.readableListening = state.needReadable = true;
// 				state.emittedReadable = false;
// 				if (!state.reading) {
// 					pna.nextTick(nReadingNextTick, this);
// 				} else if (state.length) {
// 					emitReadable(this);
// 				}
// 			}
// 		}
	
// 		return res;
// 	};
// 	Readable.prototype.addListener = Readable.prototype.on;
	
// 	function nReadingNextTick(self) {
// 		debug('readable nexttick read 0');
// 		self.read(0);
// 	}
	
// 	// pause() and resume() are remnants of the legacy readable stream API
// 	// If the user uses them, then switch into old mode.
// 	Readable.prototype.resume = function () {
// 		var state = this._readableState;
// 		if (!state.flowing) {
// 			debug('resume');
// 			state.flowing = true;
// 			resume(this, state);
// 		}
// 		return this;
// 	};
	
// 	function resume(stream, state) {
// 		if (!state.resumeScheduled) {
// 			state.resumeScheduled = true;
// 			pna.nextTick(resume_, stream, state);
// 		}
// 	}
	
// 	function resume_(stream, state) {
// 		if (!state.reading) {
// 			debug('resume read 0');
// 			stream.read(0);
// 		}
	
// 		state.resumeScheduled = false;
// 		state.awaitDrain = 0;
// 		stream.emit('resume');
// 		flow(stream);
// 		if (state.flowing && !state.reading) stream.read(0);
// 	}
	
// 	Readable.prototype.pause = function () {
// 		debug('call pause flowing=%j', this._readableState.flowing);
// 		if (false !== this._readableState.flowing) {
// 			debug('pause');
// 			this._readableState.flowing = false;
// 			this.emit('pause');
// 		}
// 		return this;
// 	};
	
// 	function flow(stream) {
// 		var state = stream._readableState;
// 		debug('flow', state.flowing);
// 		while (state.flowing && stream.read() !== null) {}
// 	}
	
// 	// wrap an old-style stream as the async data source.
// 	// This is *not* part of the readable stream interface.
// 	// It is an ugly unfortunate mess of history.
// 	Readable.prototype.wrap = function (stream) {
// 		var _this = this;
	
// 		var state = this._readableState;
// 		var paused = false;
	
// 		stream.on('end', function () {
// 			debug('wrapped end');
// 			if (state.decoder && !state.ended) {
// 				var chunk = state.decoder.end();
// 				if (chunk && chunk.length) _this.push(chunk);
// 			}
	
// 			_this.push(null);
// 		});
	
// 		stream.on('data', function (chunk) {
// 			debug('wrapped data');
// 			if (state.decoder) chunk = state.decoder.write(chunk);
	
// 			// don't skip over falsy values in objectMode
// 			if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;
	
// 			var ret = _this.push(chunk);
// 			if (!ret) {
// 				paused = true;
// 				stream.pause();
// 			}
// 		});
	
// 		// proxy all the other methods.
// 		// important when wrapping filters and duplexes.
// 		for (var i in stream) {
// 			if (this[i] === undefined && typeof stream[i] === 'function') {
// 				this[i] = function (method) {
// 					return function () {
// 						return stream[method].apply(stream, arguments);
// 					};
// 				}(i);
// 			}
// 		}
	
// 		// proxy certain important events.
// 		for (var n = 0; n < kProxyEvents.length; n++) {
// 			stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
// 		}
	
// 		// when we try to consume some more bytes, simply unpause the
// 		// underlying stream.
// 		this._read = function (n) {
// 			debug('wrapped _read', n);
// 			if (paused) {
// 				paused = false;
// 				stream.resume();
// 			}
// 		};
	
// 		return this;
// 	};
	
// 	Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
// 		// making it explicit this property is not enumerable
// 		// because otherwise some prototype manipulation in
// 		// userland will fail
// 		enumerable: false,
// 		get: function () {
// 			return this._readableState.highWaterMark;
// 		}
// 	});
	
// 	// exposed for testing purposes only.
// 	Readable._fromList = fromList;
	
// 	// Pluck off n bytes from an array of buffers.
// 	// Length is the combined lengths of all the buffers in the list.
// 	// This function is designed to be inlinable, so please take care when making
// 	// changes to the function body.
// 	function fromList(n, state) {
// 		// nothing buffered
// 		if (state.length === 0) return null;
	
// 		var ret;
// 		if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
// 			// read it all, truncate the list
// 			if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
// 			state.buffer.clear();
// 		} else {
// 			// read part of list
// 			ret = fromListPartial(n, state.buffer, state.decoder);
// 		}
	
// 		return ret;
// 	}
	
// 	// Extracts only enough buffered data to satisfy the amount requested.
// 	// This function is designed to be inlinable, so please take care when making
// 	// changes to the function body.
// 	function fromListPartial(n, list, hasStrings) {
// 		var ret;
// 		if (n < list.head.data.length) {
// 			// slice is the same for buffers and strings
// 			ret = list.head.data.slice(0, n);
// 			list.head.data = list.head.data.slice(n);
// 		} else if (n === list.head.data.length) {
// 			// first chunk is a perfect match
// 			ret = list.shift();
// 		} else {
// 			// result spans more than one buffer
// 			ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
// 		}
// 		return ret;
// 	}
	
// 	// Copies a specified amount of characters from the list of buffered data
// 	// chunks.
// 	// This function is designed to be inlinable, so please take care when making
// 	// changes to the function body.
// 	function copyFromBufferString(n, list) {
// 		var p = list.head;
// 		var c = 1;
// 		var ret = p.data;
// 		n -= ret.length;
// 		while (p = p.next) {
// 			var str = p.data;
// 			var nb = n > str.length ? str.length : n;
// 			if (nb === str.length) ret += str;else ret += str.slice(0, n);
// 			n -= nb;
// 			if (n === 0) {
// 				if (nb === str.length) {
// 					++c;
// 					if (p.next) list.head = p.next;else list.head = list.tail = null;
// 				} else {
// 					list.head = p;
// 					p.data = str.slice(nb);
// 				}
// 				break;
// 			}
// 			++c;
// 		}
// 		list.length -= c;
// 		return ret;
// 	}
	
// 	// Copies a specified amount of bytes from the list of buffered data chunks.
// 	// This function is designed to be inlinable, so please take care when making
// 	// changes to the function body.
// 	function copyFromBuffer(n, list) {
// 		var ret = Buffer.allocUnsafe(n);
// 		var p = list.head;
// 		var c = 1;
// 		p.data.copy(ret);
// 		n -= p.data.length;
// 		while (p = p.next) {
// 			var buf = p.data;
// 			var nb = n > buf.length ? buf.length : n;
// 			buf.copy(ret, ret.length - n, 0, nb);
// 			n -= nb;
// 			if (n === 0) {
// 				if (nb === buf.length) {
// 					++c;
// 					if (p.next) list.head = p.next;else list.head = list.tail = null;
// 				} else {
// 					list.head = p;
// 					p.data = buf.slice(nb);
// 				}
// 				break;
// 			}
// 			++c;
// 		}
// 		list.length -= c;
// 		return ret;
// 	}
	
// 	function endReadable(stream) {
// 		var state = stream._readableState;
	
// 		// If we get here before consuming all the bytes, then that is a
// 		// bug in node.  Should never happen.
// 		if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');
	
// 		if (!state.endEmitted) {
// 			state.ended = true;
// 			pna.nextTick(endReadableNT, state, stream);
// 		}
// 	}
	
// 	function endReadableNT(state, stream) {
// 		// Check that we didn't get one last unshift.
// 		if (!state.endEmitted && state.length === 0) {
// 			state.endEmitted = true;
// 			stream.readable = false;
// 			stream.emit('end');
// 		}
// 	}
	
// 	function indexOf(xs, x) {
// 		for (var i = 0, l = xs.length; i < l; i++) {
// 			if (xs[i] === x) return i;
// 		}
// 		return -1;
// 	}
// 	}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
// 	},{"./_stream_duplex":98,"./internal/streams/BufferList":103,"./internal/streams/destroy":104,"./internal/streams/stream":105,"_process":92,"core-util-is":14,"events":13,"inherits":80,"isarray":106,"process-nextick-args":91,"safe-buffer":110,"string_decoder/":107,"util":11}],101:[function(require,module,exports){
// 	// Copyright Joyent, Inc. and other Node contributors.
// 	//
// 	// Permission is hereby granted, free of charge, to any person obtaining a
// 	// copy of this software and associated documentation files (the
// 	// "Software"), to deal in the Software without restriction, including
// 	// without limitation the rights to use, copy, modify, merge, publish,
// 	// distribute, sublicense, and/or sell copies of the Software, and to permit
// 	// persons to whom the Software is furnished to do so, subject to the
// 	// following conditions:
// 	//
// 	// The above copyright notice and this permission notice shall be included
// 	// in all copies or substantial portions of the Software.
// 	//
// 	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// 	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// 	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// 	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// 	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// 	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// 	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
// 	// a transform stream is a readable/writable stream where you do
// 	// something with the data.  Sometimes it's called a "filter",
// 	// but that's not a great name for it, since that implies a thing where
// 	// some bits pass through, and others are simply ignored.  (That would
// 	// be a valid example of a transform, of course.)
// 	//
// 	// While the output is causally related to the input, it's not a
// 	// necessarily symmetric or synchronous transformation.  For example,
// 	// a zlib stream might take multiple plain-text writes(), and then
// 	// emit a single compressed chunk some time in the future.
// 	//
// 	// Here's how this works:
// 	//
// 	// The Transform stream has all the aspects of the readable and writable
// 	// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// 	// internally, and returns false if there's a lot of pending writes
// 	// buffered up.  When you call read(), that calls _read(n) until
// 	// there's enough pending readable data buffered up.
// 	//
// 	// In a transform stream, the written data is placed in a buffer.  When
// 	// _read(n) is called, it transforms the queued up data, calling the
// 	// buffered _write cb's as it consumes chunks.  If consuming a single
// 	// written chunk would result in multiple output chunks, then the first
// 	// outputted bit calls the readcb, and subsequent chunks just go into
// 	// the read buffer, and will cause it to emit 'readable' if necessary.
// 	//
// 	// This way, back-pressure is actually determined by the reading side,
// 	// since _read has to be called to start processing a new chunk.  However,
// 	// a pathological inflate type of transform can cause excessive buffering
// 	// here.  For example, imagine a stream where every byte of input is
// 	// interpreted as an integer from 0-255, and then results in that many
// 	// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 	// 1kb of data being output.  In this case, you could write a very small
// 	// amount of input, and end up with a very large amount of output.  In
// 	// such a pathological inflating mechanism, there'd be no way to tell
// 	// the system to stop doing the transform.  A single 4MB write could
// 	// cause the system to run out of memory.
// 	//
// 	// However, even in such a pathological case, only a single written chunk
// 	// would be consumed, and then the rest would wait (un-transformed) until
// 	// the results of the previous transformed chunk were consumed.
	
// 	'use strict';
	
// 	module.exports = Transform;
	
// 	var Duplex = require('./_stream_duplex');
	
// 	/*<replacement>*/
// 	var util = require('core-util-is');
// 	util.inherits = require('inherits');
// 	/*</replacement>*/
	
// 	util.inherits(Transform, Duplex);
	
// 	function afterTransform(er, data) {
// 		var ts = this._transformState;
// 		ts.transforming = false;
	
// 		var cb = ts.writecb;
	
// 		if (!cb) {
// 			return this.emit('error', new Error('write callback called multiple times'));
// 		}
	
// 		ts.writechunk = null;
// 		ts.writecb = null;
	
// 		if (data != null) // single equals check for both `null` and `undefined`
// 			this.push(data);
	
// 		cb(er);
	
// 		var rs = this._readableState;
// 		rs.reading = false;
// 		if (rs.needReadable || rs.length < rs.highWaterMark) {
// 			this._read(rs.highWaterMark);
// 		}
// 	}
	
// 	function Transform(options) {
// 		if (!(this instanceof Transform)) return new Transform(options);
	
// 		Duplex.call(this, options);
	
// 		this._transformState = {
// 			afterTransform: afterTransform.bind(this),
// 			needTransform: false,
// 			transforming: false,
// 			writecb: null,
// 			writechunk: null,
// 			writeencoding: null
// 		};
	
// 		// start out asking for a readable event once data is transformed.
// 		this._readableState.needReadable = true;
	
// 		// we have implemented the _read method, and done the other things
// 		// that Readable wants before the first _read call, so unset the
// 		// sync guard flag.
// 		this._readableState.sync = false;
	
// 		if (options) {
// 			if (typeof options.transform === 'function') this._transform = options.transform;
	
// 			if (typeof options.flush === 'function') this._flush = options.flush;
// 		}
	
// 		// When the writable side finishes, then flush out anything remaining.
// 		this.on('prefinish', prefinish);
// 	}
	
// 	function prefinish() {
// 		var _this = this;
	
// 		if (typeof this._flush === 'function') {
// 			this._flush(function (er, data) {
// 				done(_this, er, data);
// 			});
// 		} else {
// 			done(this, null, null);
// 		}
// 	}
	
// 	Transform.prototype.push = function (chunk, encoding) {
// 		this._transformState.needTransform = false;
// 		return Duplex.prototype.push.call(this, chunk, encoding);
// 	};
	
// 	// This is the part where you do stuff!
// 	// override this function in implementation classes.
// 	// 'chunk' is an input chunk.
// 	//
// 	// Call `push(newChunk)` to pass along transformed output
// 	// to the readable side.  You may call 'push' zero or more times.
// 	//
// 	// Call `cb(err)` when you are done with this chunk.  If you pass
// 	// an error, then that'll put the hurt on the whole operation.  If you
// 	// never call cb(), then you'll never get another chunk.
// 	Transform.prototype._transform = function (chunk, encoding, cb) {
// 		throw new Error('_transform() is not implemented');
// 	};
	
// 	Transform.prototype._write = function (chunk, encoding, cb) {
// 		var ts = this._transformState;
// 		ts.writecb = cb;
// 		ts.writechunk = chunk;
// 		ts.writeencoding = encoding;
// 		if (!ts.transforming) {
// 			var rs = this._readableState;
// 			if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
// 		}
// 	};
	
// 	// Doesn't matter what the args are here.
// 	// _transform does all the work.
// 	// That we got here means that the readable side wants more data.
// 	Transform.prototype._read = function (n) {
// 		var ts = this._transformState;
	
// 		if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
// 			ts.transforming = true;
// 			this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
// 		} else {
// 			// mark that we need a transform, so that any data that comes in
// 			// will get processed, now that we've asked for it.
// 			ts.needTransform = true;
// 		}
// 	};
	
// 	Transform.prototype._destroy = function (err, cb) {
// 		var _this2 = this;
	
// 		Duplex.prototype._destroy.call(this, err, function (err2) {
// 			cb(err2);
// 			_this2.emit('close');
// 		});
// 	};
	
// 	function done(stream, er, data) {
// 		if (er) return stream.emit('error', er);
	
// 		if (data != null) // single equals check for both `null` and `undefined`
// 			stream.push(data);
	
// 		// if there's nothing in the write buffer, then that means
// 		// that nothing more will ever be provided
// 		if (stream._writableState.length) throw new Error('Calling transform done when ws.length != 0');
	
// 		if (stream._transformState.transforming) throw new Error('Calling transform done when still transforming');
	
// 		return stream.push(null);
// 	}
// 	},{"./_stream_duplex":98,"core-util-is":14,"inherits":80}],102:[function(require,module,exports){
// 	(function (process,global,setImmediate){
// 	// Copyright Joyent, Inc. and other Node contributors.
// 	//
// 	// Permission is hereby granted, free of charge, to any person obtaining a
// 	// copy of this software and associated documentation files (the
// 	// "Software"), to deal in the Software without restriction, including
// 	// without limitation the rights to use, copy, modify, merge, publish,
// 	// distribute, sublicense, and/or sell copies of the Software, and to permit
// 	// persons to whom the Software is furnished to do so, subject to the
// 	// following conditions:
// 	//
// 	// The above copyright notice and this permission notice shall be included
// 	// in all copies or substantial portions of the Software.
// 	//
// 	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// 	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// 	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// 	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// 	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// 	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// 	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
// 	// A bit simpler than readable streams.
// 	// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// 	// the drain event emission and buffering.
	
// 	'use strict';
	
// 	/*<replacement>*/
	
// 	var pna = require('process-nextick-args');
// 	/*</replacement>*/
	
// 	module.exports = Writable;
	
// 	/* <replacement> */
// 	function WriteReq(chunk, encoding, cb) {
// 		this.chunk = chunk;
// 		this.encoding = encoding;
// 		this.callback = cb;
// 		this.next = null;
// 	}
	
// 	// It seems a linked list but it is not
// 	// there will be only 2 of these for each stream
// 	function CorkedRequest(state) {
// 		var _this = this;
	
// 		this.next = null;
// 		this.entry = null;
// 		this.finish = function () {
// 			onCorkedFinish(_this, state);
// 		};
// 	}
// 	/* </replacement> */
	
// 	/*<replacement>*/
// 	var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
// 	/*</replacement>*/
	
// 	/*<replacement>*/
// 	var Duplex;
// 	/*</replacement>*/
	
// 	Writable.WritableState = WritableState;
	
// 	/*<replacement>*/
// 	var util = require('core-util-is');
// 	util.inherits = require('inherits');
// 	/*</replacement>*/
	
// 	/*<replacement>*/
// 	var internalUtil = {
// 		deprecate: require('util-deprecate')
// 	};
// 	/*</replacement>*/
	
// 	/*<replacement>*/
// 	var Stream = require('./internal/streams/stream');
// 	/*</replacement>*/
	
// 	/*<replacement>*/
	
// 	var Buffer = require('safe-buffer').Buffer;
// 	var OurUint8Array = global.Uint8Array || function () {};
// 	function _uint8ArrayToBuffer(chunk) {
// 		return Buffer.from(chunk);
// 	}
// 	function _isUint8Array(obj) {
// 		return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
// 	}
	
// 	/*</replacement>*/
	
// 	var destroyImpl = require('./internal/streams/destroy');
	
// 	util.inherits(Writable, Stream);
	
// 	function nop() {}
	
// 	function WritableState(options, stream) {
// 		Duplex = Duplex || require('./_stream_duplex');
	
// 		options = options || {};
	
// 		// Duplex streams are both readable and writable, but share
// 		// the same options object.
// 		// However, some cases require setting options to different
// 		// values for the readable and the writable sides of the duplex stream.
// 		// These options can be provided separately as readableXXX and writableXXX.
// 		var isDuplex = stream instanceof Duplex;
	
// 		// object stream flag to indicate whether or not this stream
// 		// contains buffers or objects.
// 		this.objectMode = !!options.objectMode;
	
// 		if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;
	
// 		// the point at which write() starts returning false
// 		// Note: 0 is a valid value, means that we always return false if
// 		// the entire buffer is not flushed immediately on write()
// 		var hwm = options.highWaterMark;
// 		var writableHwm = options.writableHighWaterMark;
// 		var defaultHwm = this.objectMode ? 16 : 16 * 1024;
	
// 		if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;else this.highWaterMark = defaultHwm;
	
// 		// cast to ints.
// 		this.highWaterMark = Math.floor(this.highWaterMark);
	
// 		// if _final has been called
// 		this.finalCalled = false;
	
// 		// drain event flag.
// 		this.needDrain = false;
// 		// at the start of calling end()
// 		this.ending = false;
// 		// when end() has been called, and returned
// 		this.ended = false;
// 		// when 'finish' is emitted
// 		this.finished = false;
	
// 		// has it been destroyed
// 		this.destroyed = false;
	
// 		// should we decode strings into buffers before passing to _write?
// 		// this is here so that some node-core streams can optimize string
// 		// handling at a lower level.
// 		var noDecode = options.decodeStrings === false;
// 		this.decodeStrings = !noDecode;
	
// 		// Crypto is kind of old and crusty.  Historically, its default string
// 		// encoding is 'binary' so we have to make this configurable.
// 		// Everything else in the universe uses 'utf8', though.
// 		this.defaultEncoding = options.defaultEncoding || 'utf8';
	
// 		// not an actual buffer we keep track of, but a measurement
// 		// of how much we're waiting to get pushed to some underlying
// 		// socket or file.
// 		this.length = 0;
	
// 		// a flag to see when we're in the middle of a write.
// 		this.writing = false;
	
// 		// when true all writes will be buffered until .uncork() call
// 		this.corked = 0;
	
// 		// a flag to be able to tell if the onwrite cb is called immediately,
// 		// or on a later tick.  We set this to true at first, because any
// 		// actions that shouldn't happen until "later" should generally also
// 		// not happen before the first write call.
// 		this.sync = true;
	
// 		// a flag to know if we're processing previously buffered items, which
// 		// may call the _write() callback in the same tick, so that we don't
// 		// end up in an overlapped onwrite situation.
// 		this.bufferProcessing = false;
	
// 		// the callback that's passed to _write(chunk,cb)
// 		this.onwrite = function (er) {
// 			onwrite(stream, er);
// 		};
	
// 		// the callback that the user supplies to write(chunk,encoding,cb)
// 		this.writecb = null;
	
// 		// the amount that is being written when _write is called.
// 		this.writelen = 0;
	
// 		this.bufferedRequest = null;
// 		this.lastBufferedRequest = null;
	
// 		// number of pending user-supplied write callbacks
// 		// this must be 0 before 'finish' can be emitted
// 		this.pendingcb = 0;
	
// 		// emit prefinish if the only thing we're waiting for is _write cbs
// 		// This is relevant for synchronous Transform streams
// 		this.prefinished = false;
	
// 		// True if the error was already emitted and should not be thrown again
// 		this.errorEmitted = false;
	
// 		// count buffered requests
// 		this.bufferedRequestCount = 0;
	
// 		// allocate the first CorkedRequest, there is always
// 		// one allocated and free to use, and we maintain at most two
// 		this.corkedRequestsFree = new CorkedRequest(this);
// 	}
	
// 	WritableState.prototype.getBuffer = function getBuffer() {
// 		var current = this.bufferedRequest;
// 		var out = [];
// 		while (current) {
// 			out.push(current);
// 			current = current.next;
// 		}
// 		return out;
// 	};
	
// 	(function () {
// 		try {
// 			Object.defineProperty(WritableState.prototype, 'buffer', {
// 				get: internalUtil.deprecate(function () {
// 					return this.getBuffer();
// 				}, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
// 			});
// 		} catch (_) {}
// 	})();
	
// 	// Test _writableState for inheritance to account for Duplex streams,
// 	// whose prototype chain only points to Readable.
// 	var realHasInstance;
// 	if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
// 		realHasInstance = Function.prototype[Symbol.hasInstance];
// 		Object.defineProperty(Writable, Symbol.hasInstance, {
// 			value: function (object) {
// 				if (realHasInstance.call(this, object)) return true;
// 				if (this !== Writable) return false;
	
// 				return object && object._writableState instanceof WritableState;
// 			}
// 		});
// 	} else {
// 		realHasInstance = function (object) {
// 			return object instanceof this;
// 		};
// 	}
	
// 	function Writable(options) {
// 		Duplex = Duplex || require('./_stream_duplex');
	
// 		// Writable ctor is applied to Duplexes, too.
// 		// `realHasInstance` is necessary because using plain `instanceof`
// 		// would return false, as no `_writableState` property is attached.
	
// 		// Trying to use the custom `instanceof` for Writable here will also break the
// 		// Node.js LazyTransform implementation, which has a non-trivial getter for
// 		// `_writableState` that would lead to infinite recursion.
// 		if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
// 			return new Writable(options);
// 		}
	
// 		this._writableState = new WritableState(options, this);
	
// 		// legacy.
// 		this.writable = true;
	
// 		if (options) {
// 			if (typeof options.write === 'function') this._write = options.write;
	
// 			if (typeof options.writev === 'function') this._writev = options.writev;
	
// 			if (typeof options.destroy === 'function') this._destroy = options.destroy;
	
// 			if (typeof options.final === 'function') this._final = options.final;
// 		}
	
// 		Stream.call(this);
// 	}
	
// 	// Otherwise people can pipe Writable streams, which is just wrong.
// 	Writable.prototype.pipe = function () {
// 		this.emit('error', new Error('Cannot pipe, not readable'));
// 	};
	
// 	function writeAfterEnd(stream, cb) {
// 		var er = new Error('write after end');
// 		// TODO: defer error events consistently everywhere, not just the cb
// 		stream.emit('error', er);
// 		pna.nextTick(cb, er);
// 	}
	
// 	// Checks that a user-supplied chunk is valid, especially for the particular
// 	// mode the stream is in. Currently this means that `null` is never accepted
// 	// and undefined/non-string values are only allowed in object mode.
// 	function validChunk(stream, state, chunk, cb) {
// 		var valid = true;
// 		var er = false;
	
// 		if (chunk === null) {
// 			er = new TypeError('May not write null values to stream');
// 		} else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
// 			er = new TypeError('Invalid non-string/buffer chunk');
// 		}
// 		if (er) {
// 			stream.emit('error', er);
// 			pna.nextTick(cb, er);
// 			valid = false;
// 		}
// 		return valid;
// 	}
	
// 	Writable.prototype.write = function (chunk, encoding, cb) {
// 		var state = this._writableState;
// 		var ret = false;
// 		var isBuf = !state.objectMode && _isUint8Array(chunk);
	
// 		if (isBuf && !Buffer.isBuffer(chunk)) {
// 			chunk = _uint8ArrayToBuffer(chunk);
// 		}
	
// 		if (typeof encoding === 'function') {
// 			cb = encoding;
// 			encoding = null;
// 		}
	
// 		if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;
	
// 		if (typeof cb !== 'function') cb = nop;
	
// 		if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
// 			state.pendingcb++;
// 			ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
// 		}
	
// 		return ret;
// 	};
	
// 	Writable.prototype.cork = function () {
// 		var state = this._writableState;
	
// 		state.corked++;
// 	};
	
// 	Writable.prototype.uncork = function () {
// 		var state = this._writableState;
	
// 		if (state.corked) {
// 			state.corked--;
	
// 			if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
// 		}
// 	};
	
// 	Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
// 		// node::ParseEncoding() requires lower case.
// 		if (typeof encoding === 'string') encoding = encoding.toLowerCase();
// 		if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
// 		this._writableState.defaultEncoding = encoding;
// 		return this;
// 	};
	
// 	function decodeChunk(state, chunk, encoding) {
// 		if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
// 			chunk = Buffer.from(chunk, encoding);
// 		}
// 		return chunk;
// 	}
	
// 	Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
// 		// making it explicit this property is not enumerable
// 		// because otherwise some prototype manipulation in
// 		// userland will fail
// 		enumerable: false,
// 		get: function () {
// 			return this._writableState.highWaterMark;
// 		}
// 	});
	
// 	// if we're already writing something, then just put this
// 	// in the queue, and wait our turn.  Otherwise, call _write
// 	// If we return false, then we need a drain event, so set that flag.
// 	function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
// 		if (!isBuf) {
// 			var newChunk = decodeChunk(state, chunk, encoding);
// 			if (chunk !== newChunk) {
// 				isBuf = true;
// 				encoding = 'buffer';
// 				chunk = newChunk;
// 			}
// 		}
// 		var len = state.objectMode ? 1 : chunk.length;
	
// 		state.length += len;
	
// 		var ret = state.length < state.highWaterMark;
// 		// we must ensure that previous needDrain will not be reset to false.
// 		if (!ret) state.needDrain = true;
	
// 		if (state.writing || state.corked) {
// 			var last = state.lastBufferedRequest;
// 			state.lastBufferedRequest = {
// 				chunk: chunk,
// 				encoding: encoding,
// 				isBuf: isBuf,
// 				callback: cb,
// 				next: null
// 			};
// 			if (last) {
// 				last.next = state.lastBufferedRequest;
// 			} else {
// 				state.bufferedRequest = state.lastBufferedRequest;
// 			}
// 			state.bufferedRequestCount += 1;
// 		} else {
// 			doWrite(stream, state, false, len, chunk, encoding, cb);
// 		}
	
// 		return ret;
// 	}
	
// 	function doWrite(stream, state, writev, len, chunk, encoding, cb) {
// 		state.writelen = len;
// 		state.writecb = cb;
// 		state.writing = true;
// 		state.sync = true;
// 		if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
// 		state.sync = false;
// 	}
	
// 	function onwriteError(stream, state, sync, er, cb) {
// 		--state.pendingcb;
	
// 		if (sync) {
// 			// defer the callback if we are being called synchronously
// 			// to avoid piling up things on the stack
// 			pna.nextTick(cb, er);
// 			// this can emit finish, and it will always happen
// 			// after error
// 			pna.nextTick(finishMaybe, stream, state);
// 			stream._writableState.errorEmitted = true;
// 			stream.emit('error', er);
// 		} else {
// 			// the caller expect this to happen before if
// 			// it is async
// 			cb(er);
// 			stream._writableState.errorEmitted = true;
// 			stream.emit('error', er);
// 			// this can emit finish, but finish must
// 			// always follow error
// 			finishMaybe(stream, state);
// 		}
// 	}
	
// 	function onwriteStateUpdate(state) {
// 		state.writing = false;
// 		state.writecb = null;
// 		state.length -= state.writelen;
// 		state.writelen = 0;
// 	}
	
// 	function onwrite(stream, er) {
// 		var state = stream._writableState;
// 		var sync = state.sync;
// 		var cb = state.writecb;
	
// 		onwriteStateUpdate(state);
	
// 		if (er) onwriteError(stream, state, sync, er, cb);else {
// 			// Check if we're actually ready to finish, but don't emit yet
// 			var finished = needFinish(state);
	
// 			if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
// 				clearBuffer(stream, state);
// 			}
	
// 			if (sync) {
// 				/*<replacement>*/
// 				asyncWrite(afterWrite, stream, state, finished, cb);
// 				/*</replacement>*/
// 			} else {
// 				afterWrite(stream, state, finished, cb);
// 			}
// 		}
// 	}
	
// 	function afterWrite(stream, state, finished, cb) {
// 		if (!finished) onwriteDrain(stream, state);
// 		state.pendingcb--;
// 		cb();
// 		finishMaybe(stream, state);
// 	}
	
// 	// Must force callback to be called on nextTick, so that we don't
// 	// emit 'drain' before the write() consumer gets the 'false' return
// 	// value, and has a chance to attach a 'drain' listener.
// 	function onwriteDrain(stream, state) {
// 		if (state.length === 0 && state.needDrain) {
// 			state.needDrain = false;
// 			stream.emit('drain');
// 		}
// 	}
	
// 	// if there's something in the buffer waiting, then process it
// 	function clearBuffer(stream, state) {
// 		state.bufferProcessing = true;
// 		var entry = state.bufferedRequest;
	
// 		if (stream._writev && entry && entry.next) {
// 			// Fast case, write everything using _writev()
// 			var l = state.bufferedRequestCount;
// 			var buffer = new Array(l);
// 			var holder = state.corkedRequestsFree;
// 			holder.entry = entry;
	
// 			var count = 0;
// 			var allBuffers = true;
// 			while (entry) {
// 				buffer[count] = entry;
// 				if (!entry.isBuf) allBuffers = false;
// 				entry = entry.next;
// 				count += 1;
// 			}
// 			buffer.allBuffers = allBuffers;
	
// 			doWrite(stream, state, true, state.length, buffer, '', holder.finish);
	
// 			// doWrite is almost always async, defer these to save a bit of time
// 			// as the hot path ends with doWrite
// 			state.pendingcb++;
// 			state.lastBufferedRequest = null;
// 			if (holder.next) {
// 				state.corkedRequestsFree = holder.next;
// 				holder.next = null;
// 			} else {
// 				state.corkedRequestsFree = new CorkedRequest(state);
// 			}
// 			state.bufferedRequestCount = 0;
// 		} else {
// 			// Slow case, write chunks one-by-one
// 			while (entry) {
// 				var chunk = entry.chunk;
// 				var encoding = entry.encoding;
// 				var cb = entry.callback;
// 				var len = state.objectMode ? 1 : chunk.length;
	
// 				doWrite(stream, state, false, len, chunk, encoding, cb);
// 				entry = entry.next;
// 				state.bufferedRequestCount--;
// 				// if we didn't call the onwrite immediately, then
// 				// it means that we need to wait until it does.
// 				// also, that means that the chunk and cb are currently
// 				// being processed, so move the buffer counter past them.
// 				if (state.writing) {
// 					break;
// 				}
// 			}
	
// 			if (entry === null) state.lastBufferedRequest = null;
// 		}
	
// 		state.bufferedRequest = entry;
// 		state.bufferProcessing = false;
// 	}
	
// 	Writable.prototype._write = function (chunk, encoding, cb) {
// 		cb(new Error('_write() is not implemented'));
// 	};
	
// 	Writable.prototype._writev = null;
	
// 	Writable.prototype.end = function (chunk, encoding, cb) {
// 		var state = this._writableState;
	
// 		if (typeof chunk === 'function') {
// 			cb = chunk;
// 			chunk = null;
// 			encoding = null;
// 		} else if (typeof encoding === 'function') {
// 			cb = encoding;
// 			encoding = null;
// 		}
	
// 		if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);
	
// 		// .end() fully uncorks
// 		if (state.corked) {
// 			state.corked = 1;
// 			this.uncork();
// 		}
	
// 		// ignore unnecessary end() calls.
// 		if (!state.ending && !state.finished) endWritable(this, state, cb);
// 	};
	
// 	function needFinish(state) {
// 		return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
// 	}
// 	function callFinal(stream, state) {
// 		stream._final(function (err) {
// 			state.pendingcb--;
// 			if (err) {
// 				stream.emit('error', err);
// 			}
// 			state.prefinished = true;
// 			stream.emit('prefinish');
// 			finishMaybe(stream, state);
// 		});
// 	}
// 	function prefinish(stream, state) {
// 		if (!state.prefinished && !state.finalCalled) {
// 			if (typeof stream._final === 'function') {
// 				state.pendingcb++;
// 				state.finalCalled = true;
// 				pna.nextTick(callFinal, stream, state);
// 			} else {
// 				state.prefinished = true;
// 				stream.emit('prefinish');
// 			}
// 		}
// 	}
	
// 	function finishMaybe(stream, state) {
// 		var need = needFinish(state);
// 		if (need) {
// 			prefinish(stream, state);
// 			if (state.pendingcb === 0) {
// 				state.finished = true;
// 				stream.emit('finish');
// 			}
// 		}
// 		return need;
// 	}
	
// 	function endWritable(stream, state, cb) {
// 		state.ending = true;
// 		finishMaybe(stream, state);
// 		if (cb) {
// 			if (state.finished) pna.nextTick(cb);else stream.once('finish', cb);
// 		}
// 		state.ended = true;
// 		stream.writable = false;
// 	}
	
// 	function onCorkedFinish(corkReq, state, err) {
// 		var entry = corkReq.entry;
// 		corkReq.entry = null;
// 		while (entry) {
// 			var cb = entry.callback;
// 			state.pendingcb--;
// 			cb(err);
// 			entry = entry.next;
// 		}
// 		if (state.corkedRequestsFree) {
// 			state.corkedRequestsFree.next = corkReq;
// 		} else {
// 			state.corkedRequestsFree = corkReq;
// 		}
// 	}
	
// 	Object.defineProperty(Writable.prototype, 'destroyed', {
// 		get: function () {
// 			if (this._writableState === undefined) {
// 				return false;
// 			}
// 			return this._writableState.destroyed;
// 		},
// 		set: function (value) {
// 			// we ignore the value if the stream
// 			// has not been initialized yet
// 			if (!this._writableState) {
// 				return;
// 			}
	
// 			// backward compatibility, the user is explicitly
// 			// managing destroyed
// 			this._writableState.destroyed = value;
// 		}
// 	});
	
// 	Writable.prototype.destroy = destroyImpl.destroy;
// 	Writable.prototype._undestroy = destroyImpl.undestroy;
// 	Writable.prototype._destroy = function (err, cb) {
// 		this.end();
// 		cb(err);
// 	};
// 	}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("timers").setImmediate)
// 	},{"./_stream_duplex":98,"./internal/streams/destroy":104,"./internal/streams/stream":105,"_process":92,"core-util-is":14,"inherits":80,"process-nextick-args":91,"safe-buffer":110,"timers":112,"util-deprecate":115}],103:[function(require,module,exports){
// 	'use strict';
	
// 	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
// 	var Buffer = require('safe-buffer').Buffer;
// 	var util = require('util');
	
// 	function copyBuffer(src, target, offset) {
// 		src.copy(target, offset);
// 	}
	
// 	module.exports = function () {
// 		function BufferList() {
// 			_classCallCheck(this, BufferList);
	
// 			this.head = null;
// 			this.tail = null;
// 			this.length = 0;
// 		}
	
// 		BufferList.prototype.push = function push(v) {
// 			var entry = { data: v, next: null };
// 			if (this.length > 0) this.tail.next = entry;else this.head = entry;
// 			this.tail = entry;
// 			++this.length;
// 		};
	
// 		BufferList.prototype.unshift = function unshift(v) {
// 			var entry = { data: v, next: this.head };
// 			if (this.length === 0) this.tail = entry;
// 			this.head = entry;
// 			++this.length;
// 		};
	
// 		BufferList.prototype.shift = function shift() {
// 			if (this.length === 0) return;
// 			var ret = this.head.data;
// 			if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
// 			--this.length;
// 			return ret;
// 		};
	
// 		BufferList.prototype.clear = function clear() {
// 			this.head = this.tail = null;
// 			this.length = 0;
// 		};
	
// 		BufferList.prototype.join = function join(s) {
// 			if (this.length === 0) return '';
// 			var p = this.head;
// 			var ret = '' + p.data;
// 			while (p = p.next) {
// 				ret += s + p.data;
// 			}return ret;
// 		};
	
// 		BufferList.prototype.concat = function concat(n) {
// 			if (this.length === 0) return Buffer.alloc(0);
// 			if (this.length === 1) return this.head.data;
// 			var ret = Buffer.allocUnsafe(n >>> 0);
// 			var p = this.head;
// 			var i = 0;
// 			while (p) {
// 				copyBuffer(p.data, ret, i);
// 				i += p.data.length;
// 				p = p.next;
// 			}
// 			return ret;
// 		};
	
// 		return BufferList;
// 	}();
	
// 	if (util && util.inspect && util.inspect.custom) {
// 		module.exports.prototype[util.inspect.custom] = function () {
// 			var obj = util.inspect({ length: this.length });
// 			return this.constructor.name + ' ' + obj;
// 		};
// 	}
// 	},{"safe-buffer":110,"util":11}],104:[function(require,module,exports){
// 	'use strict';
	
// 	/*<replacement>*/
	
// 	var pna = require('process-nextick-args');
// 	/*</replacement>*/
	
// 	// undocumented cb() API, needed for core, not for public API
// 	function destroy(err, cb) {
// 		var _this = this;
	
// 		var readableDestroyed = this._readableState && this._readableState.destroyed;
// 		var writableDestroyed = this._writableState && this._writableState.destroyed;
	
// 		if (readableDestroyed || writableDestroyed) {
// 			if (cb) {
// 				cb(err);
// 			} else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
// 				pna.nextTick(emitErrorNT, this, err);
// 			}
// 			return this;
// 		}
	
// 		// we set destroyed to true before firing error callbacks in order
// 		// to make it re-entrance safe in case destroy() is called within callbacks
	
// 		if (this._readableState) {
// 			this._readableState.destroyed = true;
// 		}
	
// 		// if this is a duplex stream mark the writable part as destroyed as well
// 		if (this._writableState) {
// 			this._writableState.destroyed = true;
// 		}
	
// 		this._destroy(err || null, function (err) {
// 			if (!cb && err) {
// 				pna.nextTick(emitErrorNT, _this, err);
// 				if (_this._writableState) {
// 					_this._writableState.errorEmitted = true;
// 				}
// 			} else if (cb) {
// 				cb(err);
// 			}
// 		});
	
// 		return this;
// 	}
	
// 	function undestroy() {
// 		if (this._readableState) {
// 			this._readableState.destroyed = false;
// 			this._readableState.reading = false;
// 			this._readableState.ended = false;
// 			this._readableState.endEmitted = false;
// 		}
	
// 		if (this._writableState) {
// 			this._writableState.destroyed = false;
// 			this._writableState.ended = false;
// 			this._writableState.ending = false;
// 			this._writableState.finished = false;
// 			this._writableState.errorEmitted = false;
// 		}
// 	}
	
// 	function emitErrorNT(self, err) {
// 		self.emit('error', err);
// 	}
	
// 	module.exports = {
// 		destroy: destroy,
// 		undestroy: undestroy
// 	};
// 	},{"process-nextick-args":91}],105:[function(require,module,exports){
// 	module.exports = require('events').EventEmitter;
	
// 	},{"events":13}],106:[function(require,module,exports){
// 	var toString = {}.toString;
	
// 	module.exports = Array.isArray || function (arr) {
// 		return toString.call(arr) == '[object Array]';
// 	};
	
// 	},{}],107:[function(require,module,exports){
// 	// Copyright Joyent, Inc. and other Node contributors.
// 	//
// 	// Permission is hereby granted, free of charge, to any person obtaining a
// 	// copy of this software and associated documentation files (the
// 	// "Software"), to deal in the Software without restriction, including
// 	// without limitation the rights to use, copy, modify, merge, publish,
// 	// distribute, sublicense, and/or sell copies of the Software, and to permit
// 	// persons to whom the Software is furnished to do so, subject to the
// 	// following conditions:
// 	//
// 	// The above copyright notice and this permission notice shall be included
// 	// in all copies or substantial portions of the Software.
// 	//
// 	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// 	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// 	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// 	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// 	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// 	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// 	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
// 	'use strict';
	
// 	/*<replacement>*/
	
// 	var Buffer = require('safe-buffer').Buffer;
// 	/*</replacement>*/
	
// 	var isEncoding = Buffer.isEncoding || function (encoding) {
// 		encoding = '' + encoding;
// 		switch (encoding && encoding.toLowerCase()) {
// 			case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
// 				return true;
// 			default:
// 				return false;
// 		}
// 	};
	
// 	function _normalizeEncoding(enc) {
// 		if (!enc) return 'utf8';
// 		var retried;
// 		while (true) {
// 			switch (enc) {
// 				case 'utf8':
// 				case 'utf-8':
// 					return 'utf8';
// 				case 'ucs2':
// 				case 'ucs-2':
// 				case 'utf16le':
// 				case 'utf-16le':
// 					return 'utf16le';
// 				case 'latin1':
// 				case 'binary':
// 					return 'latin1';
// 				case 'base64':
// 				case 'ascii':
// 				case 'hex':
// 					return enc;
// 				default:
// 					if (retried) return; // undefined
// 					enc = ('' + enc).toLowerCase();
// 					retried = true;
// 			}
// 		}
// 	};
	
// 	// Do not cache `Buffer.isEncoding` when checking encoding names as some
// 	// modules monkey-patch it to support additional encodings
// 	function normalizeEncoding(enc) {
// 		var nenc = _normalizeEncoding(enc);
// 		if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
// 		return nenc || enc;
// 	}
	
// 	// StringDecoder provides an interface for efficiently splitting a series of
// 	// buffers into a series of JS strings without breaking apart multi-byte
// 	// characters.
// 	exports.StringDecoder = StringDecoder;
// 	function StringDecoder(encoding) {
// 		this.encoding = normalizeEncoding(encoding);
// 		var nb;
// 		switch (this.encoding) {
// 			case 'utf16le':
// 				this.text = utf16Text;
// 				this.end = utf16End;
// 				nb = 4;
// 				break;
// 			case 'utf8':
// 				this.fillLast = utf8FillLast;
// 				nb = 4;
// 				break;
// 			case 'base64':
// 				this.text = base64Text;
// 				this.end = base64End;
// 				nb = 3;
// 				break;
// 			default:
// 				this.write = simpleWrite;
// 				this.end = simpleEnd;
// 				return;
// 		}
// 		this.lastNeed = 0;
// 		this.lastTotal = 0;
// 		this.lastChar = Buffer.allocUnsafe(nb);
// 	}
	
// 	StringDecoder.prototype.write = function (buf) {
// 		if (buf.length === 0) return '';
// 		var r;
// 		var i;
// 		if (this.lastNeed) {
// 			r = this.fillLast(buf);
// 			if (r === undefined) return '';
// 			i = this.lastNeed;
// 			this.lastNeed = 0;
// 		} else {
// 			i = 0;
// 		}
// 		if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
// 		return r || '';
// 	};
	
// 	StringDecoder.prototype.end = utf8End;
	
// 	// Returns only complete characters in a Buffer
// 	StringDecoder.prototype.text = utf8Text;
	
// 	// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
// 	StringDecoder.prototype.fillLast = function (buf) {
// 		if (this.lastNeed <= buf.length) {
// 			buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
// 			return this.lastChar.toString(this.encoding, 0, this.lastTotal);
// 		}
// 		buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
// 		this.lastNeed -= buf.length;
// 	};
	
// 	// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// 	// continuation byte. If an invalid byte is detected, -2 is returned.
// 	function utf8CheckByte(byte) {
// 		if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
// 		return byte >> 6 === 0x02 ? -1 : -2;
// 	}
	
// 	// Checks at most 3 bytes at the end of a Buffer in order to detect an
// 	// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// 	// needed to complete the UTF-8 character (if applicable) are returned.
// 	function utf8CheckIncomplete(self, buf, i) {
// 		var j = buf.length - 1;
// 		if (j < i) return 0;
// 		var nb = utf8CheckByte(buf[j]);
// 		if (nb >= 0) {
// 			if (nb > 0) self.lastNeed = nb - 1;
// 			return nb;
// 		}
// 		if (--j < i || nb === -2) return 0;
// 		nb = utf8CheckByte(buf[j]);
// 		if (nb >= 0) {
// 			if (nb > 0) self.lastNeed = nb - 2;
// 			return nb;
// 		}
// 		if (--j < i || nb === -2) return 0;
// 		nb = utf8CheckByte(buf[j]);
// 		if (nb >= 0) {
// 			if (nb > 0) {
// 				if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
// 			}
// 			return nb;
// 		}
// 		return 0;
// 	}
	
// 	// Validates as many continuation bytes for a multi-byte UTF-8 character as
// 	// needed or are available. If we see a non-continuation byte where we expect
// 	// one, we "replace" the validated continuation bytes we've seen so far with
// 	// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// 	// behavior. The continuation byte check is included three times in the case
// 	// where all of the continuation bytes for a character exist in the same buffer.
// 	// It is also done this way as a slight performance increase instead of using a
// 	// loop.
// 	function utf8CheckExtraBytes(self, buf, p) {
// 		if ((buf[0] & 0xC0) !== 0x80) {
// 			self.lastNeed = 0;
// 			return '\ufffd';
// 		}
// 		if (self.lastNeed > 1 && buf.length > 1) {
// 			if ((buf[1] & 0xC0) !== 0x80) {
// 				self.lastNeed = 1;
// 				return '\ufffd';
// 			}
// 			if (self.lastNeed > 2 && buf.length > 2) {
// 				if ((buf[2] & 0xC0) !== 0x80) {
// 					self.lastNeed = 2;
// 					return '\ufffd';
// 				}
// 			}
// 		}
// 	}
	
// 	// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
// 	function utf8FillLast(buf) {
// 		var p = this.lastTotal - this.lastNeed;
// 		var r = utf8CheckExtraBytes(this, buf, p);
// 		if (r !== undefined) return r;
// 		if (this.lastNeed <= buf.length) {
// 			buf.copy(this.lastChar, p, 0, this.lastNeed);
// 			return this.lastChar.toString(this.encoding, 0, this.lastTotal);
// 		}
// 		buf.copy(this.lastChar, p, 0, buf.length);
// 		this.lastNeed -= buf.length;
// 	}
	
// 	// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// 	// partial character, the character's bytes are buffered until the required
// 	// number of bytes are available.
// 	function utf8Text(buf, i) {
// 		var total = utf8CheckIncomplete(this, buf, i);
// 		if (!this.lastNeed) return buf.toString('utf8', i);
// 		this.lastTotal = total;
// 		var end = buf.length - (total - this.lastNeed);
// 		buf.copy(this.lastChar, 0, end);
// 		return buf.toString('utf8', i, end);
// 	}
	
// 	// For UTF-8, a replacement character is added when ending on a partial
// 	// character.
// 	function utf8End(buf) {
// 		var r = buf && buf.length ? this.write(buf) : '';
// 		if (this.lastNeed) return r + '\ufffd';
// 		return r;
// 	}
	
// 	// UTF-16LE typically needs two bytes per character, but even if we have an even
// 	// number of bytes available, we need to check if we end on a leading/high
// 	// surrogate. In that case, we need to wait for the next two bytes in order to
// 	// decode the last character properly.
// 	function utf16Text(buf, i) {
// 		if ((buf.length - i) % 2 === 0) {
// 			var r = buf.toString('utf16le', i);
// 			if (r) {
// 				var c = r.charCodeAt(r.length - 1);
// 				if (c >= 0xD800 && c <= 0xDBFF) {
// 					this.lastNeed = 2;
// 					this.lastTotal = 4;
// 					this.lastChar[0] = buf[buf.length - 2];
// 					this.lastChar[1] = buf[buf.length - 1];
// 					return r.slice(0, -1);
// 				}
// 			}
// 			return r;
// 		}
// 		this.lastNeed = 1;
// 		this.lastTotal = 2;
// 		this.lastChar[0] = buf[buf.length - 1];
// 		return buf.toString('utf16le', i, buf.length - 1);
// 	}
	
// 	// For UTF-16LE we do not explicitly append special replacement characters if we
// 	// end on a partial character, we simply let v8 handle that.
// 	function utf16End(buf) {
// 		var r = buf && buf.length ? this.write(buf) : '';
// 		if (this.lastNeed) {
// 			var end = this.lastTotal - this.lastNeed;
// 			return r + this.lastChar.toString('utf16le', 0, end);
// 		}
// 		return r;
// 	}
	
// 	function base64Text(buf, i) {
// 		var n = (buf.length - i) % 3;
// 		if (n === 0) return buf.toString('base64', i);
// 		this.lastNeed = 3 - n;
// 		this.lastTotal = 3;
// 		if (n === 1) {
// 			this.lastChar[0] = buf[buf.length - 1];
// 		} else {
// 			this.lastChar[0] = buf[buf.length - 2];
// 			this.lastChar[1] = buf[buf.length - 1];
// 		}
// 		return buf.toString('base64', i, buf.length - n);
// 	}
	
// 	function base64End(buf) {
// 		var r = buf && buf.length ? this.write(buf) : '';
// 		if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
// 		return r;
// 	}
	
// 	// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
// 	function simpleWrite(buf) {
// 		return buf.toString(this.encoding);
// 	}
	
// 	function simpleEnd(buf) {
// 		return buf && buf.length ? this.write(buf) : '';
// 	}
// 	},{"safe-buffer":110}],108:[function(require,module,exports){
// 	exports = module.exports = require('./lib/_stream_readable.js');
// 	exports.Stream = exports;
// 	exports.Readable = exports;
// 	exports.Writable = require('./lib/_stream_writable.js');
// 	exports.Duplex = require('./lib/_stream_duplex.js');
// 	exports.Transform = require('./lib/_stream_transform.js');
// 	exports.PassThrough = require('./lib/_stream_passthrough.js');
	
// 	},{"./lib/_stream_duplex.js":98,"./lib/_stream_passthrough.js":99,"./lib/_stream_readable.js":100,"./lib/_stream_transform.js":101,"./lib/_stream_writable.js":102}],109:[function(require,module,exports){
// 	'use strict'
	
// 	function ReInterval (callback, interval, args) {
// 		var self = this;
	
// 		this._callback = callback;
// 		this._args = args;
	
// 		this._interval = setInterval(callback, interval, this._args);
	
// 		this.reschedule = function (interval) {
// 			// if no interval entered, use the interval passed in on creation
// 			if (!interval)
// 				interval = self._interval;
	
// 			if (self._interval)
// 				clearInterval(self._interval);
// 			self._interval = setInterval(self._callback, interval, self._args);
// 		};
	
// 		this.clear = function () {
// 			if (self._interval) {
// 				clearInterval(self._interval);
// 				self._interval = undefined;
// 			}
// 		};
		
// 		this.destroy = function () {
// 			if (self._interval) {
// 				clearInterval(self._interval);
// 			}
// 			self._callback = undefined;
// 			self._interval = undefined;
// 			self._args = undefined;
// 		};
// 	}
	
// 	function reInterval () {
// 		if (typeof arguments[0] !== 'function')
// 			throw new Error('callback needed');
// 		if (typeof arguments[1] !== 'number')
// 			throw new Error('interval needed');
	
// 		var args;
	
// 		if (arguments.length > 0) {
// 			args = new Array(arguments.length - 2);
	
// 			for (var i = 0; i < args.length; i++) {
// 				args[i] = arguments[i + 2];
// 			}
// 		}
	
// 		return new ReInterval(arguments[0], arguments[1], args);
// 	}
	
// 	module.exports = reInterval;
	
// 	},{}],110:[function(require,module,exports){
// 	/* eslint-disable node/no-deprecated-api */
// 	var buffer = require('buffer')
// 	var Buffer = buffer.Buffer
	
// 	// alternative to using Object.keys for old browsers
// 	function copyProps (src, dst) {
// 		for (var key in src) {
// 			dst[key] = src[key]
// 		}
// 	}
// 	if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
// 		module.exports = buffer
// 	} else {
// 		// Copy properties from require('buffer')
// 		copyProps(buffer, exports)
// 		exports.Buffer = SafeBuffer
// 	}
	
// 	function SafeBuffer (arg, encodingOrOffset, length) {
// 		return Buffer(arg, encodingOrOffset, length)
// 	}
	
// 	// Copy static methods from Buffer
// 	copyProps(Buffer, SafeBuffer)
	
// 	SafeBuffer.from = function (arg, encodingOrOffset, length) {
// 		if (typeof arg === 'number') {
// 			throw new TypeError('Argument must not be a number')
// 		}
// 		return Buffer(arg, encodingOrOffset, length)
// 	}
	
// 	SafeBuffer.alloc = function (size, fill, encoding) {
// 		if (typeof size !== 'number') {
// 			throw new TypeError('Argument must be a number')
// 		}
// 		var buf = Buffer(size)
// 		if (fill !== undefined) {
// 			if (typeof encoding === 'string') {
// 				buf.fill(fill, encoding)
// 			} else {
// 				buf.fill(fill)
// 			}
// 		} else {
// 			buf.fill(0)
// 		}
// 		return buf
// 	}
	
// 	SafeBuffer.allocUnsafe = function (size) {
// 		if (typeof size !== 'number') {
// 			throw new TypeError('Argument must be a number')
// 		}
// 		return Buffer(size)
// 	}
	
// 	SafeBuffer.allocUnsafeSlow = function (size) {
// 		if (typeof size !== 'number') {
// 			throw new TypeError('Argument must be a number')
// 		}
// 		return buffer.SlowBuffer(size)
// 	}
	
// 	},{"buffer":12}],111:[function(require,module,exports){
// 	module.exports = shift
	
// 	function shift (stream) {
// 		var rs = stream._readableState
// 		if (!rs) return null
// 		return rs.objectMode ? stream.read() : stream.read(getStateLength(rs))
// 	}
	
// 	function getStateLength (state) {
// 		if (state.buffer.length) {
// 			// Since node 6.3.0 state.buffer is a BufferList not an array
// 			if (state.buffer.head) {
// 				return state.buffer.head.data.length
// 			}
	
// 			return state.buffer[0].length
// 		}
	
// 		return state.length
// 	}
	
// 	},{}],112:[function(require,module,exports){
// 	(function (setImmediate,clearImmediate){
// 	var nextTick = require('process/browser.js').nextTick;
// 	var apply = Function.prototype.apply;
// 	var slice = Array.prototype.slice;
// 	var immediateIds = {};
// 	var nextImmediateId = 0;
	
// 	// DOM APIs, for completeness
	
// 	exports.setTimeout = function() {
// 		return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
// 	};
// 	exports.setInterval = function() {
// 		return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
// 	};
// 	exports.clearTimeout =
// 	exports.clearInterval = function(timeout) { timeout.close(); };
	
// 	function Timeout(id, clearFn) {
// 		this._id = id;
// 		this._clearFn = clearFn;
// 	}
// 	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
// 	Timeout.prototype.close = function() {
// 		this._clearFn.call(window, this._id);
// 	};
	
// 	// Does not start the time, just sets up the members needed.
// 	exports.enroll = function(item, msecs) {
// 		clearTimeout(item._idleTimeoutId);
// 		item._idleTimeout = msecs;
// 	};
	
// 	exports.unenroll = function(item) {
// 		clearTimeout(item._idleTimeoutId);
// 		item._idleTimeout = -1;
// 	};
	
// 	exports._unrefActive = exports.active = function(item) {
// 		clearTimeout(item._idleTimeoutId);
	
// 		var msecs = item._idleTimeout;
// 		if (msecs >= 0) {
// 			item._idleTimeoutId = setTimeout(function onTimeout() {
// 				if (item._onTimeout)
// 					item._onTimeout();
// 			}, msecs);
// 		}
// 	};
	
// 	// That's not how node.js implements it but the exposed api is the same.
// 	exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
// 		var id = nextImmediateId++;
// 		var args = arguments.length < 2 ? false : slice.call(arguments, 1);
	
// 		immediateIds[id] = true;
	
// 		nextTick(function onNextTick() {
// 			if (immediateIds[id]) {
// 				// fn.call() is faster so we optimize for the common use-case
// 				// @see http://jsperf.com/call-apply-segu
// 				if (args) {
// 					fn.apply(null, args);
// 				} else {
// 					fn.call(null);
// 				}
// 				// Prevent ids from leaking
// 				exports.clearImmediate(id);
// 			}
// 		});
	
// 		return id;
// 	};
	
// 	exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
// 		delete immediateIds[id];
// 	};
// 	}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
// 	},{"process/browser.js":92,"timers":112}],113:[function(require,module,exports){
// 	// Copyright Joyent, Inc. and other Node contributors.
// 	//
// 	// Permission is hereby granted, free of charge, to any person obtaining a
// 	// copy of this software and associated documentation files (the
// 	// "Software"), to deal in the Software without restriction, including
// 	// without limitation the rights to use, copy, modify, merge, publish,
// 	// distribute, sublicense, and/or sell copies of the Software, and to permit
// 	// persons to whom the Software is furnished to do so, subject to the
// 	// following conditions:
// 	//
// 	// The above copyright notice and this permission notice shall be included
// 	// in all copies or substantial portions of the Software.
// 	//
// 	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// 	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// 	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// 	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// 	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// 	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// 	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
// 	'use strict';
	
// 	var punycode = require('punycode');
// 	var util = require('./util');
	
// 	exports.parse = urlParse;
// 	exports.resolve = urlResolve;
// 	exports.resolveObject = urlResolveObject;
// 	exports.format = urlFormat;
	
// 	exports.Url = Url;
	
// 	function Url() {
// 		this.protocol = null;
// 		this.slashes = null;
// 		this.auth = null;
// 		this.host = null;
// 		this.port = null;
// 		this.hostname = null;
// 		this.hash = null;
// 		this.search = null;
// 		this.query = null;
// 		this.pathname = null;
// 		this.path = null;
// 		this.href = null;
// 	}
	
// 	// Reference: RFC 3986, RFC 1808, RFC 2396
	
// 	// define these here so at least they only have to be
// 	// compiled once on the first module load.
// 	var protocolPattern = /^([a-z0-9.+-]+:)/i,
// 			portPattern = /:[0-9]*$/,
	
// 			// Special case for a simple path URL
// 			simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,
	
// 			// RFC 2396: characters reserved for delimiting URLs.
// 			// We actually just auto-escape these.
// 			delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],
	
// 			// RFC 2396: characters not allowed for various reasons.
// 			unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),
	
// 			// Allowed by RFCs, but cause of XSS attacks.  Always escape these.
// 			autoEscape = ['\''].concat(unwise),
// 			// Characters that are never ever allowed in a hostname.
// 			// Note that any invalid chars are also handled, but these
// 			// are the ones that are *expected* to be seen, so we fast-path
// 			// them.
// 			nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
// 			hostEndingChars = ['/', '?', '#'],
// 			hostnameMaxLen = 255,
// 			hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
// 			hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
// 			// protocols that can allow "unsafe" and "unwise" chars.
// 			unsafeProtocol = {
// 				'javascript': true,
// 				'javascript:': true
// 			},
// 			// protocols that never have a hostname.
// 			hostlessProtocol = {
// 				'javascript': true,
// 				'javascript:': true
// 			},
// 			// protocols that always contain a // bit.
// 			slashedProtocol = {
// 				'http': true,
// 				'https': true,
// 				'ftp': true,
// 				'gopher': true,
// 				'file': true,
// 				'http:': true,
// 				'https:': true,
// 				'ftp:': true,
// 				'gopher:': true,
// 				'file:': true
// 			},
// 			querystring = require('querystring');
	
// 	function urlParse(url, parseQueryString, slashesDenoteHost) {
// 		if (url && util.isObject(url) && url instanceof Url) return url;
	
// 		var u = new Url;
// 		u.parse(url, parseQueryString, slashesDenoteHost);
// 		return u;
// 	}
	
// 	Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
// 		if (!util.isString(url)) {
// 			throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
// 		}
	
// 		// Copy chrome, IE, opera backslash-handling behavior.
// 		// Back slashes before the query string get converted to forward slashes
// 		// See: https://code.google.com/p/chromium/issues/detail?id=25916
// 		var queryIndex = url.indexOf('?'),
// 				splitter =
// 						(queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
// 				uSplit = url.split(splitter),
// 				slashRegex = /\\/g;
// 		uSplit[0] = uSplit[0].replace(slashRegex, '/');
// 		url = uSplit.join(splitter);
	
// 		var rest = url;
	
// 		// trim before proceeding.
// 		// This is to support parse stuff like "  http://foo.com  \n"
// 		rest = rest.trim();
	
// 		if (!slashesDenoteHost && url.split('#').length === 1) {
// 			// Try fast path regexp
// 			var simplePath = simplePathPattern.exec(rest);
// 			if (simplePath) {
// 				this.path = rest;
// 				this.href = rest;
// 				this.pathname = simplePath[1];
// 				if (simplePath[2]) {
// 					this.search = simplePath[2];
// 					if (parseQueryString) {
// 						this.query = querystring.parse(this.search.substr(1));
// 					} else {
// 						this.query = this.search.substr(1);
// 					}
// 				} else if (parseQueryString) {
// 					this.search = '';
// 					this.query = {};
// 				}
// 				return this;
// 			}
// 		}
	
// 		var proto = protocolPattern.exec(rest);
// 		if (proto) {
// 			proto = proto[0];
// 			var lowerProto = proto.toLowerCase();
// 			this.protocol = lowerProto;
// 			rest = rest.substr(proto.length);
// 		}
	
// 		// figure out if it's got a host
// 		// user@server is *always* interpreted as a hostname, and url
// 		// resolution will treat //foo/bar as host=foo,path=bar because that's
// 		// how the browser resolves relative URLs.
// 		if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
// 			var slashes = rest.substr(0, 2) === '//';
// 			if (slashes && !(proto && hostlessProtocol[proto])) {
// 				rest = rest.substr(2);
// 				this.slashes = true;
// 			}
// 		}
	
// 		if (!hostlessProtocol[proto] &&
// 				(slashes || (proto && !slashedProtocol[proto]))) {
	
// 			// there's a hostname.
// 			// the first instance of /, ?, ;, or # ends the host.
// 			//
// 			// If there is an @ in the hostname, then non-host chars *are* allowed
// 			// to the left of the last @ sign, unless some host-ending character
// 			// comes *before* the @-sign.
// 			// URLs are obnoxious.
// 			//
// 			// ex:
// 			// http://a@b@c/ => user:a@b host:c
// 			// http://a@b?@c => user:a host:c path:/?@c
	
// 			// v0.12 TODO(isaacs): This is not quite how Chrome does things.
// 			// Review our test case against browsers more comprehensively.
	
// 			// find the first instance of any hostEndingChars
// 			var hostEnd = -1;
// 			for (var i = 0; i < hostEndingChars.length; i++) {
// 				var hec = rest.indexOf(hostEndingChars[i]);
// 				if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
// 					hostEnd = hec;
// 			}
	
// 			// at this point, either we have an explicit point where the
// 			// auth portion cannot go past, or the last @ char is the decider.
// 			var auth, atSign;
// 			if (hostEnd === -1) {
// 				// atSign can be anywhere.
// 				atSign = rest.lastIndexOf('@');
// 			} else {
// 				// atSign must be in auth portion.
// 				// http://a@b/c@d => host:b auth:a path:/c@d
// 				atSign = rest.lastIndexOf('@', hostEnd);
// 			}
	
// 			// Now we have a portion which is definitely the auth.
// 			// Pull that off.
// 			if (atSign !== -1) {
// 				auth = rest.slice(0, atSign);
// 				rest = rest.slice(atSign + 1);
// 				this.auth = decodeURIComponent(auth);
// 			}
	
// 			// the host is the remaining to the left of the first non-host char
// 			hostEnd = -1;
// 			for (var i = 0; i < nonHostChars.length; i++) {
// 				var hec = rest.indexOf(nonHostChars[i]);
// 				if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
// 					hostEnd = hec;
// 			}
// 			// if we still have not hit it, then the entire thing is a host.
// 			if (hostEnd === -1)
// 				hostEnd = rest.length;
	
// 			this.host = rest.slice(0, hostEnd);
// 			rest = rest.slice(hostEnd);
	
// 			// pull out port.
// 			this.parseHost();
	
// 			// we've indicated that there is a hostname,
// 			// so even if it's empty, it has to be present.
// 			this.hostname = this.hostname || '';
	
// 			// if hostname begins with [ and ends with ]
// 			// assume that it's an IPv6 address.
// 			var ipv6Hostname = this.hostname[0] === '[' &&
// 					this.hostname[this.hostname.length - 1] === ']';
	
// 			// validate a little.
// 			if (!ipv6Hostname) {
// 				var hostparts = this.hostname.split(/\./);
// 				for (var i = 0, l = hostparts.length; i < l; i++) {
// 					var part = hostparts[i];
// 					if (!part) continue;
// 					if (!part.match(hostnamePartPattern)) {
// 						var newpart = '';
// 						for (var j = 0, k = part.length; j < k; j++) {
// 							if (part.charCodeAt(j) > 127) {
// 								// we replace non-ASCII char with a temporary placeholder
// 								// we need this to make sure size of hostname is not
// 								// broken by replacing non-ASCII by nothing
// 								newpart += 'x';
// 							} else {
// 								newpart += part[j];
// 							}
// 						}
// 						// we test again with ASCII char only
// 						if (!newpart.match(hostnamePartPattern)) {
// 							var validParts = hostparts.slice(0, i);
// 							var notHost = hostparts.slice(i + 1);
// 							var bit = part.match(hostnamePartStart);
// 							if (bit) {
// 								validParts.push(bit[1]);
// 								notHost.unshift(bit[2]);
// 							}
// 							if (notHost.length) {
// 								rest = '/' + notHost.join('.') + rest;
// 							}
// 							this.hostname = validParts.join('.');
// 							break;
// 						}
// 					}
// 				}
// 			}
	
// 			if (this.hostname.length > hostnameMaxLen) {
// 				this.hostname = '';
// 			} else {
// 				// hostnames are always lower case.
// 				this.hostname = this.hostname.toLowerCase();
// 			}
	
// 			if (!ipv6Hostname) {
// 				// IDNA Support: Returns a punycoded representation of "domain".
// 				// It only converts parts of the domain name that
// 				// have non-ASCII characters, i.e. it doesn't matter if
// 				// you call it with a domain that already is ASCII-only.
// 				this.hostname = punycode.toASCII(this.hostname);
// 			}
	
// 			var p = this.port ? ':' + this.port : '';
// 			var h = this.hostname || '';
// 			this.host = h + p;
// 			this.href += this.host;
	
// 			// strip [ and ] from the hostname
// 			// the host field still retains them, though
// 			if (ipv6Hostname) {
// 				this.hostname = this.hostname.substr(1, this.hostname.length - 2);
// 				if (rest[0] !== '/') {
// 					rest = '/' + rest;
// 				}
// 			}
// 		}
	
// 		// now rest is set to the post-host stuff.
// 		// chop off any delim chars.
// 		if (!unsafeProtocol[lowerProto]) {
	
// 			// First, make 100% sure that any "autoEscape" chars get
// 			// escaped, even if encodeURIComponent doesn't think they
// 			// need to be.
// 			for (var i = 0, l = autoEscape.length; i < l; i++) {
// 				var ae = autoEscape[i];
// 				if (rest.indexOf(ae) === -1)
// 					continue;
// 				var esc = encodeURIComponent(ae);
// 				if (esc === ae) {
// 					esc = escape(ae);
// 				}
// 				rest = rest.split(ae).join(esc);
// 			}
// 		}
	
	
// 		// chop off from the tail first.
// 		var hash = rest.indexOf('#');
// 		if (hash !== -1) {
// 			// got a fragment string.
// 			this.hash = rest.substr(hash);
// 			rest = rest.slice(0, hash);
// 		}
// 		var qm = rest.indexOf('?');
// 		if (qm !== -1) {
// 			this.search = rest.substr(qm);
// 			this.query = rest.substr(qm + 1);
// 			if (parseQueryString) {
// 				this.query = querystring.parse(this.query);
// 			}
// 			rest = rest.slice(0, qm);
// 		} else if (parseQueryString) {
// 			// no query string, but parseQueryString still requested
// 			this.search = '';
// 			this.query = {};
// 		}
// 		if (rest) this.pathname = rest;
// 		if (slashedProtocol[lowerProto] &&
// 				this.hostname && !this.pathname) {
// 			this.pathname = '/';
// 		}
	
// 		//to support http.request
// 		if (this.pathname || this.search) {
// 			var p = this.pathname || '';
// 			var s = this.search || '';
// 			this.path = p + s;
// 		}
	
// 		// finally, reconstruct the href based on what has been validated.
// 		this.href = this.format();
// 		return this;
// 	};
	
// 	// format a parsed object into a url string
// 	function urlFormat(obj) {
// 		// ensure it's an object, and not a string url.
// 		// If it's an obj, this is a no-op.
// 		// this way, you can call url_format() on strings
// 		// to clean up potentially wonky urls.
// 		if (util.isString(obj)) obj = urlParse(obj);
// 		if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
// 		return obj.format();
// 	}
	
// 	Url.prototype.format = function() {
// 		var auth = this.auth || '';
// 		if (auth) {
// 			auth = encodeURIComponent(auth);
// 			auth = auth.replace(/%3A/i, ':');
// 			auth += '@';
// 		}
	
// 		var protocol = this.protocol || '',
// 				pathname = this.pathname || '',
// 				hash = this.hash || '',
// 				host = false,
// 				query = '';
	
// 		if (this.host) {
// 			host = auth + this.host;
// 		} else if (this.hostname) {
// 			host = auth + (this.hostname.indexOf(':') === -1 ?
// 					this.hostname :
// 					'[' + this.hostname + ']');
// 			if (this.port) {
// 				host += ':' + this.port;
// 			}
// 		}
	
// 		if (this.query &&
// 				util.isObject(this.query) &&
// 				Object.keys(this.query).length) {
// 			query = querystring.stringify(this.query);
// 		}
	
// 		var search = this.search || (query && ('?' + query)) || '';
	
// 		if (protocol && protocol.substr(-1) !== ':') protocol += ':';
	
// 		// only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
// 		// unless they had them to begin with.
// 		if (this.slashes ||
// 				(!protocol || slashedProtocol[protocol]) && host !== false) {
// 			host = '//' + (host || '');
// 			if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
// 		} else if (!host) {
// 			host = '';
// 		}
	
// 		if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
// 		if (search && search.charAt(0) !== '?') search = '?' + search;
	
// 		pathname = pathname.replace(/[?#]/g, function(match) {
// 			return encodeURIComponent(match);
// 		});
// 		search = search.replace('#', '%23');
	
// 		return protocol + host + pathname + search + hash;
// 	};
	
// 	function urlResolve(source, relative) {
// 		return urlParse(source, false, true).resolve(relative);
// 	}
	
// 	Url.prototype.resolve = function(relative) {
// 		return this.resolveObject(urlParse(relative, false, true)).format();
// 	};
	
// 	function urlResolveObject(source, relative) {
// 		if (!source) return relative;
// 		return urlParse(source, false, true).resolveObject(relative);
// 	}
	
// 	Url.prototype.resolveObject = function(relative) {
// 		if (util.isString(relative)) {
// 			var rel = new Url();
// 			rel.parse(relative, false, true);
// 			relative = rel;
// 		}
	
// 		var result = new Url();
// 		var tkeys = Object.keys(this);
// 		for (var tk = 0; tk < tkeys.length; tk++) {
// 			var tkey = tkeys[tk];
// 			result[tkey] = this[tkey];
// 		}
	
// 		// hash is always overridden, no matter what.
// 		// even href="" will remove it.
// 		result.hash = relative.hash;
	
// 		// if the relative url is empty, then there's nothing left to do here.
// 		if (relative.href === '') {
// 			result.href = result.format();
// 			return result;
// 		}
	
// 		// hrefs like //foo/bar always cut to the protocol.
// 		if (relative.slashes && !relative.protocol) {
// 			// take everything except the protocol from relative
// 			var rkeys = Object.keys(relative);
// 			for (var rk = 0; rk < rkeys.length; rk++) {
// 				var rkey = rkeys[rk];
// 				if (rkey !== 'protocol')
// 					result[rkey] = relative[rkey];
// 			}
	
// 			//urlParse appends trailing / to urls like http://www.example.com
// 			if (slashedProtocol[result.protocol] &&
// 					result.hostname && !result.pathname) {
// 				result.path = result.pathname = '/';
// 			}
	
// 			result.href = result.format();
// 			return result;
// 		}
	
// 		if (relative.protocol && relative.protocol !== result.protocol) {
// 			// if it's a known url protocol, then changing
// 			// the protocol does weird things
// 			// first, if it's not file:, then we MUST have a host,
// 			// and if there was a path
// 			// to begin with, then we MUST have a path.
// 			// if it is file:, then the host is dropped,
// 			// because that's known to be hostless.
// 			// anything else is assumed to be absolute.
// 			if (!slashedProtocol[relative.protocol]) {
// 				var keys = Object.keys(relative);
// 				for (var v = 0; v < keys.length; v++) {
// 					var k = keys[v];
// 					result[k] = relative[k];
// 				}
// 				result.href = result.format();
// 				return result;
// 			}
	
// 			result.protocol = relative.protocol;
// 			if (!relative.host && !hostlessProtocol[relative.protocol]) {
// 				var relPath = (relative.pathname || '').split('/');
// 				while (relPath.length && !(relative.host = relPath.shift()));
// 				if (!relative.host) relative.host = '';
// 				if (!relative.hostname) relative.hostname = '';
// 				if (relPath[0] !== '') relPath.unshift('');
// 				if (relPath.length < 2) relPath.unshift('');
// 				result.pathname = relPath.join('/');
// 			} else {
// 				result.pathname = relative.pathname;
// 			}
// 			result.search = relative.search;
// 			result.query = relative.query;
// 			result.host = relative.host || '';
// 			result.auth = relative.auth;
// 			result.hostname = relative.hostname || relative.host;
// 			result.port = relative.port;
// 			// to support http.request
// 			if (result.pathname || result.search) {
// 				var p = result.pathname || '';
// 				var s = result.search || '';
// 				result.path = p + s;
// 			}
// 			result.slashes = result.slashes || relative.slashes;
// 			result.href = result.format();
// 			return result;
// 		}
	
// 		var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
// 				isRelAbs = (
// 						relative.host ||
// 						relative.pathname && relative.pathname.charAt(0) === '/'
// 				),
// 				mustEndAbs = (isRelAbs || isSourceAbs ||
// 											(result.host && relative.pathname)),
// 				removeAllDots = mustEndAbs,
// 				srcPath = result.pathname && result.pathname.split('/') || [],
// 				relPath = relative.pathname && relative.pathname.split('/') || [],
// 				psychotic = result.protocol && !slashedProtocol[result.protocol];
	
// 		// if the url is a non-slashed url, then relative
// 		// links like ../.. should be able
// 		// to crawl up to the hostname, as well.  This is strange.
// 		// result.protocol has already been set by now.
// 		// Later on, put the first path part into the host field.
// 		if (psychotic) {
// 			result.hostname = '';
// 			result.port = null;
// 			if (result.host) {
// 				if (srcPath[0] === '') srcPath[0] = result.host;
// 				else srcPath.unshift(result.host);
// 			}
// 			result.host = '';
// 			if (relative.protocol) {
// 				relative.hostname = null;
// 				relative.port = null;
// 				if (relative.host) {
// 					if (relPath[0] === '') relPath[0] = relative.host;
// 					else relPath.unshift(relative.host);
// 				}
// 				relative.host = null;
// 			}
// 			mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
// 		}
	
// 		if (isRelAbs) {
// 			// it's absolute.
// 			result.host = (relative.host || relative.host === '') ?
// 										relative.host : result.host;
// 			result.hostname = (relative.hostname || relative.hostname === '') ?
// 												relative.hostname : result.hostname;
// 			result.search = relative.search;
// 			result.query = relative.query;
// 			srcPath = relPath;
// 			// fall through to the dot-handling below.
// 		} else if (relPath.length) {
// 			// it's relative
// 			// throw away the existing file, and take the new path instead.
// 			if (!srcPath) srcPath = [];
// 			srcPath.pop();
// 			srcPath = srcPath.concat(relPath);
// 			result.search = relative.search;
// 			result.query = relative.query;
// 		} else if (!util.isNullOrUndefined(relative.search)) {
// 			// just pull out the search.
// 			// like href='?foo'.
// 			// Put this after the other two cases because it simplifies the booleans
// 			if (psychotic) {
// 				result.hostname = result.host = srcPath.shift();
// 				//occationaly the auth can get stuck only in host
// 				//this especially happens in cases like
// 				//url.resolveObject('mailto:local1@domain1', 'local2@domain2')
// 				var authInHost = result.host && result.host.indexOf('@') > 0 ?
// 												 result.host.split('@') : false;
// 				if (authInHost) {
// 					result.auth = authInHost.shift();
// 					result.host = result.hostname = authInHost.shift();
// 				}
// 			}
// 			result.search = relative.search;
// 			result.query = relative.query;
// 			//to support http.request
// 			if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
// 				result.path = (result.pathname ? result.pathname : '') +
// 											(result.search ? result.search : '');
// 			}
// 			result.href = result.format();
// 			return result;
// 		}
	
// 		if (!srcPath.length) {
// 			// no path at all.  easy.
// 			// we've already handled the other stuff above.
// 			result.pathname = null;
// 			//to support http.request
// 			if (result.search) {
// 				result.path = '/' + result.search;
// 			} else {
// 				result.path = null;
// 			}
// 			result.href = result.format();
// 			return result;
// 		}
	
// 		// if a url ENDs in . or .., then it must get a trailing slash.
// 		// however, if it ends in anything else non-slashy,
// 		// then it must NOT get a trailing slash.
// 		var last = srcPath.slice(-1)[0];
// 		var hasTrailingSlash = (
// 				(result.host || relative.host || srcPath.length > 1) &&
// 				(last === '.' || last === '..') || last === '');
	
// 		// strip single dots, resolve double dots to parent dir
// 		// if the path tries to go above the root, `up` ends up > 0
// 		var up = 0;
// 		for (var i = srcPath.length; i >= 0; i--) {
// 			last = srcPath[i];
// 			if (last === '.') {
// 				srcPath.splice(i, 1);
// 			} else if (last === '..') {
// 				srcPath.splice(i, 1);
// 				up++;
// 			} else if (up) {
// 				srcPath.splice(i, 1);
// 				up--;
// 			}
// 		}
	
// 		// if the path is allowed to go above the root, restore leading ..s
// 		if (!mustEndAbs && !removeAllDots) {
// 			for (; up--; up) {
// 				srcPath.unshift('..');
// 			}
// 		}
	
// 		if (mustEndAbs && srcPath[0] !== '' &&
// 				(!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
// 			srcPath.unshift('');
// 		}
	
// 		if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
// 			srcPath.push('');
// 		}
	
// 		var isAbsolute = srcPath[0] === '' ||
// 				(srcPath[0] && srcPath[0].charAt(0) === '/');
	
// 		// put the host back
// 		if (psychotic) {
// 			result.hostname = result.host = isAbsolute ? '' :
// 																			srcPath.length ? srcPath.shift() : '';
// 			//occationaly the auth can get stuck only in host
// 			//this especially happens in cases like
// 			//url.resolveObject('mailto:local1@domain1', 'local2@domain2')
// 			var authInHost = result.host && result.host.indexOf('@') > 0 ?
// 											 result.host.split('@') : false;
// 			if (authInHost) {
// 				result.auth = authInHost.shift();
// 				result.host = result.hostname = authInHost.shift();
// 			}
// 		}
	
// 		mustEndAbs = mustEndAbs || (result.host && srcPath.length);
	
// 		if (mustEndAbs && !isAbsolute) {
// 			srcPath.unshift('');
// 		}
	
// 		if (!srcPath.length) {
// 			result.pathname = null;
// 			result.path = null;
// 		} else {
// 			result.pathname = srcPath.join('/');
// 		}
	
// 		//to support request.http
// 		if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
// 			result.path = (result.pathname ? result.pathname : '') +
// 										(result.search ? result.search : '');
// 		}
// 		result.auth = relative.auth || result.auth;
// 		result.slashes = result.slashes || relative.slashes;
// 		result.href = result.format();
// 		return result;
// 	};
	
// 	Url.prototype.parseHost = function() {
// 		var host = this.host;
// 		var port = portPattern.exec(host);
// 		if (port) {
// 			port = port[0];
// 			if (port !== ':') {
// 				this.port = port.substr(1);
// 			}
// 			host = host.substr(0, host.length - port.length);
// 		}
// 		if (host) this.hostname = host;
// 	};
	
// 	},{"./util":114,"punycode":93,"querystring":96}],114:[function(require,module,exports){
// 	'use strict';
	
// 	module.exports = {
// 		isString: function(arg) {
// 			return typeof(arg) === 'string';
// 		},
// 		isObject: function(arg) {
// 			return typeof(arg) === 'object' && arg !== null;
// 		},
// 		isNull: function(arg) {
// 			return arg === null;
// 		},
// 		isNullOrUndefined: function(arg) {
// 			return arg == null;
// 		}
// 	};
	
// 	},{}],115:[function(require,module,exports){
// 	(function (global){
	
// 	/**
// 	 * Module exports.
// 	 */
	
// 	module.exports = deprecate;
	
// 	/**
// 	 * Mark that a method should not be used.
// 	 * Returns a modified function which warns once by default.
// 	 *
// 	 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
// 	 *
// 	 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
// 	 * will throw an Error when invoked.
// 	 *
// 	 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
// 	 * will invoke `console.trace()` instead of `console.error()`.
// 	 *
// 	 * @param {Function} fn - the function to deprecate
// 	 * @param {String} msg - the string to print to the console when `fn` is invoked
// 	 * @returns {Function} a new "deprecated" version of `fn`
// 	 * @api public
// 	 */
	
// 	function deprecate (fn, msg) {
// 		if (config('noDeprecation')) {
// 			return fn;
// 		}
	
// 		var warned = false;
// 		function deprecated() {
// 			if (!warned) {
// 				if (config('throwDeprecation')) {
// 					throw new Error(msg);
// 				} else if (config('traceDeprecation')) {
// 					console.trace(msg);
// 				} else {
// 					console.warn(msg);
// 				}
// 				warned = true;
// 			}
// 			return fn.apply(this, arguments);
// 		}
	
// 		return deprecated;
// 	}
	
// 	/**
// 	 * Checks `localStorage` for boolean values for the given `name`.
// 	 *
// 	 * @param {String} name
// 	 * @returns {Boolean}
// 	 * @api private
// 	 */
	
// 	function config (name) {
// 		// accessing global.localStorage can trigger a DOMException in sandboxed iframes
// 		try {
// 			if (!global.localStorage) return false;
// 		} catch (_) {
// 			return false;
// 		}
// 		var val = global.localStorage[name];
// 		if (null == val) return false;
// 		return String(val).toLowerCase() === 'true';
// 	}
	
// 	}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
// 	},{}],116:[function(require,module,exports){
// 	module.exports = function isBuffer(arg) {
// 		return arg && typeof arg === 'object'
// 			&& typeof arg.copy === 'function'
// 			&& typeof arg.fill === 'function'
// 			&& typeof arg.readUInt8 === 'function';
// 	}
// 	},{}],117:[function(require,module,exports){
// 	(function (process,global){
// 	// Copyright Joyent, Inc. and other Node contributors.
// 	//
// 	// Permission is hereby granted, free of charge, to any person obtaining a
// 	// copy of this software and associated documentation files (the
// 	// "Software"), to deal in the Software without restriction, including
// 	// without limitation the rights to use, copy, modify, merge, publish,
// 	// distribute, sublicense, and/or sell copies of the Software, and to permit
// 	// persons to whom the Software is furnished to do so, subject to the
// 	// following conditions:
// 	//
// 	// The above copyright notice and this permission notice shall be included
// 	// in all copies or substantial portions of the Software.
// 	//
// 	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// 	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// 	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// 	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// 	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// 	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// 	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
// 	var formatRegExp = /%[sdj%]/g;
// 	exports.format = function(f) {
// 		if (!isString(f)) {
// 			var objects = [];
// 			for (var i = 0; i < arguments.length; i++) {
// 				objects.push(inspect(arguments[i]));
// 			}
// 			return objects.join(' ');
// 		}
	
// 		var i = 1;
// 		var args = arguments;
// 		var len = args.length;
// 		var str = String(f).replace(formatRegExp, function(x) {
// 			if (x === '%%') return '%';
// 			if (i >= len) return x;
// 			switch (x) {
// 				case '%s': return String(args[i++]);
// 				case '%d': return Number(args[i++]);
// 				case '%j':
// 					try {
// 						return JSON.stringify(args[i++]);
// 					} catch (_) {
// 						return '[Circular]';
// 					}
// 				default:
// 					return x;
// 			}
// 		});
// 		for (var x = args[i]; i < len; x = args[++i]) {
// 			if (isNull(x) || !isObject(x)) {
// 				str += ' ' + x;
// 			} else {
// 				str += ' ' + inspect(x);
// 			}
// 		}
// 		return str;
// 	};
	
	
// 	// Mark that a method should not be used.
// 	// Returns a modified function which warns once by default.
// 	// If --no-deprecation is set, then it is a no-op.
// 	exports.deprecate = function(fn, msg) {
// 		// Allow for deprecating things in the process of starting up.
// 		if (isUndefined(global.process)) {
// 			return function() {
// 				return exports.deprecate(fn, msg).apply(this, arguments);
// 			};
// 		}
	
// 		if (process.noDeprecation === true) {
// 			return fn;
// 		}
	
// 		var warned = false;
// 		function deprecated() {
// 			if (!warned) {
// 				if (process.throwDeprecation) {
// 					throw new Error(msg);
// 				} else if (process.traceDeprecation) {
// 					console.trace(msg);
// 				} else {
// 					console.error(msg);
// 				}
// 				warned = true;
// 			}
// 			return fn.apply(this, arguments);
// 		}
	
// 		return deprecated;
// 	};
	
	
// 	var debugs = {};
// 	var debugEnviron;
// 	exports.debuglog = function(set) {
// 		if (isUndefined(debugEnviron))
// 			debugEnviron = process.env.NODE_DEBUG || '';
// 		set = set.toUpperCase();
// 		if (!debugs[set]) {
// 			if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
// 				var pid = process.pid;
// 				debugs[set] = function() {
// 					var msg = exports.format.apply(exports, arguments);
// 					console.error('%s %d: %s', set, pid, msg);
// 				};
// 			} else {
// 				debugs[set] = function() {};
// 			}
// 		}
// 		return debugs[set];
// 	};
	
	
// 	/**
// 	 * Echos the value of a value. Trys to print the value out
// 	 * in the best way possible given the different types.
// 	 *
// 	 * @param {Object} obj The object to print out.
// 	 * @param {Object} opts Optional options object that alters the output.
// 	 */
// 	/* legacy: obj, showHidden, depth, colors*/
// 	function inspect(obj, opts) {
// 		// default options
// 		var ctx = {
// 			seen: [],
// 			stylize: stylizeNoColor
// 		};
// 		// legacy...
// 		if (arguments.length >= 3) ctx.depth = arguments[2];
// 		if (arguments.length >= 4) ctx.colors = arguments[3];
// 		if (isBoolean(opts)) {
// 			// legacy...
// 			ctx.showHidden = opts;
// 		} else if (opts) {
// 			// got an "options" object
// 			exports._extend(ctx, opts);
// 		}
// 		// set default options
// 		if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
// 		if (isUndefined(ctx.depth)) ctx.depth = 2;
// 		if (isUndefined(ctx.colors)) ctx.colors = false;
// 		if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
// 		if (ctx.colors) ctx.stylize = stylizeWithColor;
// 		return formatValue(ctx, obj, ctx.depth);
// 	}
// 	exports.inspect = inspect;
	
	
// 	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
// 	inspect.colors = {
// 		'bold' : [1, 22],
// 		'italic' : [3, 23],
// 		'underline' : [4, 24],
// 		'inverse' : [7, 27],
// 		'white' : [37, 39],
// 		'grey' : [90, 39],
// 		'black' : [30, 39],
// 		'blue' : [34, 39],
// 		'cyan' : [36, 39],
// 		'green' : [32, 39],
// 		'magenta' : [35, 39],
// 		'red' : [31, 39],
// 		'yellow' : [33, 39]
// 	};
	
// 	// Don't use 'blue' not visible on cmd.exe
// 	inspect.styles = {
// 		'special': 'cyan',
// 		'number': 'yellow',
// 		'boolean': 'yellow',
// 		'undefined': 'grey',
// 		'null': 'bold',
// 		'string': 'green',
// 		'date': 'magenta',
// 		// "name": intentionally not styling
// 		'regexp': 'red'
// 	};
	
	
// 	function stylizeWithColor(str, styleType) {
// 		var style = inspect.styles[styleType];
	
// 		if (style) {
// 			return '\u001b[' + inspect.colors[style][0] + 'm' + str +
// 						 '\u001b[' + inspect.colors[style][1] + 'm';
// 		} else {
// 			return str;
// 		}
// 	}
	
	
// 	function stylizeNoColor(str, styleType) {
// 		return str;
// 	}
	
	
// 	function arrayToHash(array) {
// 		var hash = {};
	
// 		array.forEach(function(val, idx) {
// 			hash[val] = true;
// 		});
	
// 		return hash;
// 	}
	
	
// 	function formatValue(ctx, value, recurseTimes) {
// 		// Provide a hook for user-specified inspect functions.
// 		// Check that value is an object with an inspect function on it
// 		if (ctx.customInspect &&
// 				value &&
// 				isFunction(value.inspect) &&
// 				// Filter out the util module, it's inspect function is special
// 				value.inspect !== exports.inspect &&
// 				// Also filter out any prototype objects using the circular check.
// 				!(value.constructor && value.constructor.prototype === value)) {
// 			var ret = value.inspect(recurseTimes, ctx);
// 			if (!isString(ret)) {
// 				ret = formatValue(ctx, ret, recurseTimes);
// 			}
// 			return ret;
// 		}
	
// 		// Primitive types cannot have properties
// 		var primitive = formatPrimitive(ctx, value);
// 		if (primitive) {
// 			return primitive;
// 		}
	
// 		// Look up the keys of the object.
// 		var keys = Object.keys(value);
// 		var visibleKeys = arrayToHash(keys);
	
// 		if (ctx.showHidden) {
// 			keys = Object.getOwnPropertyNames(value);
// 		}
	
// 		// IE doesn't make error fields non-enumerable
// 		// http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
// 		if (isError(value)
// 				&& (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
// 			return formatError(value);
// 		}
	
// 		// Some type of object without properties can be shortcutted.
// 		if (keys.length === 0) {
// 			if (isFunction(value)) {
// 				var name = value.name ? ': ' + value.name : '';
// 				return ctx.stylize('[Function' + name + ']', 'special');
// 			}
// 			if (isRegExp(value)) {
// 				return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
// 			}
// 			if (isDate(value)) {
// 				return ctx.stylize(Date.prototype.toString.call(value), 'date');
// 			}
// 			if (isError(value)) {
// 				return formatError(value);
// 			}
// 		}
	
// 		var base = '', array = false, braces = ['{', '}'];
	
// 		// Make Array say that they are Array
// 		if (isArray(value)) {
// 			array = true;
// 			braces = ['[', ']'];
// 		}
	
// 		// Make functions say that they are functions
// 		if (isFunction(value)) {
// 			var n = value.name ? ': ' + value.name : '';
// 			base = ' [Function' + n + ']';
// 		}
	
// 		// Make RegExps say that they are RegExps
// 		if (isRegExp(value)) {
// 			base = ' ' + RegExp.prototype.toString.call(value);
// 		}
	
// 		// Make dates with properties first say the date
// 		if (isDate(value)) {
// 			base = ' ' + Date.prototype.toUTCString.call(value);
// 		}
	
// 		// Make error with message first say the error
// 		if (isError(value)) {
// 			base = ' ' + formatError(value);
// 		}
	
// 		if (keys.length === 0 && (!array || value.length == 0)) {
// 			return braces[0] + base + braces[1];
// 		}
	
// 		if (recurseTimes < 0) {
// 			if (isRegExp(value)) {
// 				return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
// 			} else {
// 				return ctx.stylize('[Object]', 'special');
// 			}
// 		}
	
// 		ctx.seen.push(value);
	
// 		var output;
// 		if (array) {
// 			output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
// 		} else {
// 			output = keys.map(function(key) {
// 				return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
// 			});
// 		}
	
// 		ctx.seen.pop();
	
// 		return reduceToSingleString(output, base, braces);
// 	}
	
	
// 	function formatPrimitive(ctx, value) {
// 		if (isUndefined(value))
// 			return ctx.stylize('undefined', 'undefined');
// 		if (isString(value)) {
// 			var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
// 																							 .replace(/'/g, "\\'")
// 																							 .replace(/\\"/g, '"') + '\'';
// 			return ctx.stylize(simple, 'string');
// 		}
// 		if (isNumber(value))
// 			return ctx.stylize('' + value, 'number');
// 		if (isBoolean(value))
// 			return ctx.stylize('' + value, 'boolean');
// 		// For some reason typeof null is "object", so special case here.
// 		if (isNull(value))
// 			return ctx.stylize('null', 'null');
// 	}
	
	
// 	function formatError(value) {
// 		return '[' + Error.prototype.toString.call(value) + ']';
// 	}
	
	
// 	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
// 		var output = [];
// 		for (var i = 0, l = value.length; i < l; ++i) {
// 			if (hasOwnProperty(value, String(i))) {
// 				output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
// 						String(i), true));
// 			} else {
// 				output.push('');
// 			}
// 		}
// 		keys.forEach(function(key) {
// 			if (!key.match(/^\d+$/)) {
// 				output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
// 						key, true));
// 			}
// 		});
// 		return output;
// 	}
	
	
// 	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
// 		var name, str, desc;
// 		desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
// 		if (desc.get) {
// 			if (desc.set) {
// 				str = ctx.stylize('[Getter/Setter]', 'special');
// 			} else {
// 				str = ctx.stylize('[Getter]', 'special');
// 			}
// 		} else {
// 			if (desc.set) {
// 				str = ctx.stylize('[Setter]', 'special');
// 			}
// 		}
// 		if (!hasOwnProperty(visibleKeys, key)) {
// 			name = '[' + key + ']';
// 		}
// 		if (!str) {
// 			if (ctx.seen.indexOf(desc.value) < 0) {
// 				if (isNull(recurseTimes)) {
// 					str = formatValue(ctx, desc.value, null);
// 				} else {
// 					str = formatValue(ctx, desc.value, recurseTimes - 1);
// 				}
// 				if (str.indexOf('\n') > -1) {
// 					if (array) {
// 						str = str.split('\n').map(function(line) {
// 							return '  ' + line;
// 						}).join('\n').substr(2);
// 					} else {
// 						str = '\n' + str.split('\n').map(function(line) {
// 							return '   ' + line;
// 						}).join('\n');
// 					}
// 				}
// 			} else {
// 				str = ctx.stylize('[Circular]', 'special');
// 			}
// 		}
// 		if (isUndefined(name)) {
// 			if (array && key.match(/^\d+$/)) {
// 				return str;
// 			}
// 			name = JSON.stringify('' + key);
// 			if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
// 				name = name.substr(1, name.length - 2);
// 				name = ctx.stylize(name, 'name');
// 			} else {
// 				name = name.replace(/'/g, "\\'")
// 									 .replace(/\\"/g, '"')
// 									 .replace(/(^"|"$)/g, "'");
// 				name = ctx.stylize(name, 'string');
// 			}
// 		}
	
// 		return name + ': ' + str;
// 	}
	
	
// 	function reduceToSingleString(output, base, braces) {
// 		var numLinesEst = 0;
// 		var length = output.reduce(function(prev, cur) {
// 			numLinesEst++;
// 			if (cur.indexOf('\n') >= 0) numLinesEst++;
// 			return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
// 		}, 0);
	
// 		if (length > 60) {
// 			return braces[0] +
// 						 (base === '' ? '' : base + '\n ') +
// 						 ' ' +
// 						 output.join(',\n  ') +
// 						 ' ' +
// 						 braces[1];
// 		}
	
// 		return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
// 	}
	
	
// 	// NOTE: These type checking functions intentionally don't use `instanceof`
// 	// because it is fragile and can be easily faked with `Object.create()`.
// 	function isArray(ar) {
// 		return Array.isArray(ar);
// 	}
// 	exports.isArray = isArray;
	
// 	function isBoolean(arg) {
// 		return typeof arg === 'boolean';
// 	}
// 	exports.isBoolean = isBoolean;
	
// 	function isNull(arg) {
// 		return arg === null;
// 	}
// 	exports.isNull = isNull;
	
// 	function isNullOrUndefined(arg) {
// 		return arg == null;
// 	}
// 	exports.isNullOrUndefined = isNullOrUndefined;
	
// 	function isNumber(arg) {
// 		return typeof arg === 'number';
// 	}
// 	exports.isNumber = isNumber;
	
// 	function isString(arg) {
// 		return typeof arg === 'string';
// 	}
// 	exports.isString = isString;
	
// 	function isSymbol(arg) {
// 		return typeof arg === 'symbol';
// 	}
// 	exports.isSymbol = isSymbol;
	
// 	function isUndefined(arg) {
// 		return arg === void 0;
// 	}
// 	exports.isUndefined = isUndefined;
	
// 	function isRegExp(re) {
// 		return isObject(re) && objectToString(re) === '[object RegExp]';
// 	}
// 	exports.isRegExp = isRegExp;
	
// 	function isObject(arg) {
// 		return typeof arg === 'object' && arg !== null;
// 	}
// 	exports.isObject = isObject;
	
// 	function isDate(d) {
// 		return isObject(d) && objectToString(d) === '[object Date]';
// 	}
// 	exports.isDate = isDate;
	
// 	function isError(e) {
// 		return isObject(e) &&
// 				(objectToString(e) === '[object Error]' || e instanceof Error);
// 	}
// 	exports.isError = isError;
	
// 	function isFunction(arg) {
// 		return typeof arg === 'function';
// 	}
// 	exports.isFunction = isFunction;
	
// 	function isPrimitive(arg) {
// 		return arg === null ||
// 					 typeof arg === 'boolean' ||
// 					 typeof arg === 'number' ||
// 					 typeof arg === 'string' ||
// 					 typeof arg === 'symbol' ||  // ES6 symbol
// 					 typeof arg === 'undefined';
// 	}
// 	exports.isPrimitive = isPrimitive;
	
// 	exports.isBuffer = require('./support/isBuffer');
	
// 	function objectToString(o) {
// 		return Object.prototype.toString.call(o);
// 	}
	
	
// 	function pad(n) {
// 		return n < 10 ? '0' + n.toString(10) : n.toString(10);
// 	}
	
	
// 	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
// 								'Oct', 'Nov', 'Dec'];
	
// 	// 26 Feb 16:19:34
// 	function timestamp() {
// 		var d = new Date();
// 		var time = [pad(d.getHours()),
// 								pad(d.getMinutes()),
// 								pad(d.getSeconds())].join(':');
// 		return [d.getDate(), months[d.getMonth()], time].join(' ');
// 	}
	
	
// 	// log is just a thin wrapper to console.log that prepends a timestamp
// 	exports.log = function() {
// 		console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
// 	};
	
	
// 	/**
// 	 * Inherit the prototype methods from one constructor into another.
// 	 *
// 	 * The Function.prototype.inherits from lang.js rewritten as a standalone
// 	 * function (not on Function.prototype). NOTE: If this file is to be loaded
// 	 * during bootstrapping this function needs to be rewritten using some native
// 	 * functions as prototype setup using normal JavaScript does not work as
// 	 * expected during bootstrapping (see mirror.js in r114903).
// 	 *
// 	 * @param {function} ctor Constructor function which needs to inherit the
// 	 *     prototype.
// 	 * @param {function} superCtor Constructor function to inherit prototype from.
// 	 */
// 	exports.inherits = require('inherits');
	
// 	exports._extend = function(origin, add) {
// 		// Don't do anything if add isn't an object
// 		if (!add || !isObject(add)) return origin;
	
// 		var keys = Object.keys(add);
// 		var i = keys.length;
// 		while (i--) {
// 			origin[keys[i]] = add[keys[i]];
// 		}
// 		return origin;
// 	};
	
// 	function hasOwnProperty(obj, prop) {
// 		return Object.prototype.hasOwnProperty.call(obj, prop);
// 	}
	
// 	}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
// 	},{"./support/isBuffer":116,"_process":92,"inherits":80}],118:[function(require,module,exports){
// 	(function (process,global){
// 	'use strict'
	
// 	var Transform = require('readable-stream').Transform
// 	var duplexify = require('duplexify')
// 	var WS = require('ws')
// 	var Buffer = require('safe-buffer').Buffer
	
// 	module.exports = WebSocketStream
	
// 	function buildProxy (options, socketWrite, socketEnd) {
// 		var proxy = new Transform({
// 			objectMode: options.objectMode
// 		})
	
// 		proxy._write = socketWrite
// 		proxy._flush = socketEnd
	
// 		return proxy
// 	}
	
// 	function WebSocketStream(target, protocols, options) {
// 		var stream, socket
	
// 		var isBrowser = process.title === 'browser'
// 		var isNative = !!global.WebSocket
// 		var socketWrite = isBrowser ? socketWriteBrowser : socketWriteNode
	
// 		if (protocols && !Array.isArray(protocols) && 'object' === typeof protocols) {
// 			// accept the "options" Object as the 2nd argument
// 			options = protocols
// 			protocols = null
	
// 			if (typeof options.protocol === 'string' || Array.isArray(options.protocol)) {
// 				protocols = options.protocol;
// 			}
// 		}
	
// 		if (!options) options = {}
	
// 		if (options.objectMode === undefined) {
// 			options.objectMode = !(options.binary === true || options.binary === undefined)
// 		}
	
// 		var proxy = buildProxy(options, socketWrite, socketEnd)
	
// 		if (!options.objectMode) {
// 			proxy._writev = writev
// 		}
	
// 		// browser only: sets the maximum socket buffer size before throttling
// 		var bufferSize = options.browserBufferSize || 1024 * 512
	
// 		// browser only: how long to wait when throttling
// 		var bufferTimeout = options.browserBufferTimeout || 1000
	
// 		// use existing WebSocket object that was passed in
// 		if (typeof target === 'object') {
// 			socket = target
// 		// otherwise make a new one
// 		} else {
// 			// special constructor treatment for native websockets in browsers, see
// 			// https://github.com/maxogden/websocket-stream/issues/82
// 			if (isNative && isBrowser) {
// 				socket = new WS(target, protocols)
// 			} else {
// 				socket = new WS(target, protocols, options)
// 			}
	
// 			socket.binaryType = 'arraybuffer'
// 		}
	
// 		// was already open when passed in
// 		if (socket.readyState === socket.OPEN) {
// 			stream = proxy
// 		} else {
// 			stream = duplexify.obj()
// 			socket.onopen = onopen
// 		}
	
// 		stream.socket = socket
	
// 		socket.onclose = onclose
// 		socket.onerror = onerror
// 		socket.onmessage = onmessage
	
// 		proxy.on('close', destroy)
	
// 		var coerceToBuffer = !options.objectMode
	
// 		function socketWriteNode(chunk, enc, next) {
// 			// avoid errors, this never happens unless
// 			// destroy() is called
// 			if (socket.readyState !== socket.OPEN) {
// 				next()
// 				return
// 			}
	
// 			if (coerceToBuffer && typeof chunk === 'string') {
// 				chunk = Buffer.from(chunk, 'utf8')
// 			}
// 			socket.send(chunk, next)
// 		}
	
// 		function socketWriteBrowser(chunk, enc, next) {
// 			if (socket.bufferedAmount > bufferSize) {
// 				setTimeout(socketWriteBrowser, bufferTimeout, chunk, enc, next)
// 				return
// 			}
	
// 			if (coerceToBuffer && typeof chunk === 'string') {
// 				chunk = Buffer.from(chunk, 'utf8')
// 			}
	
// 			try {
// 				socket.send(chunk)
// 			} catch(err) {
// 				return next(err)
// 			}
	
// 			next()
// 		}
	
// 		function socketEnd(done) {
// 			socket.close()
// 			done()
// 		}
	
// 		function onopen() {
// 			stream.setReadable(proxy)
// 			stream.setWritable(proxy)
// 			stream.emit('connect')
// 		}
	
// 		function onclose() {
// 			stream.end()
// 			stream.destroy()
// 		}
	
// 		function onerror(err) {
// 			stream.destroy(err)
// 		}
	
// 		function onmessage(event) {
// 			var data = event.data
// 			if (data instanceof ArrayBuffer) data = Buffer.from(data)
// 			else data = Buffer.from(data, 'utf8')
// 			proxy.push(data)
// 		}
	
// 		function destroy() {
// 			socket.close()
// 		}
	
// 		// this is to be enabled only if objectMode is false
// 		function writev (chunks, cb) {
// 			var buffers = new Array(chunks.length)
// 			for (var i = 0; i < chunks.length; i++) {
// 				if (typeof chunks[i].chunk === 'string') {
// 					buffers[i] = Buffer.from(chunks[i], 'utf8')
// 				} else {
// 					buffers[i] = chunks[i].chunk
// 				}
// 			}
	
// 			this._write(Buffer.concat(buffers), 'binary', cb)
// 		}
	
// 		return stream
// 	}
	
// 	}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
// 	},{"_process":92,"duplexify":17,"readable-stream":108,"safe-buffer":110,"ws":119}],119:[function(require,module,exports){
	
// 	var ws = null
	
// 	if (typeof WebSocket !== 'undefined') {
// 		ws = WebSocket
// 	} else if (typeof MozWebSocket !== 'undefined') {
// 		ws = MozWebSocket
// 	} else if (typeof window !== 'undefined') {
// 		ws = window.WebSocket || window.MozWebSocket
// 	}
	
// 	module.exports = ws
	
// 	},{}],120:[function(require,module,exports){
// 	// Returns a wrapper function that returns a wrapped callback
// 	// The wrapper function should do some stuff, and return a
// 	// presumably different callback function.
// 	// This makes sure that own properties are retained, so that
// 	// decorations and such are not lost along the way.
// 	module.exports = wrappy
// 	function wrappy (fn, cb) {
// 		if (fn && cb) return wrappy(fn)(cb)
	
// 		if (typeof fn !== 'function')
// 			throw new TypeError('need wrapper function')
	
// 		Object.keys(fn).forEach(function (k) {
// 			wrapper[k] = fn[k]
// 		})
	
// 		return wrapper
	
// 		function wrapper() {
// 			var args = new Array(arguments.length)
// 			for (var i = 0; i < args.length; i++) {
// 				args[i] = arguments[i]
// 			}
// 			var ret = fn.apply(this, args)
// 			var cb = args[args.length-1]
// 			if (typeof ret === 'function' && ret !== cb) {
// 				Object.keys(cb).forEach(function (k) {
// 					ret[k] = cb[k]
// 				})
// 			}
// 			return ret
// 		}
// 	}
	
// 	},{}],121:[function(require,module,exports){
// 	module.exports = extend
	
// 	var hasOwnProperty = Object.prototype.hasOwnProperty;
	
// 	function extend() {
// 			var target = {}
	
// 			for (var i = 0; i < arguments.length; i++) {
// 					var source = arguments[i]
	
// 					for (var key in source) {
// 							if (hasOwnProperty.call(source, key)) {
// 									target[key] = source[key]
// 							}
// 					}
// 			}
	
// 			return target
// 	}
	
// 	},{}]},{},[9])(9)
// 	});
