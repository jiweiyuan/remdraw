package repository

import (
	"context"
	"database/sql"

	"remdraw.com/server/constant"
	"remdraw.com/server/model"
)

type UserRepository interface {
	Register(ctx context.Context, user *model.User) error
	GetByEmail(ctx context.Context, email string) (*model.User, error)
	JoinWaitlist(ctx context.Context, waitlist *model.Waitlist) error
	CheckWaitlistEmail(ctx context.Context, email string) (bool, error)
	CheckWaitlistIP(ctx context.Context, ip string) (bool, error)
}

type userRepository struct {
	Conn *sql.DB
}

func NewUserRepository(db *sql.DB) UserRepository {
	return &userRepository{Conn: db}
}

func (r *userRepository) Register(ctx context.Context, user *model.User) error {
	_, err := r.Conn.ExecContext(ctx, `INSERT INTO public.user (first_name, last_name, email, password, role) 
	VALUES ($1, $2, $3, $4, $5)`, user.FirstName, user.LastName, user.Email, user.Password, user.Role)
	if err != nil {
		return err
	}
	return nil
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	var user model.User
	err := r.Conn.QueryRowContext(ctx, `SELECT id, first_name, last_name, email, password, role, create_ts
FROM public.user 
WHERE email = $1`, email).
		Scan(&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.Password, &user.Role, &user.CreateTs)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) JoinWaitlist(ctx context.Context, waitlist *model.Waitlist) error {
	_, err := r.Conn.ExecContext(ctx, `INSERT INTO public.waitlist (email, ip_address) VALUES ($1, $2)`, waitlist.Email, waitlist.IPAddress)
	if err != nil {
		return err
	}
	return nil
}

func (r *userRepository) CheckWaitlistEmail(ctx context.Context, email string) (bool, error) {
	var count int
	err := r.Conn.QueryRowContext(ctx, `SELECT COUNT(*) FROM public.waitlist WHERE email = $1`, email).Scan(&count)
	if err != nil {
		return false, err
	}
	return count == 0, nil
}

func (r *userRepository) CheckWaitlistIP(ctx context.Context, ip string) (bool, error) {
	var count int
	err := r.Conn.QueryRowContext(ctx, `SELECT COUNT(*) FROM public.waitlist WHERE ip_address = $1`, ip).Scan(&count)
	if err != nil {
		return false, err
	}
	return count < constant.MaxWaitlistIPLimit, nil
}
