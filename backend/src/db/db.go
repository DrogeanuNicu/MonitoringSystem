package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

type DatabaseConfig struct {
	Address  string `json:"Address"`
	Port     int    `json:"Port"`
	User     string `json:"User"`
	Password string `json:"Password"`
	Name     string `json:"Name"`
}

var db *sql.DB
var logger = log.New(os.Stdout, "[DB] ", log.Ldate|log.Ltime)

func Init(config *DatabaseConfig) {
	var err error

	conStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		config.Address, config.Port, config.User, config.Password, config.Name)

	db, err = sql.Open("postgres", conStr)
	if err != nil {
		panic(err)
	}

	err = db.Ping()
	if err != nil {
		panic(err)
	}

	err = checkTables()
	if err != nil {
		panic(err)
	}

	logger.Println("Database is ready!")
}

func DeInit() error {
	err := db.Close()

	if err != nil {
		return err
	}

	return nil
}

func checkTables() error {
	var err error

	// Check if the "users" table exists
	var userTableExists bool
	err = db.QueryRow("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users')").Scan(&userTableExists)
	if err != nil {
		logger.Printf("Error checking if users table exists: %s\n", err)
		return err
	}

	// If the "users" table does not exist, create it
	if !userTableExists {
		_, err = db.Exec("CREATE TABLE users (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE, firstname VARCHAR(50), lastname VARCHAR(50), email VARCHAR(50) UNIQUE, password VARCHAR(150))")
		if err != nil {
			logger.Printf("Error creating 'users' table: %s\n", err)
			return err
		}
		fmt.Println("Successfully created 'users' table!")
	}

	// Check if the "boards" table exists
	var boardTableExists bool
	err = db.QueryRow("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'boards')").Scan(&boardTableExists)
	if err != nil {
		logger.Printf("Error checking if boards table exists: %s\n", err)
		return err
	}

	// If the "boards" table does not exist, create it
	if !boardTableExists {
		_, err = db.Exec("CREATE TABLE boards (id SERIAL PRIMARY KEY, name VARCHAR(20), user_id INTEGER REFERENCES users(id) ON DELETE CASCADE)")
		if err != nil {
			logger.Printf("Error creating boards table: %s\n", err)
			return err
		}
		logger.Println("Created 'boards' table")
	}

	return nil
}
