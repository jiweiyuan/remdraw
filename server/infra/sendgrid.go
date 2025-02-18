package infra

import "github.com/sendgrid/sendgrid-go"

type Sendgrid struct {
	APIKey string
}

func NewSendgridClient() *sendgrid.Client {
	config := GetSendgridConfig()

	client := sendgrid.NewSendClient(config.APIKey)

	return client
}
