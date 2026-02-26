using Spectre.Console.Cli;

namespace MaiChartManager.CLI.Commands;

public class DebugCommand : Command
{
    public override int Execute(CommandContext context, CancellationToken cancellationToken)
    {
        Program.Main();
        return 0;
    }
}
