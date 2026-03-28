using MaiChartManager.Utils;
using Spectre.Console;
using Spectre.Console.Cli;
using System.ComponentModel;
using MaiChartManager.CLI.Utils;

namespace MaiChartManager.CLI.Commands;

public class MakeMp4Command : AsyncCommand<MakeMp4Command.Settings>
{
    public class Settings : CommandSettings
    {
        [CommandArgument(0, "<sources>")]
        [Description("要转换的 USM/DAT 文件")]
        public string[] Sources { get; set; } = [];

        [CommandOption("-O|--output")]
        [Description("输出文件路径（仅单文件时可用）")]
        public string? Output { get; set; }

        [CommandOption("-f|--force")]
        [Description("覆盖已存在的输出文件")]
        [DefaultValue(false)]
        public bool Force { get; set; }

        public override ValidationResult Validate()
        {
            if (Sources.Length == 0)
            {
                return ValidationResult.Error("至少需要一个源文件");
            }

            if (Sources.Length > 1 && !string.IsNullOrEmpty(Output))
            {
                return ValidationResult.Error("多文件转换时不能使用 -O 选项");
            }

            foreach (var source in Sources)
            {
                if (!File.Exists(source))
                {
                    return ValidationResult.Error($"源文件不存在: {source}");
                }
            }

            return ValidationResult.Success();
        }
    }

    public override async Task<int> ExecuteAsync(CommandContext context, Settings settings, CancellationToken cancellationToken)
    {
        try
        {
            if (settings.Sources.Length == 1)
            {
                var source = settings.Sources[0];
                var output = settings.Output ?? Path.ChangeExtension(source, ".mp4");

                if (!settings.Force && File.Exists(output))
                {
                    AnsiConsole.MarkupLine($"[red]✗ 输出文件已存在: {output}（使用 --force 覆盖）[/]");
                    return 1;
                }

                await ConvertSingleFile(source, output);
            }
            else
            {
                var errorCount = await ConvertMultipleFiles(settings);
                if (errorCount > 0)
                {
                    AnsiConsole.MarkupLine($"[yellow]⚠ 转换完成，{errorCount} 个文件失败（使用 --force 覆盖已存在的文件）[/]");
                    return 1;
                }
            }

            AnsiConsole.MarkupLine("[green]✓ 所有转换已成功完成！[/]");
            return 0;
        }
        catch (Exception ex)
        {
            SentrySdk.CaptureException(ex);
            AnsiConsole.MarkupLine($"[red]✗ 错误: {ex.Message}[/]");
            return 1;
        }
    }

    private async Task ConvertSingleFile(string source, string output)
    {
        AnsiConsole.MarkupLine($"[yellow]正在转换:[/] {Path.GetFileName(source)} → {Path.GetFileName(output)}");

        await AnsiConsole.Progress()
            .AutoClear(false)
            .Columns(
                new TaskDescriptionColumn(),
                new ProgressBarColumn(),
                new PercentageColumn(),
                new SpinnerColumn())
            .StartAsync(async ctx =>
            {
                var task = ctx.AddTask($"[green]转换 {Path.GetFileName(source)}[/]");
                task.MaxValue = 100;
                TerminalProgress.Set(TerminalProgress.Status.Indeterminate);

                await VideoConvert.ConvertUsmToMp4(
                    source,
                    output,
                    onProgress: percent =>
                    {
                        TerminalProgress.Set(percent);
                        task.Value = percent;
                    });

                TerminalProgress.Clear();
                task.Value = 100;
            });

        AnsiConsole.MarkupLine($"[green]✓ 已保存到: {output}[/]");
    }

    private async Task<int> ConvertMultipleFiles(Settings settings)
    {
        AnsiConsole.MarkupLine($"[yellow]正在转换 {settings.Sources.Length} 个文件...[/]");

        int doneCount = 0, errorCount = 0;
        await AnsiConsole.Progress()
            .AutoClear(false)
            .Columns(
                new TaskDescriptionColumn(),
                new ProgressBarColumn(),
                new PercentageColumn(),
                new SpinnerColumn())
            .StartAsync(async ctx =>
            {
                foreach (var source in settings.Sources)
                {
                    var output = Path.ChangeExtension(source, ".mp4");
                    var task = ctx.AddTask($"[green]{Path.GetFileName(source)}[/]");
                    task.MaxValue = 100;

                    if (!settings.Force && File.Exists(output))
                    {
                        errorCount++;
                        task.Description = $"[red]{Path.GetFileName(source)} - 输出文件已存在[/]";
                        task.Value = 100;
                        task.StopTask();
                        continue;
                    }

                    if (errorCount > 0)
                    {
                        TerminalProgress.Set(TerminalProgress.Status.Warning, (errorCount + doneCount) * 100 / settings.Sources.Length);
                    }
                    else
                    {
                        TerminalProgress.Set(doneCount * 100 / settings.Sources.Length);
                    }

                    try
                    {
                        await VideoConvert.ConvertUsmToMp4(
                            source,
                            output,
                            onProgress: percent => task.Value = percent
                        );

                        doneCount++;
                        task.Value = 100;
                    }
                    catch (Exception ex)
                    {
                        SentrySdk.CaptureException(ex);
                        errorCount++;
                        task.Description = $"[red]{Path.GetFileName(source)} - 失败[/]";
                        task.Value = 100;
                        task.StopTask();
                    }
                }
                TerminalProgress.Clear();
            });

        return errorCount;
    }
}
