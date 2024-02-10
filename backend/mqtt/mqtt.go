package mqtt

import (
	"backend/threadpool"
	"context"
	"errors"
	"fmt"
	"net"

	"github.com/eclipse/paho.golang/paho"
)

func Init(workersCount int, server string, port int, topic string) error {
	for i := 0; i < workersCount; i++ {
		clientID := fmt.Sprintf("Client_%d", i)
		err := threadpool.Submit(func() error {
			return spawnClient(clientID, server, port, topic)
		})
		if err != nil {
			return err
		}
	}
	return nil
}

func spawnClient(clientID string, server string, port int, topic string) error {
	client := createClient(server, port, clientID)
	if client == nil {
		return errors.New(fmt.Sprintf("MQTT: Could not create client with id: %v", clientID))
	}

	err := subscribe(client, topic, 1)
	if err != nil {
		return err
	}

	return nil
}

func createClient(server string, port int, clientId string) *paho.Client {
	conn, err := net.Dial("tcp", fmt.Sprintf("%v:%d", server, port))
	if err != nil {
		fmt.Printf("MQTT: Failed to connect to %s: %s\n", server, err)
	}

	c := paho.NewClient(paho.ClientConfig{
		Conn:   conn,
		Router: paho.NewStandardRouter(),
	})

	cp := &paho.Connect{
		KeepAlive:  60,
		ClientID:   clientId,
		CleanStart: false,
		Username:   "",
		Password:   nil,
	}
	cp.UsernameFlag = true
	cp.PasswordFlag = true

	ca, err := c.Connect(context.Background(), cp)
	if err != nil {
		fmt.Printf("MQTT: Client %s: %v\n", clientId, err)
		return nil
	}
	if ca.ReasonCode != 0 {
		fmt.Printf("MQTT: Client %s: Failed to connect: %d - %s\n",
			clientId,
			ca.ReasonCode,
			ca.Properties.ReasonString)
		return nil
	}
	fmt.Printf("MQTT: Client %s connected to %s\n", clientId, server)

	return c
}

func subscribe(client *paho.Client, topic string, subsId int) error {
	client.Router.RegisterHandler(topic, messageHandler)

	_, err := client.Subscribe(context.Background(), &paho.Subscribe{
		Subscriptions: []paho.SubscribeOptions{
			{
				Topic: topic,
				QoS:   0,
			},
		},
		Properties: &paho.SubscribeProperties{
			SubscriptionIdentifier: &subsId,
		},
	})

	return err
}

func messageHandler(m *paho.Publish) {
	fmt.Printf("MQTT: %s: %s\n", m.Topic, string(m.Payload))
}
