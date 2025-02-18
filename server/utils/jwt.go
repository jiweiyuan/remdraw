package utils

import (
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"remdraw.com/server/constant"
	"remdraw.com/server/infra"
	"remdraw.com/server/model"
)

type JWT struct {
	SigningKey []byte
}

type UserClaims struct {
	ID   uuid.UUID      `json:"id"`
	Role model.UserRole `json:"role"`
}

var tokenPrefix = "Bearer "

func NewJWT() *JWT {
	return &JWT{
		SigningKey: []byte(infra.GetJWTSecret()),
	}
}

// CreateToken create a jwt token
func (j *JWT) CreateToken(id uuid.UUID, role model.UserRole) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":   id,
		"role": role,
		"exp":  time.Now().Add(time.Hour * 24).Unix(),
	})
	return token.SignedString(j.SigningKey)
}

// ParseToken parse a jwt token
func (j *JWT) ParseToken(tokenString string) (*UserClaims, error) {

	if strings.HasPrefix(tokenString, tokenPrefix) {
		tokenString = strings.TrimPrefix(tokenString, tokenPrefix)
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return j.SigningKey, nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, constant.TokenInvalid
	}

	userClaims := &UserClaims{}
	userClaims.ID = uuid.MustParse(claims["id"].(string))
	userClaims.Role = model.UserRole(int(claims["role"].(float64)))
	return userClaims, nil
}
