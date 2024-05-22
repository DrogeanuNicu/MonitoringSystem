import { Signal } from "solid-js";

import { authorizedFetch } from "./Fetch";
import { IParameter } from "./Parameter";
import { IParameterSignals } from "./Parameter";
import { IChart } from "./Chart";
import { IChartSignals } from "./Chart";
import { IGauge } from "./Gauge";
import { IGaugeSignals } from "./Gauge";
import { IMap } from "./Map";
import { IMapSignals } from "./Map";

interface BoardConfig {
  Board: string;

  Parameters: IParameter[];
  Maps: IMap[];
  Charts: IChart[];
  Gauges: IGauge[];
}

interface BoardData {
  Data: string[][],
  LastTimeStamp: number,
}

const addBoardApi = async (username: string, data: BoardConfig) => {

  const response = await authorizedFetch(username, `/api/${username}/add/${data.Board}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  await processResponseCode(response);
}

const editBoardApi = async (username: string, data: BoardConfig, oldBoard: string) => {

  const response = await authorizedFetch(username, `/api/${username}/edit/${oldBoard}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  await processResponseCode(response);
}

const deleteBoardApi = async (username: string, board: string) => {

  const response = await authorizedFetch(username, `/api/${username}/delete/${board}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  await processResponseCode(response);
}

const downloadBoardDataApi = async (username: string, board: string) => {
  const response = await authorizedFetch(username, `/api/${username}/download/${board}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.ok) {
    const disposition = response.headers.get('Content-Disposition');
    if (disposition && disposition.includes('attachment')) {
      try {
        const blob = await response.blob();
        const filename = `${board}.csv`;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (error: any) {
        throw new Error(`Error download the CSV file for board '${board}'! Status: ${response.status}`);
      }
    } else {
      await processResponseCode(response);
    }
  }
  else {
    throw new Error(`Failed to communicate with the server! Status: ${response.status}`);
  }
}

const otaUpdateApi = async (username: string, board: string, file: File | null) => {

  if (file === null) {
    throw new Error("No file was provided!");
  } else {
    const formData = new FormData();
    formData.append('file', file);

    const response = await authorizedFetch(username, `/api/${username}/trigger/update/${board}`, {
      method: 'POST',
      body: formData,
    });

    await processResponseCode(response);
  }
}

async function getBoardConfigApi(username: string, board: string): Promise<BoardConfig> {
  const response = await authorizedFetch(username, `/api/${username}/config/${board}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Could not communicate with the server!');
  }

  const boardConfig: BoardConfig = await response.json();
  return boardConfig;
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

const loadConfigApi = async (
  username: string,
  board: string,
  [parameters, setParameters]: Signal<IParameterSignals[]>,
  [charts, setCharts]: Signal<IChartSignals[]>,
  [gauges, setGauges]: Signal<IGaugeSignals[]>,
  [maps, setMaps]: Signal<IMapSignals[]>,
) => {

  const config: BoardConfig = await getBoardConfigApi(username, board);

  let paramsSignals: IParameterSignals[] = [];
  for (let i = 0; i < config.Parameters.length; i++) {
    paramsSignals.push(IParameterSignals.create(config.Parameters[i]));
  }
  setParameters(paramsSignals);

  let mapsSignals: IMapSignals[] = [];
  for (let i = 0; i < config.Maps.length; i++) {
    mapsSignals.push(IMapSignals.create(config.Maps[i]));
  }
  setMaps(mapsSignals);

  let chartsSignals: IChartSignals[] = [];
  for (let i = 0; i < config.Charts.length; i++) {
    chartsSignals.push(IChartSignals.create(config.Charts[i]));
  }
  setCharts(chartsSignals);

  let gaugesSignals: IGaugeSignals[] = [];
  for (let i = 0; i < config.Gauges.length; i++) {
    gaugesSignals.push(IGaugeSignals.create(config.Gauges[i]));
  }
  setGauges(gaugesSignals);

  console.log(config);
}


export type { BoardConfig, BoardData };
export { addBoardApi, editBoardApi, deleteBoardApi, downloadBoardDataApi, otaUpdateApi, getBoardConfigApi, loadConfigApi };