using System.Text.Json.Serialization;

namespace MaiChartManager;

public enum MovieCodec
{
    PreferH264 = 0,
    ForceH264 = 1,
    ForceVP9 = 2
}

public class Config
{
    public bool Export { get; set; } = false;
    public string GamePath { get; set; } = "";
    public string OfflineKey { get; set; } = "";
    public bool UseAuth { get; set; } = false;
    public string AuthUsername { get; set; } = "";
    public string AuthPassword { get; set; } = "";
    public HashSet<string> HistoryPath { get; set; } = [];
    public string? Locale { get; set; } = null;

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public MovieCodec MovieCodec { get; set; } = MovieCodec.ForceVP9;
    public bool Yuv420p { get; set; } = true;
    public bool NoScale { get; set; } = false;
    public bool IgnoreLevel { get; set; } = false;
    public bool DisableBga { get; set; } = false;
}