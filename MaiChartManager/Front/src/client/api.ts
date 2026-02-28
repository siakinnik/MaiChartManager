import { Api } from "@/client/apiGen";
import { Api as AquaMaiVersionConfigApi } from "@/client/aquaMaiVersionConfigApiGen";

declare global {
  const backendUrl: string | undefined;
}

export const apiClient = new Api({
  // @ts-ignore
  baseUrl: globalThis.backendUrl,
  baseApiParams: {
    headers: {
      accept: 'application/json',
    },
  },
})

export default apiClient.maiChartManagerServlet

export const aquaMaiVersionConfig = new AquaMaiVersionConfigApi({
  baseUrl: 'https://aquamai-version-config.mumur.net',
  baseApiParams: {
    headers: {
      accept: 'application/json',
    },
  },
}).api

export const getUrl = (suffix: string) => {
  // @ts-ignore
  return `${globalThis.backendUrl ?? ''}/MaiChartManagerServlet/${suffix}`;
}
