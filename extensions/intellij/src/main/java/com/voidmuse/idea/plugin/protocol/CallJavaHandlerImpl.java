package com.voidmuse.idea.plugin.protocol;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.codec.Base64;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.google.common.collect.Lists;
import com.intellij.codeInsight.navigation.NavigationUtil;
import com.intellij.openapi.application.ApplicationManager;
import com.intellij.openapi.application.ReadAction;
import com.intellij.openapi.command.WriteCommandAction;
import com.intellij.openapi.diagnostic.Logger;
import com.intellij.openapi.editor.Document;
import com.intellij.openapi.editor.Editor;
import com.intellij.openapi.fileEditor.FileEditorManager;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.ui.Messages;
import com.intellij.openapi.util.Computable;
import com.intellij.openapi.vfs.LocalFileSystem;
import com.intellij.openapi.vfs.VirtualFile;
import com.intellij.psi.*;
import com.intellij.psi.search.GlobalSearchScope;
import com.intellij.DynamicBundle;
import com.voidmuse.idea.plugin.call.CallJavaReq;
import com.voidmuse.idea.plugin.codebase.embedding.EmbeddingsService;
import com.voidmuse.idea.plugin.codebase.embedding.FindNearFileInfo;
import com.voidmuse.idea.plugin.codebase.task.CodebaseIndexingAllTask;
import com.voidmuse.idea.plugin.codebase.vector.LuceneVectorStore;
import com.voidmuse.idea.plugin.common.AlarmInfo;
import com.voidmuse.idea.plugin.common.PluginDataPersistent;
import com.voidmuse.idea.plugin.editor.ToggleToolWindowAction;
import com.voidmuse.idea.plugin.file.FileInfo;
import com.voidmuse.idea.plugin.mcp.McpService;
import com.voidmuse.idea.plugin.service.CallJavaScriptService;
import com.voidmuse.idea.plugin.service.FileService;
import com.voidmuse.idea.plugin.setting.ConfigurationSettings;
import com.voidmuse.idea.plugin.util.FindFieldUtils;
import com.voidmuse.idea.plugin.util.ThemeUtils;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileWriter;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.util.concurrent.ConcurrentHashMap;
import java.net.URI;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.nio.charset.StandardCharsets;

import static com.voidmuse.idea.plugin.protocol.CallJavaProtocol.*;

/**
 * @author zhangdaguan
 */
public class CallJavaHandlerImpl implements CallJavaHandler {
    private static final Logger LOG = Logger.getInstance(CallJavaHandlerImpl.class);

    private static volatile CallJavaHandlerImpl instance;
    private ObjectWriter beanToJson = new ObjectMapper().writer().withDefaultPrettyPrinter();

    public static CallJavaHandlerImpl getInstance() {
        if (instance == null) {
            synchronized (CallJavaHandlerImpl.class) {
                if (instance == null) {
                    instance = new CallJavaHandlerImpl();
                }
            }
        }
        return instance;
    }

