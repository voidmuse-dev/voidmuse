// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { PluginConfig } from './PluginConfig';
import { Constants } from './common/Constants';
import FileService, { FileInfo } from './services/FileService';
import {EmbeddingsService} from './services/EmbeddingsService';
import AutoCompletionService from './services/AutoCompletionService';
import { Base64 } from 'js-base64';
import SettingsService from './services/SettingsService';
import McpService from './services/McpService';
import { createLogger } from './services/logger';
import InlineEditService from './services/InlineEditService';
import {getUrlContent} from './services/HttpSertvice';
import RunScriptService from './services/RunScriptService';
import { v4 as uuidv4 } from "uuid";
import { StatusBarItem } from 'vscode';
import { getJsFile, getCssFile } from './GuiAssets';

const logger = createLogger('extension');

let currentLocale = vscode.env.language;
vscode.workspace.onDidChangeConfiguration(e => {
  if (e.affectsConfiguration('locale')) {
    currentLocale = vscode.env.language;
    //refreshUI(); // 重新加载语言包并更新界面
  }
});

export function activate(context: vscode.ExtensionContext) {
    console.log('vscode voidmuse activate.');
    logger.info('vscode voidmuse activate. vscode: %s', vscode.version);
    // 创建状态栏项（位于右下角）
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right, // 右侧对齐
        10000 // 优先级（数字越小越靠右）
    );


    var WebviewViewProvider = new VoidmuseWebViewProvider(context, statusBarItem);
    // 注册视图
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'voidmuseWebView', // 视图 ID
            WebviewViewProvider, // 视图提供者
            {
                webviewOptions: { retainContextWhenHidden: true },
            },
        )
    );

    const inlineCompletionProvider = vscode.languages.registerInlineCompletionItemProvider({ pattern: '**/*.{java,kt,html,xml,jsp,js,css,ts,py,sh,json,md,xml,rb,go,cpp,c,swift,php,sql}' }, {
         async provideInlineCompletionItems(document, position, context, token) {
             const auto =  SettingsService.getAutoCompleteEnable();
             const delay =  SettingsService.getAutoCompleteDelay();
             const provider =  SettingsService.getAutoCompleteModel();
             if (!auto){
                 return undefined;
             }
             if (await AutoCompletionService.delayAndShouldDebounce(Number(delay))) {
                 return undefined;
             }

             return AutoCompletionService.getCodeCompletion(WebviewViewProvider,token,position);

         },
     });

    const decorations = vscode.window.createTextEditorDecorationType({});
    let textEditorSelection = vscode.window.onDidChangeTextEditorSelection((e) => {
        const selection = e.selections[0];
        const editor = e.textEditor;

        if (selection.isEmpty) {
            editor.setDecorations(decorations, []);
            return;
        }

        const markdownString = new vscode.MarkdownString(
            `[💬 Chat Ctrl+L](command:voidmuse.inlineToChat)|[💬 Edit Ctrl+I](command:voidmuse.inlineToEdit)`
        );

        markdownString.isTrusted = true;
        editor.setDecorations(decorations, [{
            range: selection,
            hoverMessage: markdownString,
        }]);
    });

    let inlineToChatDisposable = vscode.commands.registerCommand('voidmuse.inlineToChat', async (repository: vscode.SourceControl) => {
        
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            vscode.commands.executeCommand("voidmuseWebView.focus");
            await WebviewViewProvider.waitForWebviewReady(4000,100);

            const selection = editor.selection;
            const document = editor.document;
            
            const prefixText = document.getText(new vscode.Range(new vscode.Position(0, 0), selection.start));
            const selectedText = document.getText(selection);
            const suffixText = document.getText(new vscode.Range(selection.end, document.positionAt(document.getText().length)));
            const startLine = selection.start.line + 1;
            const endLine = selection.end.line + 1;
            const filePath = document.uri.fsPath;
            const fileName = document.fileName.split('/').pop();

            var message = {
                'methodName': 'addToChat',
                'arg': {
                    'prefix':Base64.encode(prefixText),
                    'selected': Base64.encode(selectedText),
                    'suffix':Base64.encode(suffixText),
                    'startLineNumber': startLine,
                    'endLineNumber': endLine,
                    'filePath': filePath,
                    'fileName': fileName
                }
            };

            WebviewViewProvider.postMessageToWebview({
                command: 'callJavaScript',
                message: JSON.stringify(message)
            });

            vscode.commands.executeCommand("voidmuseWebView.focus");
        }
    });

    let inlineToEditDisposable = vscode.commands.registerCommand('voidmuse.inlineToEdit', async (repository: vscode.SourceControl) => {
        showStatusBar();
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            vscode.commands.executeCommand("voidmuseWebView.focus");
            await WebviewViewProvider.waitForWebviewReady(4000,100);

            const selection = editor.selection;
            const document = editor.document;
            const filePath = document.uri.fsPath;
            const fileName = document.fileName.split('/').pop();
            const selectedText = document.getText(selection);
            let languageText = "";
            if(fileName){
                languageText = fileName.substring(fileName.lastIndexOf('.'));
            }
            
            const startLine = selection.start.line + 1;
            const endLine = selection.end.line + 1;
            

            var message = {
                'methodName': 'editCodeInChat',
                'arg': {
                    'selected': Base64.encode(selectedText),
                    'language':Base64.encode(languageText),
                    'startLineNumber': startLine,
                    'endLineNumber': endLine,
                    'filePath': filePath,
                    'fileName': fileName
                }
            };

            WebviewViewProvider.postMessageToWebview({
                command: 'callJavaScript',
                message: JSON.stringify(message)
            });

            vscode.commands.executeCommand("voidmuseWebView.focus");
        }

    });

    function showStatusBar(){
        // 显示加载状态
        const message = vscode.l10n.t('voidmuse.editCode.loading');
        statusBarItem.text = "$(loading~spin)"+message+"...";
        statusBarItem.tooltip = "loading data!";
        statusBarItem.show();
    }

    let fixCodeDisposable = vscode.commands.registerCommand('voidmuse.fixCode', async (repository: vscode.SourceControl) => {
        showStatusBar();
        const prompt = "Fix this code. If it is already 100% correct, simply rewrite the code.";
        InlineEditService.getCodeEdit(WebviewViewProvider,prompt);

    });

    let optimizeCodeDisposable = vscode.commands.registerCommand('voidmuse.optimizeCode', async (repository: vscode.SourceControl) => {
        showStatusBar();
        const prompt = "Optimize this code";
        InlineEditService.getCodeEdit(WebviewViewProvider,prompt);

    });


    let writeCommentsForCodeDisposable = vscode.commands.registerCommand('voidmuse.writeCommentsForCode', async (repository: vscode.SourceControl) => {
        showStatusBar();
        const prompt = "Write comments for this code. Do not change anything about the code itself.";
        InlineEditService.getCodeEdit(WebviewViewProvider,prompt);

    });




    let acceptDisposable = vscode.commands.registerCommand('voidmuse.acceptPartially', (fileUrl,index) => {
            InlineEditService.acceptPartially(fileUrl,index);
        });
    let rejectDisposable = vscode.commands.registerCommand('voidmuse.rejectPartially', (fileUrl,index) => {
            InlineEditService.rejectPartially(fileUrl,index);
        });

    let acceptAllDisposable = vscode.commands.registerCommand('voidmuse.acceptAll', (startLine) => {
            InlineEditService.acceptAll();
        });
    let rejectAllDisposable = vscode.commands.registerCommand('voidmuse.rejectAll', (startLine) => {
            InlineEditService.rejectAll();
        });

    const changeThemeDisposable = vscode.window.onDidChangeActiveColorTheme(event =>{
        console.log("change theme:"+event.kind);
        let theme = "dark";
        if(event.kind === 1){
            theme = "light";
        }
        var message = {
            'methodName': 'setTheme',
            'arg': {
                'requestId': uuidv4(),
                'theme': theme,
            }
        };

        WebviewViewProvider.postMessageToWebview({
            command: 'callJavaScript',
            message: JSON.stringify(message)
        });
    });

    //const resizeDisposable = vscode.window.onDidChangeTextEditorVisibleRanges(event => {
    //        if (event.textEditor === vscode.window.activeTextEditor) {
    //            checkPanelWidth();
    //        }
    //    });

    function checkPanelWidth() {
        
        // 获取当前面板尺寸（近似值）
        const currentWidth = getApproximatePanelWidth();
        
        if (currentWidth < 280) {
            // 小于阈值时关闭窗口
            var message = {
                'methodName': 'closeWindow'
            };

            WebviewViewProvider.postMessageToWebview({
                command: 'success',
                message: message
            });
           
        }
    }

    function getApproximatePanelWidth(): number {
        // 实际实现需要根据工作区布局估算
        // 这里返回简化示例值
        let column = vscode.window.activeTextEditor?.viewColumn;
        return column === vscode.ViewColumn.One 
            ? 600 : 300;
    }

    vscode.window.registerUriHandler({
        handleUri(uri:vscode.Uri) {
            vscode.window.showInformationMessage('Hello from the Example extension!'+uri);
            const command = uri.path; 
            if(command === "/registerMcpserver"){
                const params = new URLSearchParams(uri.query); 
                const config = params.get('config') ; 
                var message = {
                    'methodName': 'registerMcpserver',
                    'arg': {
                        'config': config,
                    }
                };
                console.log("registerMcpserver req:"+message);
                WebviewViewProvider.postMessageToWebview({
                    command: 'callJavaScript',
                    message: JSON.stringify(message)
                });
            }
            
        }
    });


    // 将处理器加入订阅列表以确保销毁
    context.subscriptions.push(statusBarItem, inlineToChatDisposable,inlineToEditDisposable, textEditorSelection, acceptDisposable, rejectDisposable, acceptAllDisposable, rejectAllDisposable, changeThemeDisposable,fixCodeDisposable,optimizeCodeDisposable,writeCommentsForCodeDisposable);

}


