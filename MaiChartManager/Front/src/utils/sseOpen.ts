/**
 * fetchEventSource 的自定义 onopen 处理器
 * 当响应不是 SSE 格式时（如 ASP.NET 返回 ProblemDetails JSON），
 * 读取响应体获取实际的错误信息，而非仅报 content-type 不匹配
 */
export async function handleSseOpen(response: Response) {
  if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) return;

  let errorMessage: string | undefined;
  try {
    const text = await response.text();
    if (text) {
      try {
        const json = JSON.parse(text);
        errorMessage = json.detail || json.title || json.message;
      } catch {
        errorMessage = text;
      }
    }
  } catch {
  }

  throw new Error(errorMessage || `HTTP ${response.status}: ${response.statusText}`);
}