    @Override
    public String handleCallJava(Project project, CallJavaReq callJavaReq) throws Exception {
        Map<String, Object> arg = callJavaReq.getArg();

        if (jumpToFile.name().equals(callJavaReq.getMethodName())) {
            AlarmInfo alarmInfo = BeanUtil.fillBeanWithMap(arg, new AlarmInfo(), false);
            jumpToFile(project, alarmInfo.getAlarmClass(), alarmInfo.getAlarmMethod());
            return "success";
        }
        if (canLocateClassMethod.name().equals(callJavaReq.getMethodName())) {
            AlarmInfo alarmInfo = BeanUtil.fillBeanWithMap(arg, new AlarmInfo(), false);
            Boolean result = canLocateClassMethod(project, alarmInfo.getAlarmClass(), alarmInfo.getAlarmMethod());
            return String.valueOf(result);
        }
        if (jumpToFileByPath.name().equals(callJavaReq.getMethodName())) {
            jumpToFileByPath(project, arg.get("path").toString(),
                    String.valueOf(ObjectUtils.defaultIfNull(arg.get("fieldName"), "")),
                    String.valueOf(ObjectUtils.defaultIfNull(arg.get("startLine"), "")));
            return "success";
        }

        if (findFile.name().equals(callJavaReq.getMethodName())) {
            return findFile(project, arg.get("fileName").toString());
        }

        if (persistentState.name().equals(callJavaReq.getMethodName())) {
            PluginDataPersistent dataPersistent = PluginDataPersistent.getInstance();
            for (Map.Entry<String, Object> entry : arg.entrySet()) {
                dataPersistent.getState().putData(entry.getKey(), entry.getValue().toString());
            }
            if (arg.containsKey("global:mcps")) {
                McpService.getInstance().reloadConfig(arg.get("global:mcps").toString());
            }
            return "success";
        }

        if (getPersistentState.name().equals(callJavaReq.getMethodName())) {
            PluginDataPersistent dataPersistent = PluginDataPersistent.getInstance();
            return dataPersistent.getState().getData(arg.get("key").toString());
        }

        if (getFileContent.name().equals(callJavaReq.getMethodName())) {
            String path = arg.get("path").toString();
            return getFileContent(project, path);
        }
        if (openUrl.name().equals(callJavaReq.getMethodName())) {
            String url = arg.get("url").toString();
            URI uri = URI.create(url);
            java.awt.Desktop.getDesktop().browse(uri);
            return "success";
        }
        if (handleJsCallback.name().equals(callJavaReq.getMethodName())) {
            CallJavaScriptService callJavaScriptService = CallJavaScriptService.getInstance(project);
            if (callJavaScriptService != null) {
                callJavaScriptService.handleCallback(callJavaReq);
            }
            return "success";
        }
        if (buildWithCodebaseContext.name().equals(callJavaReq.getMethodName())) {
            String prompt = arg.get("prompt").toString();
            String optimizePrompt = arg.get("optimizePrompt").toString();
            List<FindNearFileInfo> fileInfos = EmbeddingsService.getInstance(project).buildWithCodebaseContext(prompt, optimizePrompt);
            return JSONUtil.toJsonStr(fileInfos);
        }
        if (isCodebaseIndexExists.name().equals(callJavaReq.getMethodName())) {
            return String.valueOf(LuceneVectorStore.getInstance(project).isIndexExists());
        }
        if (getSelectedFiles.name().equals(callJavaReq.getMethodName())) {
            return getSelectedFiles(project);
        }
        if (codeToInsert.name().equals(callJavaReq.getMethodName())) {
            String content = arg.get("content").toString();
            insertContentAtCursor(project, content);
            return "success";
        }
        if (getProjectConfig.name().equals(callJavaReq.getMethodName())) {
            return JSONUtil.toJsonStr(getProjectInfo(project));
        }
        if (closeWindow.name().equals(callJavaReq.getMethodName())) {
            //关闭tool window
            ToggleToolWindowAction.closeToolWindow(project);
        }
        if (getCodebaseIndexingProgress.name().equals(callJavaReq.getMethodName())) {
            //获取当前项目的索引进度 0~1
            return String.valueOf(CodebaseIndexingAllTask.getProjectIndicatorValue(project));
        }
        if (testMcpConnection.name().equals(callJavaReq.getMethodName())) {
            //测试mcp连接
            String name = arg.get("name").toString();
            return JSONUtil.toJsonStr(McpService.getInstance().testMcpConnection(name));
        }
        if (getMcpTools.name().equals(callJavaReq.getMethodName())) {
            //获取mcp工具列表
            return beanToJson.writeValueAsString(McpService.getInstance().getMcpTools());
        }
        if (callMcpTool.name().equals(callJavaReq.getMethodName())) {
            //调用mcp工具
            String serviceName = arg.get("serviceName").toString();
            String toolName = arg.get("toolName").toString();
            Map<String, Object> params = (Map<String, Object>) arg.get("params");
            return beanToJson.writeValueAsString(McpService.getInstance().callMcpTool(serviceName, toolName, params));
        }
        if (writeFile.name().equals(callJavaReq.getMethodName())) {
            //通用的写文件方法，支持diff展示
            writeFileWithDiff(project, arg);
            return "success";
        }
        if (getUrlContent.name().equals(callJavaReq.getMethodName())) {
            String url = arg.get("url").toString();
            return getUrlContent(url);
        }

        if (executeCommand.name().equals(callJavaReq.getMethodName())) {
            String command = arg.get("command").toString();
            return executeCommand(command);
        }

        if (executeScript.name().equals(callJavaReq.getMethodName())) {
            String script = arg.get("script").toString();
            String requestId = arg.get("requestId").toString();
            executeScript(script, requestId);
            return "success";
        }

        if (getScriptStatus.name().equals(callJavaReq.getMethodName())) {
            String requestId = arg.get("requestId").toString();
            return getScriptStatus(requestId);
        }

        if (stopScript.name().equals(callJavaReq.getMethodName())) {
            String requestId = arg.get("requestId").toString();
            return stopScript(requestId);
        }
        return "";
    }

