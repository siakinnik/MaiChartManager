using System.Text.RegularExpressions;
using MaiChartManager.Services;
using Microsoft.AspNetCore.Mvc;
using SimaiSharp;
using SimaiSharp.Structures;

namespace MaiChartManager.Controllers.Charts;

[ApiController]
[Route("MaiChartManagerServlet/[action]Api")]
public class ImportChartController(StaticSettings settings, ILogger<StaticSettings> logger, 
    MaidataImportService importService) : ControllerBase
{
    public record ImportChartCheckResult(bool Accept, IEnumerable<ImportChartMessage> Errors, Dictionary<ShiftMethod, float> chartPaddings, bool IsDx, string? Title, float first);

    [HttpPost]
    public ImportChartCheckResult ImportChartCheck(IFormFile file, [FromForm] bool isReplacement = false)
    {
        var errors = new List<ImportChartMessage>();
        var fatal = false;

        if (isReplacement)
        {
            // 替换谱面的操作也需要检查的过程，但检查的逻辑和导入谱面时可以说是一模一样的，故直接共用逻辑
            // 唯一的区别是给用户一个警告，明确说明直接替换谱面功能的适用范围
            errors.Add(new ImportChartMessage(Locale.NotesReplacementWarning, MessageLevel.Warning));
        }

        try
        {
            var kvps = new SimaiFile(file.OpenReadStream()).ToKeyValuePairs();
            var maiData = new Dictionary<string, string>();
            foreach (var (key, value) in kvps)
            {
                maiData[key] = value;
            }

            var title = maiData.GetValueOrDefault("title");
            if (string.IsNullOrWhiteSpace(maiData.GetValueOrDefault("title")))
            {
                errors.Add(new ImportChartMessage(Locale.MusicNoTitle, MessageLevel.Fatal));
                fatal = true;
            }

            var levels = new bool[5];
            var allChartText = new Dictionary<int, string>();

            for (var i = 0; i < 5; i++)
            {
                // maidata 里 2 是绿谱，6 是白谱
                if (!string.IsNullOrWhiteSpace(maiData.GetValueOrDefault($"inote_{i + 2}")))
                {
                    levels[i] = true;
                    allChartText.Add(i + 2, maiData.GetValueOrDefault($"inote_{i + 2}"));
                }
            }

            if (levels.Any(it => it))
            {
                string[] levelNames = [Locale.DifficultyBasic, Locale.DifficultyAdvanced, Locale.DifficultyExpert, Locale.DifficultyMaster, Locale.DifficultyReMaster];
                var message = Locale.ImportingDifficulties;
                for (var i = 0; i < 5; i++)
                {
                    if (levels[i])
                    {
                        message += levelNames[i] + " ";
                    }
                }

                errors.Add(new ImportChartMessage(message, MessageLevel.Info));
            }

            foreach (var i in (int[])[7, 8, 0])
            {
                if (string.IsNullOrWhiteSpace(maiData.GetValueOrDefault($"inote_{i}"))) continue;
                allChartText.Add(i, maiData.GetValueOrDefault($"inote_{i}"));
                if (!levels[3])
                {
                    levels[3] = true;
                    errors.Add(new ImportChartMessage(string.Format(Locale.DifficultyImportedAsMaster, i), MessageLevel.Warning));
                }
                else if (!levels[4])
                {
                    levels[4] = true;
                    errors.Add(new ImportChartMessage(string.Format(Locale.DifficultyImportedAsReMaster, i), MessageLevel.Warning));
                }
                else if (!levels[0])
                {
                    levels[0] = true;
                    errors.Add(new ImportChartMessage(string.Format(Locale.DifficultyImportedAsBasic, i), MessageLevel.Warning));
                }
                else
                {
                    errors.Add(new ImportChartMessage(string.Format(Locale.DifficultyIgnored, i), MessageLevel.Warning));
                }
            }

            if (!levels.Any(it => it))
            {
                errors.Add(new ImportChartMessage(Locale.MusicNoCharts, MessageLevel.Fatal));
                fatal = true;
                return new ImportChartCheckResult(!fatal, errors, new Dictionary<ShiftMethod, float>(), false, title, 0);
            }

            float.TryParse(maiData.GetValueOrDefault("first"), out var first);
            var isDx = false;
            var maiCharts = new List<MaiChart>();

            foreach (var kvp in allChartText)
            {
                var chartText = kvp.Value;
                var measures = MaidataImportService.MeasureTagRegex().Matches(chartText);
                foreach (Match measure in measures)
                {
                    if (!float.TryParse(measure.Groups[1].Value, out var measureValue)) continue;
                    if (measureValue > 384)
                    {
                        errors.Add(new ImportChartMessage(string.Format(Locale.ChartInvalidMeasure, kvp.Key, measureValue), MessageLevel.Fatal));
                        fatal = true;
                        goto foreachAllChartTextContinue;
                    }
                }

                try
                {
                    var chart = importService.TryParseChartSimaiSharp(chartText, kvp.Key, errors);
                    maiCharts.Add(chart);

                    var candidate = importService.TryParseChart(chartText, chart, kvp.Key, errors);
                    if (candidate is null) throw new Exception(Locale.ChartParseGenericError);
                    isDx = isDx || candidate.IsDxChart;
                }
                catch (Exception e)
                {
                    logger.LogError(e, "解析谱面失败");
                    errors.Add(new ImportChartMessage(string.Format(Locale.ChartDifficultyParseFailed, kvp.Key), MessageLevel.Fatal));
                    fatal = true;
                }

            foreachAllChartTextContinue: ;
            }

            var chartPaddings = MaidataImportService.CalcChartPadding(maiCharts, out _);

            return new ImportChartCheckResult(!fatal, errors, chartPaddings, isDx, title, first);
        }
        catch (Exception e)
        {
            logger.LogError(e, "解析谱面失败（大）");
            errors.Add(new ImportChartMessage(Locale.ChartParseFailedGlobal, MessageLevel.Fatal));
            fatal = true;
            return new ImportChartCheckResult(!fatal, errors, new Dictionary<ShiftMethod, float>(), false, "", 0);
        }
    }
    
    [HttpPost]
    // 创建完 Music 后调用
    public ImportChartResult ImportChart(
        [FromForm] int id,
        IFormFile file,
        [FromForm] bool ignoreLevelNum,
        [FromForm] int addVersionId,
        [FromForm] int genreId,
        [FromForm] int version,
        [FromForm] string assetDir,
        [FromForm] ShiftMethod shift,
        [FromForm] bool debug = false)
    {
        var music = settings.GetMusic(id, assetDir);
        var importMaidataResult = importService.ImportMaidata(music, file, shift, ignoreLevelNum, debug);
        if (!importMaidataResult.Fatal)
        {
            music.AddVersionId = addVersionId;
            music.GenreId = genreId;
            music.Version = version;
            music.Save();
            music.Refresh();
        }

        return importMaidataResult;
    }
}