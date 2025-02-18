package infra

import (
	"testing"

	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

func TestSendEmail(t *testing.T) {
	client := NewSendgridClient()

	from := mail.NewEmail("Remdraw", "no-reply@remdraw.com")
	subject := "Sending with SendGrid is Fun"
	to := mail.NewEmail("Jiwei Yuan", "ji-weiyuan@outlook.com")
	plainTextContent := "and easy to do anywhere, even with Go"

	message := mail.NewSingleEmail(from, subject, to, plainTextContent, plainTextContent)
	response, err := client.Send(message)
	if err != nil {
		t.Error(err)
	} else {
		t.Log(response.StatusCode)
		t.Log(response.Body)
		t.Log(response.Headers)
	}
}
