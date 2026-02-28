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
        StartPosition = FormStartPosition.Manual;
        Location = WebViewHelper.CalculatePosition(Width, Height);
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

        WebViewHelper.SetupCoreWebView2(webView21.CoreWebView2, loopbackUrl);

        // webView21.CoreWebView2.AddWebResourceRequestedFilter("*://mcm.invalid/MaiChartManagerServlet/*", CoreWebView2WebResourceContext.All);
        // webView21.CoreWebView2.WebResourceRequested += OnWebResourceRequested;

        webView21.CoreWebView2.PermissionRequested += WebViewHelper.OnPermissionRequested;
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
                Location = WebViewHelper.CalculatePosition(width, height),
            };
            var webView = new Microsoft.Web.WebView2.WinForms.WebView2 { Dock = DockStyle.Fill };
            form.Controls.Add(webView);
            form.Show();
            await webView.EnsureCoreWebView2Async(webView21.CoreWebView2.Environment);
            WebViewHelper.SetupCoreWebView2(webView.CoreWebView2, loopbackUrl);
            e.NewWindow = webView.CoreWebView2;
            webView.CoreWebView2.DocumentTitleChanged += (_, _) => form.Text = webView.CoreWebView2.DocumentTitle;
            form.FormClosed += (_, _) => webView.Dispose();
        }
        finally
        {
            deferral.Complete();
        }
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


    private void Browser_FormClosed(object sender, FormClosedEventArgs e)
    {
        webView21.Dispose();
        AppMain.BrowserWin = null;
        AppLifecycleManager.CheckShouldExit();
    }

    public async void InjectBackendUrl(string url)
    {
        loopbackUrl = new Uri(url);
        Text = $"MaiChartManager ({StaticSettings.GamePath})";
        await webView21.EnsureCoreWebView2Async();
        // 为后续文档创建注入 backendUrl（导航刷新时生效）
        await webView21.CoreWebView2.AddScriptToExecuteOnDocumentCreatedAsync($"globalThis.backendUrl = `{url}`");
        // 直接在当前页面设置 backendUrl，防止 PostWebMessageAsString 在 listener 注册前发送导致丢失
        await webView21.CoreWebView2.ExecuteScriptAsync($"globalThis.backendUrl = `{url}`");
        // PostWebMessage 仍然发送，用于通知已挂载的 listener 更新 apiClient.baseUrl
        webView21.CoreWebView2.PostWebMessageAsString(url);
    }
}