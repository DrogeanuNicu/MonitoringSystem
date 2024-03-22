package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var logger = log.New(os.Stdout, "[DB] ", log.Ldate|log.Ltime)

func Init(dbHost string, dbPort int, dbUser string, dbPassword string, dbName string) error {
	connectionString := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword, dbName)

	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		return err
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		return err
	}

	logger.Println("Connected to the PostgreSQL database!")

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

	logger.Println("Database is ready!")

	return nil
}
