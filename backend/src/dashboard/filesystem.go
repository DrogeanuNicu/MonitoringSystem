package dashboard

import (
	"encoding/csv"
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
func AddUser(username string) error {
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

func AddBoard(username string, boardData *BoardConfig) error {
	boardFolderPath := filepath.Join(dataPath, username, boardData.Board)

	if _, err := os.Stat(boardFolderPath); err == nil {
		if err := os.RemoveAll(boardFolderPath); err != nil {
			logger.Printf("Failed to remove existing board folder for %s/%s: %v\n", username, boardData.Board, err)
			return err
		}
	} else if !os.IsNotExist(err) {
		logger.Printf("Failed to check if board folder exists for %s/%s: %v\n", username, boardData.Board, err)
		return err
	}

	if err := os.Mkdir(boardFolderPath, folderPermissions); err != nil {
		logger.Printf("Failed to create board folder for %s/%s: %v\n", username, boardData.Board, err)
		return err
	}

	fileName := boardData.Board + ".csv"
	filePath := filepath.Join(boardFolderPath, fileName)
	if _, err := os.Stat(filePath); err != nil {
		if !os.IsNotExist(err) {
			logger.Printf("Failed to check if CSV file exists for %s/%s: %v\n", username, boardData.Board, err)
			return err
		}

		file, err := os.Create(filePath)
		if err != nil {
			logger.Printf("Failed to create CSV file for %s/%s: %v\n", username, boardData.Board, err)
			return err
		}
		defer file.Close()

		writer := csv.NewWriter(file)
		defer writer.Flush()

		headers := []string{"Column1", "Column2", "Column3"}
		if err := writer.Write(headers); err != nil {
			logger.Printf("Failed to write CSV headers for %s/%s: %v\n", username, boardData.Board, err)
			return err
		}
	}

	return nil
}

func DeleteBoard(username string, board string) error {
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

func EditBoardData(username string, data *BoardConfig, oldBoard string) error {
	oldFilePath := filepath.Join(dataPath, username, oldBoard, oldBoard+".csv")

	_, err := os.Stat(oldFilePath)
	if !os.IsNotExist(err) {
		err = DeleteBoard(username, oldBoard)
		if err != nil {
			return err
		}
	}

	err = AddBoard(username, data)
	if err != nil {
		return err
	}
	return nil
}

func DownloadBoardData(username string, board string) (string, error) {
	filePath := filepath.Join(dataPath, username, board, board+".csv")

	_, err := os.Stat(filePath)
	if os.IsNotExist(err) {
		logger.Printf("The file '%s' was not found\n", filePath)
		return "", err
	}

	return filePath, nil
}

func ReadBoardConfig(username string, data *BoardConfig) error {

	return nil
}

// ================================================================================================
//
//	Local Functions
//
// ================================================================================================
