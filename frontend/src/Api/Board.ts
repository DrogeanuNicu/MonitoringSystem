import { authorizedFetch } from "./Fetch";

interface BoardData {
  board: string;
}

const addBoardApi = async (username: string, data: BoardData) => {

  const response = await authorizedFetch(username, `/api/home/${username}/add/${data.board}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  processResponseCode(response);
}

const editBoardApi = async (username: string, data: BoardData, oldBoard: string) => {

  const response = await authorizedFetch(username, `/api/home/${username}/edit/${oldBoard}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  processResponseCode(response);
}

const deleteBoardApi = async (username: string, board: string) => {

  const response = await authorizedFetch(username, `/api/home/${username}/delete/${board}`, {
    method: 'POST',
  });

  processResponseCode(response);
}

const downloadBoardDataApi = async (username: string, board: string) => {
  const response = await authorizedFetch(username, `/api/home/${username}/download/${board}`, {
    method: 'GET',
  });

  try {
    if (response.ok) {
      const blob = await response.blob();
      const filename = `${board}.csv`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    }
  } catch (error: any) {
    throw new Error(`Error download the CSV file for board '${board}'! Status: ${response.status}`);
  }
}

const otaUpdateApi = async (username: string, board: string) => {
  console.log(`Doing OTA update for ${board} from username ${username}`);
}

const processResponseCode = async (response: Response) => {
  if (!response.ok) {
    throw new Error(`Failed to communicate with the server! Status: ${response.status}`);
  }

  const responseData = await response.json();
  if (responseData.error !== undefined) {
    /* Error thrown from the server */
    throw new Error(responseData.error);
  }
}

export type { BoardData };
export { addBoardApi, editBoardApi, deleteBoardApi, downloadBoardDataApi, otaUpdateApi };