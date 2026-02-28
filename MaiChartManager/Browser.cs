using System.Diagnostics;
using Microsoft.Web.WebView2.Core;

namespace MaiChartManager;

public sealed partial class Browser : Form
{
    private Uri? loopbackUrl;
    private static ILogger logger = AppMain.GetLogger<Browser>();

    private static bool IsRunningAsUwp()
    {
        var helpers = new DesktopBridge.Helpers();
        return helpers.IsRunningAsUwp();
    }

    public Browser(string? loopbackUrl = null)
    {
        InitializeComponent();
        if (loopbackUrl != null)
        {
            this.loopbackUrl = new Uri(loopbackUrl);
            Text += $" ({StaticSettings.GamePath})";
        }
        webView21.Source = new Uri("https://mcm.invalid/index.html");
        webView21.DefaultBackgroundColor = Color.Transparent;
        IapManager.BindToForm(this);
        PositionOnScreen();
    }

    private static Point CalculatePosition(int width, int height)
    {
        // 优先选择横屏显示器
        var landscape = Screen.AllScreens.FirstOrDefault(s => s.WorkingArea.Width >= s.WorkingArea.Height);
        if (landscape != null)
        {
            // 在横屏显示器中间显示
            var area = landscape.WorkingArea;
            return new Point(
                area.X + (area.Width - width) / 2,
                area.Y + (area.Height - height) / 2
            );
        }

        // 只有竖屏显示器，在底部正方形区域中间显示
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

    private void webView21_CoreWebView2InitializationCompleted(object sender, CoreWebView2InitializationCompletedEventArgs e)
    {
        if (IsRunningAsUwp())
        {
            webView21.CoreWebView2.Settings.AreDevToolsEnabled = false;
            webView21.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false;
        }
        else
        {
            Text += " (Unsupported)";
        }

        SetupCoreWebView2(webView21.CoreWebView2);

        // webView21.CoreWebView2.AddWebResourceRequestedFilter("*://mcm.invalid/MaiChartManagerServlet/*", CoreWebView2WebResourceContext.All);
        // webView21.CoreWebView2.WebResourceRequested += OnWebResourceRequested;

        webView21.CoreWebView2.PermissionRequested += webView21_PermissionRequested;
        webView21.CoreWebView2.NewWindowRequested += CoreWebView2_NewWindowRequested;
    }

    private async void CoreWebView2_NewWindowRequested(object? sender, CoreWebView2NewWindowRequestedEventArgs e)
    {
        if (new Uri(e.Uri).Host != "mcm.invalid")
        {
            e.Handled = true;
            Process.Start(new ProcessStartInfo(e.Uri) { UseShellExecute = true });
            return;
        }
        var deferral = e.GetDeferral();
        try
        {
            var features = e.WindowFeatures;
            var dpiScale = DeviceDpi / 96.0;
            var width = (int)((features.HasSize ? features.Width : 960) * dpiScale);
            var height = (int)((features.HasSize ? features.Height : 640) * dpiScale);
            var form = new Form
            {
                Text = "MaiChartManager",
                Icon = Icon,
                Width = width,
                Height = height,
                StartPosition = FormStartPosition.Manual,
                Location = CalculatePosition(width, height),
            };
            var webView = new Microsoft.Web.WebView2.WinForms.WebView2 { Dock = DockStyle.Fill };
            form.Controls.Add(webView);
            form.Show();
            await webView.EnsureCoreWebView2Async(webView21.CoreWebView2.Environment);
            SetupCoreWebView2(webView.CoreWebView2);
            e.NewWindow = webView.CoreWebView2;
            webView.CoreWebView2.DocumentTitleChanged += (_, _) => form.Text = webView.CoreWebView2.DocumentTitle;
            form.FormClosed += (_, _) => webView.Dispose();
        }
        finally
        {
            deferral.Complete();
        }
    }

    private void SetupCoreWebView2(CoreWebView2 coreWebView2)
    {
        // 这里如果直接写 mcm 的话会让启动的时候白屏时间更久
        // 注意注意，这个东西访问的时候必须要自己手动加 index.html，这个坑已经踩两次了
        coreWebView2.SetVirtualHostNameToFolderMapping("mcm.invalid", StaticSettings.wwwroot, CoreWebView2HostResourceAccessKind.Deny);
        if (loopbackUrl != null)
            coreWebView2.AddScriptToExecuteOnDocumentCreatedAsync($"globalThis.backendUrl = `{loopbackUrl.ToString().TrimEnd('/')}`");
    }

    private async void OnWebResourceRequested(object? sender, CoreWebView2WebResourceRequestedEventArgs args)
    {
        logger.LogInformation("Handle request: {uri}", args.Request.Uri);
        var uri = new UriBuilder(args.Request.Uri)
        {
            Host = loopbackUrl.Host
        };
        using var client = new HttpClient();
        var req = new HttpRequestMessage
        {
            Method = HttpMethod.Parse(args.Request.Method),
            RequestUri = uri.Uri,
            Content = args.Request.Content != null ? new StreamContent(args.Request.Content) : null,
        };
        foreach (var header in args.Request.Headers)
        {
            req.Headers.TryAddWithoutValidation(header.Key, header.Value);
        }

        var response = await client.SendAsync(req);
        args.Response = webView21.CoreWebView2.Environment.CreateWebResourceResponse(await response.Content.ReadAsStreamAsync(), (int)response.StatusCode, response.ReasonPhrase,
            response.Headers.ToString());
    }

    private static void webView21_PermissionRequested(object? sender, CoreWebView2PermissionRequestedEventArgs e)
    {
        if (e.PermissionKind is CoreWebView2PermissionKind.FileReadWrite or CoreWebView2PermissionKind.Autoplay)
        {
            e.State = CoreWebView2PermissionState.Allow;
        }
    }

    private void Browser_FormClosed(object sender, FormClosedEventArgs e)
    {
        webView21.Dispose();
        AppLifecycleManager.CheckShouldExit();
    }

    public async void InjectBackendUrl(string url)
    {
        loopbackUrl = new Uri(url);
        Text = $"MaiChartManager ({StaticSettings.GamePath})";
        await webView21.EnsureCoreWebView2Async();
        webView21.CoreWebView2.PostWebMessageAsString(url);
        await webView21.CoreWebView2.AddScriptToExecuteOnDocumentCreatedAsync($"globalThis.backendUrl = `{url}`");
    }
}