    private boolean canLocateClassMethod(Project project, String className, String methodName) {
        LOG.info(String.format("canLocateClassMethod, className: %s, methodName: %s", className, methodName));
        if (StrUtil.isBlank(className) || StrUtil.isBlank(methodName)) {
            return false;
        }
        //需要用ui线程去做读操作，不然会抛异常
        return ApplicationManager.getApplication().runReadAction((Computable<Boolean>) () -> {
            PsiClass psiClass = JavaPsiFacade.getInstance(project)
                    .findClass(className, GlobalSearchScope.allScope(project));
            if (psiClass == null) {
                return false;
            }
            for (PsiMethod method : psiClass.getMethods()) {
                if (methodName.equals(method.getName())) {
                    return true;
                }
            }
            return false;
        });
    }

    private void jumpToFile(Project project, String className, String methodName) {
        LOG.info(String.format("jumpToFile, className: %s, methodName: %s", className, methodName));
        boolean flag = StrUtil.isBlank(className) || StrUtil.isBlank(methodName);
        ApplicationManager.getApplication().invokeLater(new Runnable() {
            @Override
            public void run() {
                if (flag) {
                    Messages.showErrorDialog(project, "类名和方法名均不能为空", "提示");
                }
            }
        });

        if (!flag) {
            ReadAction.run(() -> {
                PsiClass psiClass = JavaPsiFacade.getInstance(project)
                        .findClass(className, GlobalSearchScope.allScope(project));
                ApplicationManager.getApplication().invokeLater(() -> {
                    if (psiClass == null) {
                        Messages.showErrorDialog(project, String.format("未找到该类名: %s", className), "提示");
                        return;
                    }

                    boolean methodFound = false;
                    for (PsiMethod method : psiClass.getMethods()) {
                        if (methodName.equals(method.getName())) {
                            NavigationUtil.activateFileWithPsiElement(method);
                            methodFound = true;
                            break;
                        }
                    }

                    if (!methodFound) {
                        Messages.showErrorDialog(project, String.format("未找到该方法名: %s 在类 %s 中", methodName, className), "提示");
                    }
                });
            });
        }
    }

    private void jumpToFileByPath(Project project, String path, String fieldName, String startLine) {
        ReadAction.run(() -> {
            VirtualFile virtualFile = LocalFileSystem.getInstance().findFileByPath(path);
            if (virtualFile == null) {
                return;
            }
            PsiFile psiFile = PsiManager.getInstance(project).findFile(virtualFile);
            if (psiFile == null) {
                // 无法解析为 PsiFile，直接返回
                return;
            }
            ApplicationManager.getApplication().invokeLater(() -> {
                if (StringUtils.isNotBlank(startLine)) {
                    try {
                        int start = Integer.parseInt(startLine);
                        FindFieldUtils.navigateToLine(project, virtualFile, start);
                        return;
                    } catch (NumberFormatException e) {
                        LOG.warn("Invalid line number format", e);
                    }
                }

                if (StringUtils.isNotBlank(fieldName)) {
                    // 如果是代码文件，查找字段
                    PsiElement fieldElement = FindFieldUtils.findFieldInCodeFile(psiFile, fieldName);
                    if (fieldElement != null) {
                        NavigationUtil.activateFileWithPsiElement(fieldElement, true);
                        return;
                    }

                    //如果没找到代码变量，则查找文本内容
                    int lineNumber = FindFieldUtils.findTextInFile(virtualFile, fieldName);
                    if (lineNumber != -1) {
                        FindFieldUtils.navigateToLine(project, virtualFile, lineNumber);
                        return;
                    }
                }
                //以上操作都没成功，直接跳转
                NavigationUtil.activateFileWithPsiElement(psiFile);
            });
        });
    }

