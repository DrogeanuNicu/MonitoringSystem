package db

import (
	"backend/src/dashboard"
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

// ================================================================================================
//
//	Global Types
//
// ================================================================================================
type DatabaseConfig struct {
	Address  string `json:"Address"`
	Port     int    `json:"Port"`
	User     string `json:"User"`
	Password string `json:"Password"`
	Name     string `json:"Name"`
}

// ================================================================================================
//
//	Local Types
//
// ================================================================================================

// ================================================================================================
//
//	Global Variables
//
// ================================================================================================

// ================================================================================================
//
//	Local Variables
//
// ================================================================================================
const maxUsernameLen = 30
const maxEmailLen = 30
const maxPasswordLen = 30
const maxBoardNameLen = 40

var db *sql.DB
var logger = log.New(os.Stdout, "[DB   ] ", log.Ldate|log.Ltime)

// ================================================================================================
//
//	Global Functions
//
// ================================================================================================
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

	if !checkTable("users") {
		createUsersTable()
	}

	if !checkTable("boards") {
		createBoardsTable()
	}

	logger.Println("Database is ready!")
}

func Login(username string, password string) (bool, error) {
	var found bool
	err := db.QueryRow("SELECT EXISTS (SELECT 1 FROM users WHERE username = $1 AND password = $2)", username, password).Scan(&found)
	if err != nil {
		return false, err
	}

	return found, nil
}

func Register(username string, email string, password string) (string, error) {
	var returnMsg string = ""

	_, err := db.Exec("INSERT INTO users (username, email, password) VALUES ($1, $2, $3)", username, email, password)
	if err != nil {
		returnMsg = fmt.Sprintf("The user '%s' already exists!", username)
		return returnMsg, err
	}

	return returnMsg, err
}

func GetBoards(username string) ([]string, error) {
	var boards []string

	query := `
        SELECT b.name
        FROM boards b
        INNER JOIN users u ON b.user_id = u.id
        WHERE u.username = $1
    `
	rows, err := db.Query(query, username)
	if err != nil {
		logger.Printf("Error querying board names: %v", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var boardName string
		if err := rows.Scan(&boardName); err != nil {
			logger.Printf("Error scanning board name row: %v", err)
			return nil, err
		}
		boards = append(boards, boardName)
	}
	if err := rows.Err(); err != nil {
		logger.Printf("Error iterating over board name rows: %v", err)
		return nil, err
	}

	return boards, nil
}

func AddBoard(username string, boardData *dashboard.BoardConfig) error {
	command := `
		INSERT INTO boards (name, user_id)
		SELECT $1, id FROM users WHERE username = $2
	`
	_, err := db.Exec(command, boardData.Board, username)
	if err != nil {
		logger.Println(err)
		return err
	}

	return nil
}

func EditBoard(username string, boardData *dashboard.BoardConfig, oldBoardName string) error {
	command := `
		UPDATE boards AS b
		SET name = $1
		FROM users AS u
		WHERE b.user_id = u.id AND b.name = $2 AND u.username = $3
	`
	_, err := db.Exec(command, boardData.Board, oldBoardName, username)
	if err != nil {
		logger.Println(err)
		return err
	}

	return nil
}

func DeleteBoard(username, boardName string) error {
	command := `
        DELETE FROM boards
        WHERE name = $1
		AND user_id = (SELECT id FROM users WHERE username = $2)
    `
	_, err := db.Exec(command, boardName, username)
	if err != nil {
		logger.Println(err)
		return err
	}

	return nil
}

func DeInit() error {
	err := db.Close()

	if err != nil {
		return err
	}

	return nil
}

// ================================================================================================
//
//	Local Functions
//
// ================================================================================================
func checkTable(table string) bool {
	tableExists := false
	command := fmt.Sprintf("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '%s')", table)

	err := db.QueryRow(command).Scan(&tableExists)
	if err != nil {
		panic(fmt.Sprintf("Error checking if '%s' table exists:\n%s\n", table, err))
	}

	return tableExists
}

func createUsersTable() {
	command := fmt.Sprintf("CREATE TABLE users (id SERIAL PRIMARY KEY, username VARCHAR(%d) UNIQUE, email VARCHAR(%d) UNIQUE, password VARCHAR(%d))", maxUsernameLen, maxEmailLen, maxPasswordLen)
	_, err := db.Exec(command)
	if err != nil {
		panic(fmt.Sprintf("Error creating 'users' table: %s\n", err))
	}
	logger.Println("Created 'users' table")
}

func createBoardsTable() {
	command := fmt.Sprintf("CREATE TABLE boards (id SERIAL PRIMARY KEY, name VARCHAR(%d), user_id INTEGER REFERENCES users(id) ON DELETE CASCADE)", maxBoardNameLen)
	_, err := db.Exec(command)
	if err != nil {
		panic(fmt.Sprintf("Error creating 'boards' table: %s\n", err))
	}
	logger.Println("Created 'boards' table")
}
