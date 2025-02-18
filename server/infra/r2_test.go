package infra

import (
	"context"
	"testing"
)

func TestListObjects(t *testing.T) {
	client := NewR2Client()

	err := client.ListObjects("")
	if err != nil {
		return
	}
}

func TestPutObject(t *testing.T) {
	client := NewR2Client()
	err := client.PutObject(context.TODO(), "filename", nil)
	if err != nil {
		return
	}

}