    private void insertContentAtCursor(Project project, String content) {
        ApplicationManager.getApplication().invokeLater(() -> {
            Editor editor = FileEditorManager.getInstance(project).getSelectedTextEditor();
            if (editor != null) {
                Document document = editor.getDocument();
                int offset = editor.getCaretModel().getCurrentCaret().getOffset();
                WriteCommandAction.runWriteCommandAction(project, () -> {
                    document.insertString(offset, content);
                });
            }
        });
    }

    private Map<String, String> getProjectInfo(Project project) {
        Map<String, String> projectInfo = new HashMap<>();
        projectInfo.put("projectName", project.getName());
        projectInfo.put("projectPath", project.getBasePath());
        String osName = System.getProperty("os.name").toLowerCase();
        String osVersion = System.getProperty("os.version");
        String systemInfo;
        if (osName.contains("win")) {
            systemInfo = "Windows|" + osVersion;
        } else if (osName.contains("mac")) {
            systemInfo = "macOS|" + osVersion;
        } else if (osName.contains("nix") || osName.contains("nux") || osName.contains("aix")) {
            systemInfo = "Linux|" + osVersion;
        } else {
            systemInfo = "Unknown|" + osVersion;
        }
        projectInfo.put("systemVersion", systemInfo);
        String themeType = ThemeUtils.isDarkTheme() ? "dark" : "light";
        projectInfo.put("theme", themeType);
        Locale locale = DynamicBundle.getLocale();
        projectInfo.put("language", locale.getLanguage());
        return projectInfo;
    }

    private String findFile(Project project, String keyword) {
        FileService fileService = FileService.getInstance(project);
        return JSONUtil.toJsonStr(fileService.findFile(keyword));
    }

    private String getSelectedFiles(Project project) {
        List<FileInfo> retFiles = Lists.newArrayList();
        //检查开关
        if (ConfigurationSettings.Companion.getState().getChatAutoReferenceSelectedFile()) {
            FileService fileService = FileService.getInstance(project);
            retFiles = fileService.getSelectedFiles();
        }
        return JSONUtil.toJsonStr(retFiles);
    }

    private void writeFileWithDiff(Project project, Map<String, Object> arg) {
        try {
            // 获取参数
            String filePath = arg.get("filePath").toString();
            String newContent = arg.get("content").toString();

            // 可选参数：是否显示diff（默认true）
            boolean showDiff = arg.containsKey("showDiff") ?
                    Boolean.parseBoolean(arg.get("showDiff").toString()) : true;

            // 可选参数：指定行范围（如果不指定则处理整个文件）
            Integer startLine = arg.containsKey("startLine") ?
                    Integer.parseInt(arg.get("startLine").toString()) : null;
            Integer endLine = arg.containsKey("endLine") ?
                    Integer.parseInt(arg.get("endLine").toString()) : null;

            ApplicationManager.getApplication().invokeLater(() -> {
                // 打开文件
                VirtualFile virtualFile = LocalFileSystem.getInstance().findFileByPath(filePath);
                if (virtualFile != null) {
                    FileEditorManager fileEditorManager = FileEditorManager.getInstance(project);
                    Editor editor = fileEditorManager.openTextEditor(
                            new com.intellij.openapi.fileEditor.OpenFileDescriptor(project, virtualFile), true);

                    if (editor != null) {
                        if (showDiff) {
                            // 获取当前文件内容
                            String currentContent = editor.getDocument().getText();

                            // 如果指定了行范围，只处理指定范围的内容
                            String originalContent = currentContent;
                            if (startLine != null && endLine != null) {
                                int startOffset = editor.getDocument().getLineStartOffset(startLine - 1);
                                int endOffset = editor.getDocument().getLineEndOffset(endLine - 1);
                                originalContent = editor.getDocument().getText(
                                        new com.intellij.openapi.util.TextRange(startOffset, endOffset));
                            }

                            // 创建DiffStreamHandler来展示diff
                            int diffStartLine = startLine != null ? startLine - 1 : 0;
                            int diffEndLine = endLine != null ? endLine - 1 : editor.getDocument().getLineCount() - 1;

                            com.voidmuse.idea.plugin.editor.DiffStreamHandler diffStreamHandler =
                                    new com.voidmuse.idea.plugin.editor.DiffStreamHandler(
                                            project, editor, diffStartLine, diffEndLine,
                                            () -> {
                                            }, // onClose
                                            () -> {
                                            }  // onFinish
                                    );

                            // 使用新添加的方法处理外部diff结果
                            diffStreamHandler.handleExternalDiffResult(filePath, originalContent, newContent);
                        } else {
                            // 直接写入文件，不显示diff
                            WriteCommandAction.runWriteCommandAction(project, () -> {
                                if (startLine != null && endLine != null) {
                                    // 替换指定行范围
                                    int startOffset = editor.getDocument().getLineStartOffset(startLine - 1);
                                    int endOffset = editor.getDocument().getLineEndOffset(endLine - 1);
                                    editor.getDocument().replaceString(startOffset, endOffset, newContent);
                                } else {
                                    // 替换整个文件
                                    editor.getDocument().setText(newContent);
                                }
                            });
                        }
                    }
                }
            });
        } catch (Exception e) {
            LOG.error("Error writing file with diff", e);
        }
    }

