package model

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type OSSCredentials struct {
	AccessKeyID     string `json:"access"`
	SecretAccessKey string `json:"secret"`
	SessionToken    string `json:"session"`
}
