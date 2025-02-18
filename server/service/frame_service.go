package service

import (
	"context"
	"fmt"
	"log"
	"strings"

	"github.com/google/uuid"
	"github.com/open-spaced-repetition/go-fsrs"
	"github.com/sashabaranov/go-openai"
	"remdraw.com/server/infra"
	"remdraw.com/server/model"
	"remdraw.com/server/repository"
)

type FrameService interface {
	Create(ctx context.Context, frame *model.Frame) (string, error)
	Delete(ctx context.Context, frame *model.Frame) error
	ListBySceneId(ctx context.Context, sceneID uuid.UUID) ([]model.Frame, error)
	GetFrameData(ctx context.Context, frame *model.Frame) (*model.FrameData, error)
}

type frameService struct {
	frameRepository repository.FrameRepository
	openai          *openai.Client
}

func NewFrameService(frameRepository repository.FrameRepository) FrameService {
	openaiClient := infra.NewOpenAIClient()
	return &frameService{
		frameRepository: frameRepository,
		openai:          openaiClient,
	}
}

func (f *frameService) Create(ctx context.Context, frame *model.Frame) (string, error) {
	f.initCard(frame)

	return f.frameRepository.Create(ctx, frame)
}

func (f *frameService) Delete(ctx context.Context, frame *model.Frame) error {
	return f.frameRepository.Delete(ctx, frame)
}

func (f *frameService) ListBySceneId(ctx context.Context, sceneID uuid.UUID) ([]model.Frame, error) {
	return f.frameRepository.ListBySceneID(ctx, sceneID)
}

func (f *frameService) TaggingFrame(ctx context.Context, tagRequest *model.TaggingRequest) (*model.TaggingRequest, error) {
	resp, err := f.openai.CreateChatCompletion(
		ctx,
		openai.ChatCompletionRequest{
			Model: tagRequest.Model,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleSystem,
					Content: fmt.Sprintf("You are a tagging engine, tagging the following text: %sqids", tagRequest.Text),
				},
				{
					Role:    openai.ChatMessageRoleUser,
					Content: tagRequest.Text,
				},
			},
			MaxTokens: 100,
		},
	)
	if err != nil {
		return nil, err
	}

	log.Printf("Response %v", resp)

	tagRequest.Tags = strings.Split(resp.Choices[0].Message.Content, ",")
	return tagRequest, nil
}

func (f *frameService) GetFrameData(ctx context.Context, frame *model.Frame) (*model.FrameData, error) {
	return f.frameRepository.GetFrameData(ctx, frame)

}

func (f *frameService) initCard(frame *model.Frame) {
	frame.CardStability = 0
	frame.CardDifficulty = 0
	frame.CardReps = 0
	frame.CardState = fsrs.New
}