    private String getFileContent(Project project, String path) {
        FileService fileService = FileService.getInstance(project);
        String fileContent = fileService.getFileContent(path);
        return Base64.encode(fileContent);
    }

    // 获取URL内容的实现
    private String getUrlContent(String urlString) {
        HttpURLConnection connection = null;
        String result = "";
        try {
            URL url = new URL(urlString);
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setInstanceFollowRedirects(true);
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(10000);

            // 许多站点（含 Cloudflare/Zendesk）会拦截无UA的请求，补充常见请求头
            connection.setRequestProperty("User-Agent",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) VoidMuse-IntelliJ/1.0 Chrome/118.0 Safari/537.36");
            connection.setRequestProperty("Accept",
                    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
            connection.setRequestProperty("Accept-Language", "en-US,en;q=0.9");
            connection.setRequestProperty("Accept-Encoding", "gzip,deflate");
            // 使用站点根作为通用 Referer，有助于绕过部分拦截
            connection.setRequestProperty("Referer", url.getProtocol() + "://" + url.getHost() + "/");

            int status = connection.getResponseCode();
            InputStream stream = (status >= 200 && status < 300)
                    ? connection.getInputStream()
                    : connection.getErrorStream();

            if (stream == null) {
                throw new java.io.IOException("HTTP " + status + " with empty body");
            }

            // 处理压缩响应
            String contentEncoding = connection.getContentEncoding();
            if (contentEncoding != null) {
                String enc = contentEncoding.toLowerCase();
                if (enc.contains("gzip")) {
                    stream = new java.util.zip.GZIPInputStream(stream);
                } else if (enc.contains("deflate")) {
                    stream = new java.util.zip.InflaterInputStream(stream);
                }
            }

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
                StringBuilder content = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    content.append(line).append("\n");
                }
                if (status >= 200 && status < 300) {
                    LOG.info("Successfully fetched content from URL: " + urlString);
                    result = content.toString();
                    
                } else {
                    LOG.error("Failed to fetch content from URL: " + urlString + " with HTTP status: " + status);
                    result =  "Error: HTTP " + status + " " + content.toString();
                }
            }
        } catch (Exception e) {
            LOG.error("Error getting URL content: " + urlString, e);
            result = "Error: " + e.getMessage();
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
        return Base64.encode(result);
    }

