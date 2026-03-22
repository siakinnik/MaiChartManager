using System.Text.RegularExpressions;
using MaiChartManager.Controllers.Music;
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
    public record ImportChartCheckResult(bool Accept, IEnumerable<ImportChartMessage> Errors, Dictionary<ShiftMethod, float> chartPaddings, bool IsDx, string? Title, float first, CueConvertController.SetAudioPreviewRequest? previewTime);

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

            var allChartText = new Dictionary<int, string>();
            for (var i = 0; i < 9; i++)
            {
                if (i == 1) continue; // maidata 中 inote_1 无对应游戏难度，与 ImportMaidata 保持一致
                if (!string.IsNullOrWhiteSpace(maiData.GetValueOrDefault($"inote_{i}")))
                {
                    allChartText.Add(i, maiData.GetValueOrDefault($"inote_{i}"));
                }
            }
            var targetLevelMap = MaidataImportService.MapMaidataLevelToGame(allChartText.Keys.ToList());

            # region 向前端返回，关于导入谱面的inote_映射到游戏中的难度的提示信息
            string[] levelNames = [Locale.DifficultyBasic, Locale.DifficultyAdvanced, Locale.DifficultyExpert, Locale.DifficultyMaster, Locale.DifficultyReMaster];
            string[] importAsMessages = [Locale.DifficultyImportedAsBasic, null, null, Locale.DifficultyImportedAsMaster, Locale.DifficultyImportedAsReMaster];
            
            string generalImportMessage = ""; // “将导入以下难度：” 的默认信息
            var extraImportMessages = new List<string>(); // “有一个难度为 {0} 的谱面，将导入为XX谱 ” 的信息
            foreach (var (lv, _) in allChartText)
            {
                if (!targetLevelMap.TryGetValue(lv, out var targetLevel))
                { // 根据targetLevelMap返回的结果，该谱面应被忽略
                    extraImportMessages.Add(string.Format(Locale.DifficultyIgnored, lv));
                    continue;
                }
                if (2 <= lv && lv <= 6)
                {
                    generalImportMessage += levelNames[targetLevel] + " ";
                }
                else
                {
                    extraImportMessages.Add(string.Format(importAsMessages[targetLevel], lv));
                }
            }
            
            if (!string.IsNullOrEmpty(generalImportMessage))
            {
                errors.Add(new ImportChartMessage(Locale.ImportingDifficulties + generalImportMessage, MessageLevel.Info));
            }

            foreach (var message in extraImportMessages)
            {
                errors.Add(new ImportChartMessage(message, MessageLevel.Warning));
            }
            # endregion

            if (targetLevelMap.Count == 0) // 没有能够被映射的谱面
            {
                errors.Add(new ImportChartMessage(Locale.MusicNoCharts, MessageLevel.Fatal));
                fatal = true;
                return new ImportChartCheckResult(!fatal, errors, new Dictionary<ShiftMethod, float>(), false, title, 0, null);
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

            CueConvertController.SetAudioPreviewRequest? previewTime = null;
            if (float.TryParse(maiData.GetValueOrDefault("demo_seek"), out var demo_seek))
            {
                // 当只有demo_seek没有demo_len时，则把demo_len设为一个很大的数，表示preview直到音频结尾；SetAudioPreviewApi中会自动把实际的loopEnd限制到音频长度以内。
                if (!float.TryParse(maiData.GetValueOrDefault("demo_len"), out var demo_len)) demo_len = 10000f;
                previewTime = new CueConvertController.SetAudioPreviewRequest(demo_seek, demo_seek + demo_len);
            }
            
            return new ImportChartCheckResult(!fatal, errors, chartPaddings, isDx, title, first, previewTime);
        }
        catch (Exception e)
        {
            logger.LogError(e, "解析谱面失败（大）");
            errors.Add(new ImportChartMessage(Locale.ChartParseFailedGlobal, MessageLevel.Fatal));
            fatal = true;
            return new ImportChartCheckResult(!fatal, errors, new Dictionary<ShiftMethod, float>(), false, "", 0, null);
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