package service

import (
	"context"
	"errors"

	"remdraw.com/server/model"
	"remdraw.com/server/repository"
)

type UserService interface {
	GetUserByEmail(ctx context.Context, email string) (*model.User, error)
	CreateUser(ctx context.Context, user *model.User) error
	JoinWaitlist(ctx context.Context, waitlist *model.Waitlist) error
}

func NewUserService(userRepository repository.UserRepository) UserService {
	return &userService{userRepo: userRepository}
}

type userService struct {
	userRepo repository.UserRepository
}

func (s *userService) GetUserByEmail(ctx context.Context, email string) (*model.User, error) {
	user, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, errors.New("user not found")
	}
	return user, nil
}

func (s *userService) CreateUser(ctx context.Context, user *model.User) error {
	exsisted, _ := s.userRepo.GetByEmail(ctx, user.Email)

	if exsisted != nil && exsisted.Email == user.Email {
		return errors.New("user already exists")
	}

	return s.userRepo.Register(ctx, user)
}

func (s *userService) JoinWaitlist(ctx context.Context, waitlist *model.Waitlist) error {
	vaild, _ := s.userRepo.CheckWaitlistEmail(ctx, waitlist.Email)
	if !vaild {
		return errors.New("email already in waitlist")
	}

	vaild, _ = s.userRepo.CheckWaitlistIP(ctx, waitlist.IPAddress)
	if !vaild {
		return errors.New("ip has exceeded the limit")
	}

	return s.userRepo.JoinWaitlist(ctx, waitlist)
}
