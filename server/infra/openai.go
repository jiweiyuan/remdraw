package infra

import (
	openai "github.com/sashabaranov/go-openai"
)

func NewOpenAIClient() *openai.Client {
	config := openai.DefaultConfig(GetOpenAIToken())
	config.BaseURL = "https://api.openai.com/v1"
	client := openai.NewClientWithConfig(config)
	return client
}
