package dashboard

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
)

// ================================================================================================
//
//	Global Types
//
// ================================================================================================

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
const folderPermissions fs.FileMode = 0755

// ================================================================================================
//
//	Global Functions
//
// ================================================================================================
func FsAddUser(username string) error {
	usernameFolderPath := filepath.Join(dataPath, username)

	if _, err := os.Stat(usernameFolderPath); err == nil {
		if err := os.RemoveAll(usernameFolderPath); err != nil {
			logger.Printf("Failed to remove existing user folder for %s: %v\n", username, err)
			return err
		}
	} else if !os.IsNotExist(err) {
		logger.Printf("Failed to check if user folder exists for %s: %v\n", username, err)
		return err
	}

	if err := os.Mkdir(usernameFolderPath, folderPermissions); err != nil {
		logger.Printf("Failed to create user folder for %s: %v\n", username, err)
		return err
	}

	return nil
}

func FsAddBoard(username string, boardConf *BoardConfig) error {
	boardFolderPath := filepath.Join(dataPath, username, boardConf.Board)

	if _, err := os.Stat(boardFolderPath); err == nil {
		if err := os.RemoveAll(boardFolderPath); err != nil {
			logger.Printf("Failed to remove existing board folder for %s/%s: %v\n", username, boardConf.Board, err)
			return err
		}
	} else if !os.IsNotExist(err) {
		logger.Printf("Failed to check if board folder exists for %s/%s: %v\n", username, boardConf.Board, err)
		return err
	}

	if err := os.Mkdir(boardFolderPath, folderPermissions); err != nil {
		logger.Printf("Failed to create board folder for %s/%s: %v\n", username, boardConf.Board, err)
		return err
	}

	fileName := boardConf.Board + ".csv"
	filePath := filepath.Join(boardFolderPath, fileName)
	if _, err := os.Stat(filePath); err != nil {
		if !os.IsNotExist(err) {
			logger.Printf("Failed to check if CSV file exists for %s/%s: %v\n", username, boardConf.Board, err)
			return err
		}

		file, err := os.Create(filePath)
		if err != nil {
			logger.Printf("Failed to create CSV file for %s/%s: %v\n", username, boardConf.Board, err)
			return err
		}
		defer file.Close()

		writer := csv.NewWriter(file)
		defer writer.Flush()

		headers := make([]string, len(boardConf.Parameters))
		for i, param := range boardConf.Parameters {
			if param.Uom != "" {
				headers[i] = fmt.Sprintf("%s [%s]", param.Name, param.Uom)
			} else {
				headers[i] = param.Name
			}
		}
		if err := writer.Write(headers); err != nil {
			logger.Printf("Failed to write CSV headers for %s/%s: %v\n", username, boardConf.Board, err)
			return err
		}
		headers = nil
	}

	/* TODO: Remove this after you have updated the database to contain the board config as well*/
	fileName = boardConf.Board + ".json"
	filePath = filepath.Join(boardFolderPath, fileName)
	jsonFile, err := os.Create(filePath)
	if err != nil {
		logger.Printf("Failed to create CSV file for %s/%s: %v\n", username, boardConf.Board, err)
		return err
	}
	defer jsonFile.Close()

	jsonData, err := json.Marshal(*boardConf)
	if err != nil {
		fmt.Println("Error marshaling JSON:", err)
		return err
	}

	_, err = jsonFile.Write(jsonData)
	if err != nil {
		fmt.Println("Error writing JSON to file:", err)
		return err
	}

	return nil
}

func FsDeleteBoard(username string, board string) error {
	boardFolderPath := filepath.Join(dataPath, username, board)

	if _, err := os.Stat(boardFolderPath); err == nil {
		if err := os.RemoveAll(boardFolderPath); err != nil {
			logger.Printf("Failed to remove existing board folder for %s/%s: %v\n", username, board, err)
			return err
		}
	} else if !os.IsNotExist(err) {
		logger.Printf("Failed to check if board folder exists for %s/%s: %v\n", username, board, err)
		return err
	}

	if _, err := os.Stat(boardFolderPath); err == nil {
		logger.Printf("Board folder for %s/%s was not deleted\n", username, board)
		return err
	}

	return nil
}

func FsEditBoardData(username string, data *BoardConfig, oldBoard string) error {
	oldFilePath := filepath.Join(dataPath, username, oldBoard, oldBoard+".csv")

	_, err := os.Stat(oldFilePath)
	if !os.IsNotExist(err) {
		err = FsDeleteBoard(username, oldBoard)
		if err != nil {
			return err
		}
	}

	err = FsAddBoard(username, data)
	if err != nil {
		return err
	}
	return nil
}

func FsDownloadBoardData(username string, board string) (string, error) {
	filePath := filepath.Join(dataPath, username, board, board+".csv")

	_, err := os.Stat(filePath)
	if os.IsNotExist(err) {
		logger.Printf("The file '%s' was not found\n", filePath)
		return "", err
	}

	return filePath, nil
}

func FsReadBoardConfig(username string, board string, boardConf *BoardConfig) error {
	filePath := filepath.Join(dataPath, username, board, board+".json")

	file, err := os.Open(filePath)
	if err != nil {
		fmt.Println("Error opening file:", err)
		return err
	}
	defer file.Close()

	jsonData, err := io.ReadAll(file)
	if err != nil {
		fmt.Println("Error reading file:", err)
		return err
	}

	err = json.Unmarshal(jsonData, boardConf)
	if err != nil {
		fmt.Println("Error unmarshaling JSON:", err)
		return err
	}

	return nil
}

// ================================================================================================
//
//	Local Functions
//
// ================================================================================================
