using System.Resources;

namespace MaiChartManager;

public static class AppLifecycleManager
{
    private static NotifyIcon? _trayIcon;

    public static bool HasTrayIcon => _trayIcon?.Visible == true;

    public static void ShowTrayIcon()
    {
        AppMain.UiContext?.Post(_ =>
        {
            if (_trayIcon != null && _trayIcon.Visible)
                return;

            // Load icon from Launcher's embedded resources (avoids duplicating base64 data)
            var rm = new ResourceManager("MaiChartManager.Launcher", typeof(Launcher).Assembly);
            var icon = (Icon?)rm.GetObject("notifyIcon1.Icon");

            var contextMenu = new ContextMenuStrip();
            var openItem = new ToolStripMenuItem("打开窗口");
            openItem.Click += (_, _) => { var url = ServerManager.GetLoopbackUrl(); if (url != null) ShowBrowser(url); };
            var exitItem = new ToolStripMenuItem("退出");
            exitItem.Click += (_, _) =>
            {
                // Dispose tray icon directly here (we're already on UI thread via the click handler)
                _trayIcon?.Dispose();
                _trayIcon = null;
                Application.Exit();
            };
            contextMenu.Items.Add(openItem);
            contextMenu.Items.Add(exitItem);

            _trayIcon = new NotifyIcon
            {
                Icon = icon,
                Text = "MaiChartManager",
                ContextMenuStrip = contextMenu,
                Visible = true,
            };

            _trayIcon.MouseClick += (_, e) =>
            {
                if (e.Button == MouseButtons.Left) { var url = ServerManager.GetLoopbackUrl(); if (url != null) ShowBrowser(url); }
            };
        }, null);
    }

    public static void HideTrayIcon()
    {
        AppMain.UiContext?.Post(_ =>
        {
            _trayIcon?.Dispose();
            _trayIcon = null;
        }, null);
    }

    public static void CheckShouldExit()
    {
        var browserAlive = AppMain.BrowserWin is { IsDisposed: false };
        var oobeAlive = AppMain.OobeBrowser is { IsDisposed: false };
        if (!browserAlive && !oobeAlive && !HasTrayIcon)
        {
            Application.Exit();
        }
    }

    public static void ShowBrowser(string loopbackUrl)
    {
        AppMain.UiContext?.Post(_ =>
        {
            if (AppMain.BrowserWin is null || AppMain.BrowserWin.IsDisposed)
            {
                AppMain.BrowserWin = new Browser(loopbackUrl);
                AppMain.BrowserWin.Show();
            }
            else
            {
                AppMain.BrowserWin.Activate();
            }
        }, null);
    }
}
