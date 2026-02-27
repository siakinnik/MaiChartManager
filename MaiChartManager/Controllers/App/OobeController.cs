using System.Net;
using System.Net.Sockets;
using System.Text.Json;
using System.Windows.Forms;
using Microsoft.AspNetCore.Mvc;

namespace MaiChartManager.Controllers.App;

public record CompleteSetupRequest(bool Export, bool UseAuth, string? AuthUsername, string? AuthPassword);

[ApiController]
[Route("MaiChartManagerServlet/[action]Api")]
public class OobeController(StaticSettings settings, ILogger<OobeController> logger) : ControllerBase
{
    [HttpGet]
    public string? GetGamePath()
    {
        return StaticSettings.Config.GamePath;
    }

    [HttpPost]
    public IActionResult SetGamePath([FromBody] string path)
    {
        if (!Path.Exists(path))
        {
            return BadRequest("Path does not exist");
        }

        StaticSettings.GamePath = path;
        if (!Directory.Exists(StaticSettings.StreamingAssets) && Directory.Exists(Path.Combine(StaticSettings.GamePath, "Package")))
        {
            StaticSettings.GamePath = Path.Combine(StaticSettings.GamePath, "Package");
        }

        if (!Directory.Exists(StaticSettings.StreamingAssets))
        {
            return BadRequest("StreamingAssets not found. Not a valid game directory.");
        }

        StaticSettings.Config.GamePath = StaticSettings.GamePath;
        StaticSettings.Config.HistoryPath.Add(path);
        System.IO.File.WriteAllText(Path.Combine(StaticSettings.appData, "config.json"), JsonSerializer.Serialize(StaticSettings.Config));

        return Ok();
    }

    [HttpPost]
    public void InitializeGameData()
    {
        settings.InitializeGameData();
    }

    [HttpGet]
    public string? OpenFolderDialog()
    {
        string? result = null;
        AppMain.ActiveForm?.Invoke(() =>
        {
            var dialog = new FolderBrowserDialog
            {
                ShowNewFolderButton = false,
            };
            if (dialog.ShowDialog(AppMain.ActiveForm) == DialogResult.OK)
            {
                result = dialog.SelectedPath;
            }
        });
        return result;
    }

    [HttpGet]
    public List<string> GetLanAddresses()
    {
        return Dns.GetHostAddresses(Dns.GetHostName())
            .Where(it => it.AddressFamily == AddressFamily.InterNetwork)
            .Select(it => it.ToString())
            .ToList();
    }

    [HttpPost]
    public async Task<IActionResult> CompleteSetup([FromBody] CompleteSetupRequest request)
    {
        var exportChanged = request.Export != StaticSettings.Config.Export;
        StaticSettings.Config.Export = request.Export;
        StaticSettings.Config.UseAuth = request.UseAuth;
        StaticSettings.Config.AuthUsername = request.AuthUsername;
        StaticSettings.Config.AuthPassword = request.AuthPassword;
        System.IO.File.WriteAllText(Path.Combine(StaticSettings.appData, "config.json"), JsonSerializer.Serialize(StaticSettings.Config));

        if (exportChanged)
        {
            if (ServerManager.IsRunning)
            {
                await ServerManager.StopAsync();
            }
            ServerManager.StartApp(request.Export, null);
        }

        return Ok();
    }
}
