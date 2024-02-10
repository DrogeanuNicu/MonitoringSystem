package mqtt

import (
	"context"
	"fmt"
	"log"
	"net/url"
	"os"

	"github.com/eclipse/paho.golang/autopaho"
	"github.com/eclipse/paho.golang/paho"
)

type MqttConfig struct {
	CtxPtr       *context.Context
	NumOfClients uint32
	Server       string
	Port         uint32
	Topic        string
	debug        bool
}

type clientsList struct {
	Size    uint32
	Clients []*autopaho.ConnectionManager
}

var logger *log.Logger = log.New(os.Stdout, "MQTT debug: ", log.Ldate|log.Ltime)

func Init(ctx *context.Context, clients int, server string, port int, topic string) error {

	for i := 0; i < clients; i++ {
		clientID := fmt.Sprintf("Client_%d", i)
		go createClient(ctx, server, port, clientID, topic)
	}
	return nil
}

func createClient(ctx *context.Context, server string, port int, clientID string, topic string) error {

	u, err := url.Parse(fmt.Sprintf("mqtt://%s:%d", server, port))
	if err != nil {
		panic(err)
	}

	cliCfg := autopaho.ClientConfig{
		ServerUrls:                    []*url.URL{u},
		KeepAlive:                     20,
		CleanStartOnInitialConnection: false,
		SessionExpiryInterval:         60,
		Debug:                         logger,
		Errors:                        logger,
		OnConnectionUp: func(cm *autopaho.ConnectionManager, connAck *paho.Connack) {
			fmt.Println("mqtt connection up")
			if _, err := cm.Subscribe(context.Background(), &paho.Subscribe{
				Subscriptions: []paho.SubscribeOptions{
					{Topic: topic, QoS: 1},
				},
			}); err != nil {
				fmt.Printf("failed to subscribe (%s). This is likely to mean no messages will be received.", err)
			}
			fmt.Println("mqtt subscription made")
		},
		OnConnectError: func(err error) { fmt.Printf("error whilst attempting connection: %s\n", err) },
		ClientConfig: paho.ClientConfig{
			ClientID: clientID,
			OnPublishReceived: []func(paho.PublishReceived) (bool, error){
				func(pr paho.PublishReceived) (bool, error) {
					fmt.Printf("received message on topic %s; body: %s (retain: %t)\n", pr.Packet.Topic, pr.Packet.Payload, pr.Packet.Retain)
					return true, nil
				}},
			OnClientError: func(err error) { fmt.Printf("client error: %s\n", err) },
			OnServerDisconnect: func(d *paho.Disconnect) {
				if d.Properties != nil {
					fmt.Printf("server requested disconnect: %s\n", d.Properties.ReasonString)
				} else {
					fmt.Printf("server requested disconnect; reason code: %d\n", d.ReasonCode)
				}
			},
		},
	}

	c, err := autopaho.NewConnection(*ctx, cliCfg)
	if err != nil {
		panic(err)
	}

	if err = c.AwaitConnection(*ctx); err != nil {
		panic(err)
	}

	return nil
}
