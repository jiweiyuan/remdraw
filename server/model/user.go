package model

import "github.com/google/uuid"

type User struct {
	ID        uuid.UUID `json:"id"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Email     string    `json:"email"`
	Password  string    `json:"password"`
	Role      UserRole  `json:"role"`
	CreateTs  string    `json:"create_ts"`
	UpdateTs  string    `json:"update_ts"`
}

type UserRole int

const (
	ADMIN UserRole = iota + 1
	UNVERIFIEDUSER
	FREEUSER
	PREMIUMUSER
)

type Waitlist struct {
	ID        int    `json:"id"`
	Email     string `json:"email"`
	IPAddress string `json:"ip_address"`
}
