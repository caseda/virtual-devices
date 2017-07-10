# Virtual Devices

This app gives you the opportunity to add Virtual Devices to Homey that can be operated from the UI Interface and that can trigger flows.

Or you can add a mode and add it as a condition, e.g. to disable multiple flows when going on Holiday.

## What works:

* Devices:
  * Switch
  * Alarm
  * Blinds
  * Hifi
  * Light
  * Security
  * TV
* Modes
  * Holiday
  * Away
  * Party
  * Event
  * Quiet
  * Movie
  * Sleep
  * Relax
  * Manual


* Trigger a flow
* Use the switch/mode status as a condition
* Use the switch/mode in the 'then'-column

## What doesn't:

* Blinds can go on/off, not yet up, stop, down
* Other devices, like a Dimmer, etc.

I'm very interested to hear your ideas for other virtual devices.

### Homey Config Composer
to add a device just add the appropriate config files and run the  
`homeyConfig compose`  
command and it will be added into the app.json  

you will need to install the homey config composer to be able to do this:  
https://www.npmjs.com/package/node-homey-config-composer

## Release history

### 0.5.0
* Under the hood change for easier adding devices.

### 0.4.0
* Added Buttons
* Added Relax and Manual Modes

### 0.3.0
* Added more devices and modes (thanks to ZperX)

### 0.2.0
* Use the switch in the 'then'-column

### 0.1.0
* Use the switches status as a condition
* Multiple Virtual devices can be added
* First Device: a Virtual Switch
