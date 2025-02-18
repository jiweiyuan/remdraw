package service

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/open-spaced-repetition/go-fsrs"
	"remdraw.com/server/model"
	"remdraw.com/server/repository"
)

type ReviewService interface {
	ListTodayReviews(ctx context.Context, userID uuid.UUID) ([]model.Frame, error)
	GetReview(ctx context.Context, frameID string) (*model.FrameReviewResponse, error)
	RepeatReview(ctx context.Context, frame *model.Frame, schedulingInfo fsrs.SchedulingInfo) error
}

func NewReviewService(frameRepository repository.FrameRepository,
	fileRepository repository.FileRepository) ReviewService {
	srs := fsrs.DefaultParam()
	return &reviewService{
		frameRepo: frameRepository,
		fileRepo:  fileRepository,
		srs:       srs,
	}
}

type reviewService struct {
	frameRepo repository.FrameRepository
	fileRepo  repository.FileRepository
	srs       fsrs.Parameters
}

func (s *reviewService) ListTodayReviews(ctx context.Context, userID uuid.UUID) ([]model.Frame, error) {
	return s.frameRepo.ListTodayReviewFrames(ctx, userID)
}

func (s *reviewService) RepeatReview(ctx context.Context, frame *model.Frame, schedulingInfo fsrs.SchedulingInfo) error {

	newFrame := &model.Frame{
		ID:             frame.ID,
		UserID:         frame.UserID,
		CardDue:        schedulingInfo.Card.Due,
		CardStability:  schedulingInfo.Card.Stability,
		CardDifficulty: schedulingInfo.Card.Difficulty,
		CardReps:       schedulingInfo.Card.Reps,
		CardLapses:     schedulingInfo.Card.Lapses,
		CardState:      schedulingInfo.Card.State,
		CardLastReview: schedulingInfo.Card.LastReview,
	}

	frameLog := &model.FrameLog{
		FrameID:           frame.ID,
		UserID:            frame.UserID,
		CardRating:        int(schedulingInfo.ReviewLog.Rating),
		CardScheduledDays: schedulingInfo.ReviewLog.ScheduledDays,
		CardElapsedDays:   schedulingInfo.ReviewLog.ElapsedDays,
		CardReview:        schedulingInfo.ReviewLog.Review,
		CardState:         schedulingInfo.ReviewLog.State,
	}

	return s.frameRepo.UpdateSchedule(ctx, newFrame, frameLog)
}

func (s *reviewService) GetReview(ctx context.Context, frameID string) (*model.FrameReviewResponse, error) {

	frame, err := s.frameRepo.GetByID(ctx, frameID)
	if err != nil {
		return nil, err
	}

	frameData, err := s.frameRepo.GetFrameData(ctx, frame)
	if err != nil {
		return nil, err
	}

	var ids = s.FilterFileIDs(frameData.Elements)
	files, err := s.fileRepo.ListByFileIds(ctx, ids)
	if err != nil {
		return nil, err
	}

	var card = fsrs.Card{
		Due:         frame.CardDue,
		Stability:   frame.CardStability,
		Difficulty:  frame.CardDifficulty,
		ElapsedDays: 0,
		Reps:        frame.CardReps,
		Lapses:      frame.CardLapses,
		State:       frame.CardState,
		LastReview:  frame.CardLastReview,
	}

	scheduling := s.srs.Repeat(card, frame.Now)

	return &model.FrameReviewResponse{
		Frame:      frame,
		Elements:   frameData.Elements,
		Scheduling: scheduling,
		Files:      files,
	}, nil

}

func (s *reviewService) FilterFileIDs(elements json.RawMessage) []string {
	// Unmarshal the raw message into a slice of maps
	var items []map[string]interface{}
	err := json.Unmarshal(elements, &items)
	if err != nil {
		fmt.Println("Error unmarshaling JSON:", err)
		return nil
	}

	// Collect non-null IDs
	var ids []string
	for _, item := range items {
		if id, ok := item["fileId"].(string); ok && id != "" {
			ids = append(ids, id)
		}
	}

	return ids
}
