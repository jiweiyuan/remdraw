package infra

import (
	"database/sql"
	_ "github.com/lib/pq"
	"log"
)

type Postgresql struct {
	Host     string
	Port     string
	User     string
	Password string
	Dbname   string
	SSLMode  string
}

// NewDB creates a new postgresql connection
func NewDB(p *Postgresql) *sql.DB {

	conn := "host=" + p.Host + " port=" + p.Port + " user=" + p.User + " password=" + p.Password + " dbname=" + p.Dbname + " sslmode=" + p.SSLMode
	db, err := sql.Open("postgres", conn)
	if err != nil {
		log.Fatalf("sql.Open: %v", err)
	}

	return db
}