export class VoidmuseWebViewProvider implements vscode.WebviewViewProvider {
    // 保存当前 Webview 视图的引用
    private currentWebviewView: vscode.WebviewView | undefined;
    isLoaded:boolean = false;
    private embeddingsService: EmbeddingsService;
    private statusBarItem: StatusBarItem;
    constructor(private readonly context: vscode.ExtensionContext,statusBarItem: StatusBarItem) {
        this.embeddingsService = new EmbeddingsService(this); 
        this.statusBarItem = statusBarItem;
     }

    waitForWebviewReady(
        timeout: number,
        interval: number,
    ): Promise<boolean> {
    return new Promise((resolve) => {
        const startTime = Date.now();

        const checkReadyState = () => {
        if (this.isLoaded) {
            resolve(true);
        } else if (Date.now() - startTime >= timeout) {
            resolve(false); // Timed out
        } else {
            setTimeout(checkReadyState, interval);
        }
        };

        checkReadyState();
    });
    }

    resolveWebviewView(webviewView: vscode.WebviewView) {
        // 保存当前 Webview 实例
        this.currentWebviewView = webviewView;
        // 配置 Webview
        webviewView.webview.options = {
            enableScripts: true, // 启用 JavaScript
            enableCommandUris: true, // 允许命令 URI
            enableForms: true
        };

        // 设置 Webview 的 HTML 内容
        webviewView.webview.html = getWebviewContent(webviewView, this.context);
        // 初始化索引
        this.embeddingsService.initIndex();
        // Webview 销毁时清除引用
        webviewView.onDidDispose(() => {
            this.currentWebviewView = undefined;
        });
        webviewView.webview.onDidReceiveMessage(
            async message => {
                if (message.command === 'loaded'){
                    this.isLoaded = true;
                    return;
                }
                //当窗口大小小于320时，折叠插件窗口
                if (message.type === 'dimension') {
                    console.log('当前侧边栏宽度:', message.width);
                    if(message.width < 290 && message.width > 0){
                        vscode.commands.executeCommand('workbench.action.toggleSidebarVisibility');
                    }
                    return;
                }
                const data = JSON.parse(message.data); // 将json字符串转换为对象
                const arg = data.arg;
                logger.info(`onDidReceiveMessage requestId: ${arg.requestId} ${message.data}`);
                var response = '';
                switch (data.methodName) {
                    case 'writeFile':
                        InlineEditService.handleEditResponse("", arg.content);
                        this.statusBarItem.hide();
                        break;
                    case 'testMcpConnection':
                        const conn = await (await McpService).testMcpConnection(arg.name);
                        response = JSON.stringify(conn);
                        break;
                    case 'callMcpTool':
                        const result = await (await McpService).callMcpTool(arg);
                        response = JSON.stringify(result);
                        break;
                    case 'getMcpTools':
                        const tools = await (await McpService).getMcpTools();
                        response = JSON.stringify(tools);
                        break;
                    case 'getPersistentState':
                        response = PluginConfig.get(arg.key, '');
                        break;
                    case 'persistentState':
                        await PluginConfig.updateAll(arg);
                        if(Constants.SETTING_MCP_CONFIG in arg){
                            const config = arg[Constants.SETTING_MCP_CONFIG];
                            (await McpService).reloadConfig(config);
                        }
                        
                        if (arg["global:isAutoEmbedding"] === "true"){
                            console.info("enable auto embedding！");
                            this.embeddingsService.initIndex();
                        }
                        break;
                    case 'findFile':
                        response = JSON.stringify(FileService.getAllWorkspaceFiles(arg.keyword));
                        break;
                    case 'getFileContent':
                        const fileContent = FileService.getFileContent(arg.path);
                        const encodedContent = Buffer.from(fileContent).toString('base64');
                        response = encodedContent;
                        break;
                    case 'jumpToFileByPath':
                        FileService.jumpToFileByPath(arg.path, arg.fieldName);
                        break;
                    case 'openUrl':
                        const url = arg.url;
                        vscode.env.openExternal(vscode.Uri.parse(url));
                        break;
                    case 'buildWithCodebaseContext':
                        const files = await this.embeddingsService.buildWithCodebaseContext(arg.prompt);
                        response = JSON.stringify(files);
                        break;
                    case 'isCodebaseIndexExists':
                        response = String(await this.embeddingsService.isCodebaseIndexExists());
                        break;
                    case 'getCodebaseIndexingProgress':
                        response = String(await this.embeddingsService.getCodebaseIndexingProgress());
                        break;
                    case 'getSelectedFiles':
                        response = JSON.stringify(FileService.getSelectedFilesBySetting());
                        break;
                    case 'codeToApply':
                        console.log(`codeToApply`);
                        break;
                    case 'codeToCreateFile':
                        FileService.codeToCreateFile(arg.content);
                        break;
                    case 'codeToInsert':
                        FileService.codeToInsert(arg.content);
                        break;
                    case 'getProjectConfig':
                        response = SettingsService.getProjectConfig();
                        break;
                    case 'closeWindow':
                        vscode.commands.executeCommand('workbench.action.toggleSidebarVisibility');
                        break;
                    case "getUrlContent":
                        try {
                            const urlContent = await getUrlContent(arg.url);
                            console.log(urlContent);
                            const encodedContent = Buffer.from(urlContent).toString('base64');
                            response = encodedContent;
                        } catch (error) {
                            vscode.window.showErrorMessage("get html content error!");
                        }
                        break;
                    case "executeCommand":
                        response = await RunScriptService.executeCommand(arg.command);
                        break;
                    case "executeScript":    
                        response = RunScriptService.executeScript(arg.requestId,arg.script);
                        break;
                    case "getScriptStatus":
                        response = RunScriptService.getScriptStatus(arg.requestId);
                        break;
                    case "stopScript":
                        response = RunScriptService.stopScript(arg.requestId);
                        break;
                    case 'handleJsCallback':
                        if(AutoCompletionService.isCompleteRequests(arg.requestId)){
                            AutoCompletionService.handleCompletionResponse(arg.requestId,arg.data);
                        }else if(InlineEditService.isEditRequests(arg.requestId)){
                            InlineEditService.handleEditResponse(arg.requestId,arg.data);
                            this.statusBarItem.hide();
                        }else if(this.embeddingsService.isEmbeddingRequest(arg.requestId)){
                            this.embeddingsService.handleEmbeddingResponse(arg.requestId,arg.data);
                        }
                }
                //成功响应
                webviewView.webview.postMessage({
                    command: 'success',
                    response: response,
                    requestId: message.requestId // 返回相同的标识符
                });

            }
        );
    }

