package main

import (
	"backend/mqtt"
	"backend/router"
	"backend/threadpool"
	"flag"
	"fmt"
)

func main() {
	var err error
	var address string
	var port int
	var debug bool
	var taskQueueSize int
	var workersCount int
	var mqttBrokerAdress string
	var mqttBrokerPort int
	var mqttTopic string

	flag.StringVar(&address, "address", "localhost", "The address of the web server")
	flag.IntVar(&port, "port", 5000, "The port of the web server")
	flag.BoolVar(&debug, "debug", false, "Start the web server in debug mode")
	flag.IntVar(&workersCount, "workers", 4, "The size of the thread pool")
	flag.IntVar(&taskQueueSize, "task-queue-size", 100, "The size of the task queue")
	flag.StringVar(&mqttBrokerAdress, "mqtt-address", "localhost", "The address of the MQTT broker")
	flag.IntVar(&mqttBrokerPort, "mqtt-port", 1883, "The port of the MQTT broker")
	flag.StringVar(&mqttTopic, "mqtt-topic", "$share/golang/#", "The MQTT topic")
	flag.Parse()

	if taskQueueSize < workersCount {
		panic(fmt.Sprintln("Can not create a task queue with a size lower than the number of workers!"))
	}

	threadpool.Init(workersCount, taskQueueSize)
	err = mqtt.Init(workersCount, mqttBrokerAdress, mqttBrokerPort, mqttTopic)
	if err != nil {
		panic(fmt.Sprintf("Could not connect all MQTT clients! %v", err))
	}

	err = router.Init(address, port, !debug)
	if err != nil {
		panic(fmt.Sprintf("The HTPP web server could not start! %v", err))
	}
}
