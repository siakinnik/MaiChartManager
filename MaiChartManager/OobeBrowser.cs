using Microsoft.Web.WebView2.Core;

namespace MaiChartManager;

public sealed class OobeBrowser : Form
{
    private readonly Uri loopbackUrl;
    private readonly Microsoft.Web.WebView2.WinForms.WebView2 webView21;

    public OobeBrowser(string loopbackUrl)
    {
        this.loopbackUrl = new Uri(loopbackUrl);

        webView21 = new Microsoft.Web.WebView2.WinForms.WebView2 { Dock = DockStyle.Fill };
        Controls.Add(webView21);

        Text = "MaiChartManager";
        ClientSize = new Size(900, 650);
        FormBorderStyle = FormBorderStyle.FixedSingle;
        MaximizeBox = false;

        webView21.CoreWebView2InitializationCompleted += OnCoreWebView2InitializationCompleted;
        FormClosed += (_, _) => AppMain.ActiveForm = null;

        AppMain.ActiveForm = this;

        webView21.Source = new Uri("https://mcm.invalid/index.html#/oobe");
        webView21.DefaultBackgroundColor = Color.Transparent;

        PositionOnScreen();
    }

    private static Point CalculatePosition(int width, int height)
    {
        var landscape = Screen.AllScreens.FirstOrDefault(s => s.WorkingArea.Width >= s.WorkingArea.Height);
        if (landscape != null)
        {
            var area = landscape.WorkingArea;
            return new Point(
                area.X + (area.Width - width) / 2,
                area.Y + (area.Height - height) / 2
            );
        }

        var portrait = Screen.PrimaryScreen ?? Screen.AllScreens[0];
        var pArea = portrait.WorkingArea;
        var squareSize = pArea.Width;
        var squareTop = pArea.Bottom - squareSize;
        return new Point(
            pArea.X + (squareSize - width) / 2,
            squareTop + (squareSize - height) / 2
        );
    }

    private void PositionOnScreen()
    {
        StartPosition = FormStartPosition.Manual;
        Location = CalculatePosition(Width, Height);
    }

    private void OnCoreWebView2InitializationCompleted(object? sender, CoreWebView2InitializationCompletedEventArgs e)
    {
        SetupCoreWebView2(webView21.CoreWebView2);
        webView21.CoreWebView2.PermissionRequested += OnPermissionRequested;
    }

    private void SetupCoreWebView2(CoreWebView2 coreWebView2)
    {
        coreWebView2.SetVirtualHostNameToFolderMapping("mcm.invalid", StaticSettings.wwwroot, CoreWebView2HostResourceAccessKind.Deny);
        coreWebView2.AddScriptToExecuteOnDocumentCreatedAsync($"globalThis.backendUrl = `{loopbackUrl.ToString().TrimEnd('/')}`");
    }

    private static void OnPermissionRequested(object? sender, CoreWebView2PermissionRequestedEventArgs e)
    {
        if (e.PermissionKind is CoreWebView2PermissionKind.FileReadWrite or CoreWebView2PermissionKind.Autoplay)
        {
            e.State = CoreWebView2PermissionState.Allow;
        }
    }
}