    // 添加一个公共方法用于发送消息到 Webview
    public postMessageToWebview(message: any) {
        if (this.currentWebviewView) {
            this.currentWebviewView.webview.postMessage(message);
        }
    }
}

// 获取 Webview 的 HTML 内容
function getWebviewContent(webviewView: vscode.WebviewView,context: vscode.ExtensionContext): string {
    const extensionUri = context.extensionUri;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(extensionUri, "gui"),
      ],
      enableCommandUris: true,
    };

    const gui_assets = vscode.Uri.joinPath(extensionUri, 'gui/assets');
    // 查询gui_assets目录下的第一个js文件和第一个css文件
    const jsFile = getJsFile(gui_assets.fsPath);
    console.log('vvv jsFile:', jsFile);
    const cssFile = getCssFile(gui_assets.fsPath);
    console.log('vvv cssFile:', cssFile);
    
    if(!jsFile || !cssFile){
        throw new Error('vvv No jsFile or cssFile found');
    }
    
    const manifestPathOnDisk = vscode.Uri.joinPath(extensionUri, 'gui', 'manifest.json');
    const scriptPathOnDisk = vscode.Uri.joinPath(extensionUri, 'gui/assets', jsFile);
    const stylesPathOnDisk = vscode.Uri.joinPath(extensionUri, 'gui/assets', cssFile);
    const manifestUri = webviewView.webview.asWebviewUri(manifestPathOnDisk);
    const scriptPathUri = webviewView.webview.asWebviewUri(scriptPathOnDisk);
    const stylesPathUri = webviewView.webview.asWebviewUri(stylesPathOnDisk);

    console.log(scriptPathUri);
    console.log(stylesPathUri);
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <link rel="icon" href="./favicon.ico" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="theme-color" content="#000000" />
            <meta name="platform" content="vscode" />
            <meta
            name="description"
            content="AI Chat Application"
            />
            <link rel="manifest" href="${manifestUri}" />
            <title>voidmuse</title>
            <script type="module" crossorigin src="${scriptPathUri}"></script>
            <link rel="stylesheet" crossorigin href="${stylesPathUri}">
        </head>
        <body>
            <noscript>You need to enable JavaScript to run this app.</noscript>
            <div id="root"></div>

            <script>
                const vscode = acquireVsCodeApi();
                console.log('acquireVsCodeApi:', vscode);
                vscode.postMessage({ command: 'loaded' });

                // 监听 web 的消息
                window.addEventListener('message', event => {
                    if (event.source === window) {
                        //console.log('Received message from web:', event.data);
                        // 将 web 的消息转发给插件
                        vscode.postMessage(event.data);
                    }
                });

                // 监听视图尺寸变化
                const resizeObserver = new ResizeObserver(entries => {
                    const width = entries[0].contentRect.width;
                    vscode.postMessage({ 
                    type: 'dimension', 
                    width: width 
                    });
                });
                
                resizeObserver.observe(document.body);

            </script>

            <!-- Google Analytics (GA4) -->
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-0KP7W64S1P"></script>
            <script>
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                // GA4配置将在AnalyticsService中完成
            </script>
            
            <!-- 百度统计 -->
            <script>
                var _hmt = _hmt || [];
                (function() {
                    var hm = document.createElement("script");
                    hm.src = "https://hm.baidu.com/hm.js?93a02f36f43bdea2827e3ca2016dcad1";
                    var s = document.getElementsByTagName("script")[0]; 
                    s.parentNode.insertBefore(hm, s);
                })();
            </script>

        </body>
        </html>
    `;
}

// This method is called when your extension is deactivated
export function deactivate() { }
