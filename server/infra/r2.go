package infra

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"io"
	"log"
)

func NewR2Client() OOSClient {
	var r2Config = GetCloudflareR2Config()
	r2Resolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL: fmt.Sprintf("https://%s.r2.cloudflarestorage.com", r2Config.AccountID),
		}, nil
	})

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithEndpointResolverWithOptions(r2Resolver),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(r2Config.AccessKeyID, r2Config.SecretAccessKey, "")),
		config.WithRegion("auto"),
	)
	if err != nil {
		log.Fatal(err)
	}

	client := s3.NewFromConfig(cfg)

	return &CloudflareR2{
		config: r2Config,
		client: client,
	}
}

type OOSClient interface {
	ListObjects(prefix string) error
	PutObject(ctx context.Context, filename string, data io.Reader) error
}

type CloudflareR2Config struct {
	BucketName      string
	AccountID       string
	AccessKeyID     string
	SecretAccessKey string
}

type CloudflareR2 struct {
	config *CloudflareR2Config
	client *s3.Client
}

func (r *CloudflareR2) ListObjects(prefix string) error {

	listObjectsOutput, err := r.client.ListObjectsV2(context.TODO(), &s3.ListObjectsV2Input{
		Bucket: &r.config.BucketName,
		Prefix: &prefix,
	})
	if err != nil {
		log.Fatal(err)
	}

	for _, object := range listObjectsOutput.Contents {
		obj, _ := json.MarshalIndent(object, "", "\t")
		fmt.Println(string(obj))
	}

	return nil
}

func (r *CloudflareR2) PutObject(ctx context.Context, filename string, data io.Reader) error {
	output, err := r.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:       aws.String(r.config.BucketName),
		Key:          aws.String(filename),
		ContentType:  aws.String("text/plain"),
		CacheControl: aws.String("max-age=31536000"),
		Body:         data,
	})

	if err != nil {
		return err
	}
	if output == nil {
		return errors.New("output is nil")
	}

	return nil
}