    // 执行命令的实现
    private String executeCommand(String command) {
        try {
            Process process = Runtime.getRuntime().exec(command);
            StringBuilder output = new StringBuilder();

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }

            try (BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
                String line;
                while ((line = errorReader.readLine()) != null) {
                    output.append("ERROR: ").append(line).append("\n");
                }
            }
            return output.toString();
        } catch (Exception e) {
            LOG.error("Error executing command: " + command, e);
            return "Error: " + e.getMessage();
        }
    }

    // 存储脚本执行状态的Map
    private static final Map<String, ScriptExecutionStatus> scriptStatusMap = new ConcurrentHashMap<>();

    // 脚本执行状态类
    private static class ScriptExecutionStatus {
        private volatile int status; // 0=完成, 1=执行中, 2=失败
        private final StringBuilder output = new StringBuilder();
        private volatile Process process; // 进程引用，用于停止脚本

        public synchronized void appendOutput(String text) {
            output.append(text);
        }

        public synchronized String getOutput() {
            return output.toString();
        }

        public synchronized void setProcess(Process process) {
            this.process = process;
        }

        public synchronized Process getProcess() {
            return process;
        }
    }

    // 执行脚本的实现
    private void executeScript(String script, String requestId) {
        ScriptExecutionStatus status = new ScriptExecutionStatus();
        status.status = 1; // 设置为执行中
        scriptStatusMap.put(requestId, status);

        ApplicationManager.getApplication().executeOnPooledThread(() -> {
            try {
                // 检测操作系统类型
                String osName = System.getProperty("os.name").toLowerCase();
                boolean isWindows = osName.contains("win");

                // 根据操作系统创建相应的临时脚本文件
                String scriptExtension = isWindows ? ".bat" : ".sh";
                File tempScript = File.createTempFile("script_", scriptExtension);

                try (FileWriter writer = new FileWriter(tempScript)) {
                    writer.write(script);
                }

                // 设置脚本可执行权限（仅在非Windows系统）
                if (!isWindows) {
                    tempScript.setExecutable(true);
                }

                // 构建执行命令
                ProcessBuilder processBuilder;
                if (isWindows) {
                    // Windows使用cmd执行批处理文件
                    processBuilder = new ProcessBuilder("cmd", "/c", tempScript.getAbsolutePath());
                } else {
                    // Unix/Linux直接执行shell脚本
                    processBuilder = new ProcessBuilder(tempScript.getAbsolutePath());
                }

                processBuilder.redirectErrorStream(true);
                Process process = processBuilder.start();
                status.setProcess(process); // 保存进程引用

                // 读取输出
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), "UTF-8"))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        status.appendOutput(line + "\n");
                    }
                }

                int exitCode = process.waitFor();
                if (exitCode == 0) {
                    status.status = 0; // 完成
                } else {
                    status.status = 2; // 失败
                    status.appendOutput("Script execution failed with exit code: " + exitCode + "\n");
                }

                // 清理临时文件
                tempScript.delete();
            } catch (Exception e) {
                status.status = 2; // 失败
                status.appendOutput("Error executing script: " + e.getMessage() + "\n");
                LOG.error("Error executing script for requestId: " + requestId, e);
            }
        });
    }

    // 获取脚本状态的实现
    private String getScriptStatus(String requestId) {
        ScriptExecutionStatus status = scriptStatusMap.get(requestId);
        if (status == null) {
            return "{\"status\":2, \"output\":\"No script execution found for requestId: " + requestId + "\"}";
        }

        Map<String, Object> result = new HashMap<>();
        result.put("status", status.status);
        result.put("output", status.getOutput());

        return JSONUtil.toJsonStr(result);
    }

    // 停止脚本执行的实现
    private String stopScript(String requestId) {
        ScriptExecutionStatus status = scriptStatusMap.get(requestId);
        if (status == null) {
            return "{\"status\":2, \"output\":\"No script execution found for requestId: " + requestId + "\"}";
        }

        Process process = status.getProcess();
        if (process != null && process.isAlive()) {
            try {
                process.destroyForcibly();
                status.status = 2; // 设置为失败状态
                status.appendOutput("\nScript execution stopped by user request.\n");
                LOG.info("Script execution stopped for requestId: " + requestId);
            } catch (Exception e) {
                LOG.error("Error stopping script for requestId: " + requestId, e);
                status.appendOutput("\nError stopping script: " + e.getMessage() + "\n");
            }
        } else {
            status.appendOutput("\nScript is not running or already completed.\n");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("status", status.status);
        result.put("output", status.getOutput());

        return JSONUtil.toJsonStr(result);
    }

}
