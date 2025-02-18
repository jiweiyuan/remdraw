package infra

import (
	"github.com/joho/godotenv"
	"log"
	"os"
	"regexp"
)

const projectDirName = "server"

func loadEnv() {
	projectName := regexp.MustCompile(`^(.*` + projectDirName + `)`)
	currentWorkDirectory, _ := os.Getwd()
	rootPath := projectName.Find([]byte(currentWorkDirectory))

	err := godotenv.Load(string(rootPath) + `/.env`)

	if err != nil {
		log.Fatalf("Error loading .env file")
	}
}

func GetPostgresConfig() *Postgresql {
	loadEnv()
	// Create a new config instance
	config := &Postgresql{
		Host:     os.Getenv("POSTGRES_HOST"),
		Port:     os.Getenv("POSTGRES_PORT"),
		User:     os.Getenv("POSTGRES_USER"),
		Password: os.Getenv("POSTGRES_PASSWORD"),
		Dbname:   os.Getenv("POSTGRES_DBNAME"),
		SSLMode:  os.Getenv("POSTGRES_SSLMODE"),
	}

	return config
}

func GetJWTSecret() string {
	loadEnv()
	return os.Getenv("JWT_SECRET")
}

func GetOpenAIToken() string {
	loadEnv()
	return os.Getenv("OPENAI_TOKEN")
}

func GetCloudflareR2Config() *CloudflareR2Config {
	loadEnv()
	return &CloudflareR2Config{
		BucketName:      os.Getenv("CLOUDFLARE_BUCKET_REMDRAW"),
		AccountID:       os.Getenv("CLOUDFLARE_ACCOUNT_ID"),
		AccessKeyID:     os.Getenv("CLOUDFLARE_ACCESS_KEY_ID_REMDRAW"),
		SecretAccessKey: os.Getenv("CLOUDFLARE_SECRET_ACCESS_KEY_REMDRAW"),
	}
}

func GetSendgridConfig() *Sendgrid {
	loadEnv()
	return &Sendgrid{
		APIKey: os.Getenv("SENDGRID_API_KEY"),
	}
}
