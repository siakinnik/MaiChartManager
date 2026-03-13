using System;

namespace MaiChartManager.Utils;

public static class FFmpegHelper
{
    /// <summary>
    /// 将字符串转义后用双引号包裹，用于安全地拼接 ffmpeg 参数。
    /// 与 Xabe.FFmpeg 自带的 Escape() 不同，这里会正确转义内容中的反斜杠和双引号。
    /// </summary>
    public static string? Escape(string? value)
    {
        if (value == null) return value;
        return "\"" + value.Replace("\\", "\\\\").Replace("\"", "\\\"") + "\"";
    }
}

