import { authorizedFetch } from "./Fetch";

interface BoardData {
  board: string;
}

const editBoardApi = async (username: string, data: BoardData, oldBoard: string) => {

  const response = await authorizedFetch(username, `/api/home/${username}/edit/${oldBoard}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to communicate with the server! Status: ${response.status}`);
  }

  const responseData = await response.json();
  if (responseData.error !== undefined) {
    /* Error thrown from the server */
    throw new Error(responseData.error);
  }
}

const deleteBoardApi = async (username: string, board: string) => {

  const response = await authorizedFetch(username, `/api/home/${username}/delete/${board}`, {
    method: 'POST',
  });

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
export { editBoardApi, deleteBoardApi };