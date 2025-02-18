package infra

import (
	"context"
	"github.com/sashabaranov/go-openai"
	"testing"
)

func TestOpenAI(t *testing.T) {
	client := NewOpenAIClient()
	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT3Dot5Turbo,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleSystem,
					Content: "You're a helpful assistant. echo hello world!",
				},
			},
			MaxTokens: 20,
		},
	)

	if err != nil {
		t.Errorf("Error creating chat completion: %v", err)
	} else {
		t.Logf("Chat completion created: %v", resp)
	}
}
