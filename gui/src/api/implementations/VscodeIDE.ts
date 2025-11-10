import { IDEInterface } from '../IDEInterface';
import vscodeMgr from '../vscodeMgr';
import {
  FindFileParams,
  FileContentParams,
  JumpToFileParams,
  OpenUrlParams,
  CodebaseContextParams,
  CodeToApplyParams,
  CodeToCreateFileParams,
  CodeToInsertParams,
  WriteFileParams,
  ExecuteCommandParams,
  ExecuteScriptParams,
  GetScriptStatusParams,
  StopScriptParams,
  FileListResponse,
  CodebaseContextResponse,
  CodebaseExistsResponse,
  FileInfo,
  ProjectInfoResponse,
  ExecuteCommandResponse,
  ExecuteScriptResponse,
  ScriptStatusResponse,
  CallMcpParams,
  McpConnectionTestResult
} from '../../types/ide';
import { base64Decode } from '../../utils/Base64Utils';

/**
 * VSCode platform IDE interface implementation
 */
export class VscodeIDE implements IDEInterface {
  testMcpConnection(name: string): McpConnectionTestResult | PromiseLike<McpConnectionTestResult> {
    return new Promise((resolve, reject) => {
      try {
        const param = JSON.stringify({
          'methodName': 'testMcpConnection',
          'arg': {
              name: name
          }
        });

        vscodeMgr.sendMessage(param,
          function onSuccess(response) {
            console.log('vscode testMcpConnection callback success:', response.substring(0, 500));
            resolve(JSON.parse(response));
          },
          function onFailure(error_code, error_message) {
            console.error('vscode error occurred when calling testMcpConnection method:', error_code, error_message);
            reject(new Error('testMcpConnection failed'));
          }
        );
      } catch (error) {
        console.error('Error occurred when calling testMcpConnection method:', error);
        reject(error);
      }
    });
  }
  callMcpTool(params: CallMcpParams): string | PromiseLike<string> {
    return new Promise((resolve, reject) => {
      try {
        const param = JSON.stringify({
          'methodName': 'callMcpTool',
          'arg': {
              serviceName: params.serviceName,
              toolName: params.toolName,
              params: params.params
          }
        });

        vscodeMgr.sendMessage(param,
          function onSuccess(response) {
            const result = response.replace(/\\/g, '\\\\');
            console.log('vscode callMcpTool callback success:', result.substring(0, 500));
            resolve(result);
          },
          function onFailure(error_code, error_message) {
            console.error('vscode error occurred when calling callMcpTool method:', error_code, error_message);
            reject(new Error('callMcpTool failed'));
          }
        );
      } catch (error) {
        console.error('Error occurred when calling getMcpTools method:', error);
        reject(error);
      }
    });
  }
  /**
   * Get Mcp tools list
   * @returns Tools object
   */
  getMcpTools(): Record<string, any> | PromiseLike<Record<string, any>> {
   return new Promise((resolve, reject) => {
      try {
        const param = JSON.stringify({
          'methodName': 'getMcpTools'
        });

        vscodeMgr.sendMessage(param,
          function onSuccess(response) {
            console.log('vscode getMcpTools callback success:', response.substring(0, 500));
            resolve(JSON.parse(response));
          },
          function onFailure(error_code, error_message) {
            console.error('vscode error occurred when calling getMcpTools method:', error_code, error_message);
            reject(new Error('getMcpTools failed'));
          }
        );
      } catch (error) {
        console.error('Error occurred when calling getMcpTools method:', error);
        reject(error);
      }
    });
  }

  /**
   * Get file list
   * @param params Find file parameters
   * @returns Array of file list information
   */
  async getFileList(params: FindFileParams): Promise<FileListResponse> {
    return new Promise((resolve, reject) => {
      try {
        const param = JSON.stringify({
          'methodName': 'findFile',
          'arg': { 'fileName': params.fileName }
        });

        vscodeMgr.sendMessage(param,
          function onSuccess(response) {
            const result = response.replace(/\\/g, '\\\\');
            console.log('vscode getFileList callback success:', result.substring(0, 500));
            resolve(JSON.parse(result));
          },
          function onFailure(error_code, error_message) {
            console.error('vscode error occurred when calling getFileList method:', error_code, error_message);
            reject(new Error('Failed to get file list'));
          }
        );
      } catch (error) {
        console.error('Error occurred when calling getFileList method:', error);
        reject(error);
      }
    });
  }

  /**
   * Get file content
   * @param params File path parameters
   * @returns File content string
   */
  async getFileContent(params: FileContentParams): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const param = JSON.stringify({
          'methodName': 'getFileContent',
          'arg': { 'path': params.path }
        });

        vscodeMgr.sendMessage(param,
          function onSuccess(response) {
            const result = base64Decode(response);
            console.log(`vscode getFileContent callback success:, path: ${params.path}, ${result.substring(0, 20)}`);

            resolve(result);
          },
          function onFailure(error_code, error_message) {
            console.error('vscode getFileContent callback failed:', error_code, error_message);
            resolve("");
          }
        );
      } catch (error) {
        console.error('Error occurred when calling getFileContent method:', error);
        reject(error);
      }
    });
  }

  /**
   * Jump to specified file location
   * @param params Jump parameters, including path and optional field name
   */
  async jumpToFile(params: JumpToFileParams): Promise<void> {
    try {
      const param = JSON.stringify({
        'methodName': 'jumpToFileByPath',
        'arg': {
          'path': params.path,
          ...(params.fieldName && { 'fieldName': params.fieldName }),
          ...(params.startLine && { 'startLine': params.startLine }),
          ...(params.endLine && { 'endLine': params.endLine }),
        }
      });

      return new Promise((resolve, reject) => {
        vscodeMgr.sendMessage(param,
          function onSuccess(response) {
            console.log('vscode jumpToFile callback success', param, response);
            resolve();
          },
          function onFailure(error_code, error_message) {
            console.error('vscode jumpToFile callback failed:', param, error_code, error_message);
            reject(new Error('Failed to jump to file'));
          }
        );
      });
    } catch (error) {
      console.error('Jump failed:', error);
      throw error;
    }
  }

  /**
   * Open URL in browser
   * @param params Parameters containing URL
   */
  async openUrl(params: OpenUrlParams): Promise<void> {
    try {
      const param = JSON.stringify({
        'methodName': 'openUrl',
        'arg': { 'url': params.url }
      });

      return new Promise((resolve, reject) => {
        vscodeMgr.sendMessage(param,
          function onSuccess(response) {
            console.log('vscode openUrl callback success:', response);
            resolve();
          },
          function onFailure(error_code, error_message) {
            console.error('vscode openUrl callback failed:', error_code, error_message);
            reject(new Error('Failed to open URL'));
          }
        );
      });
    } catch (error) {
      console.error('openUrl failed:', error);
      throw error;
    }
  }

  /**
   * Build response using codebase context
   * @param params Prompt information parameters
   * @returns Array of related file information
   */
  async buildWithCodebaseContext(params: CodebaseContextParams): Promise<CodebaseContextResponse> {
    const requestId = Math.random().toString(36).substring(2, 15);
    const startTime = Date.now();
    return new Promise((resolve, reject) => {
      try {
        const param = JSON.stringify({
          'methodName': 'buildWithCodebaseContext',
          'arg': { 'prompt': params.prompt, 'optimizePrompt': params.optimizePrompt }
        });
        console.log('vscode buildWithCodebaseContext start, requestId:', requestId, ', param:', param);
        vscodeMgr.sendMessage(param,
          function onSuccess(response) {
            const result = JSON.parse(response);
            const cost = Date.now() - startTime;
            console.log('vscode buildWithCodebaseContext success, requestId:', requestId, 'cost:', cost + 'ms', 'result length:', result.length,  response.substring(0, 500));
            result.forEach((item: FileInfo) => {
              item.content = base64Decode(item.content);
            });
            resolve(result);
          },
          function onFailure(error_code, error_message) {
            const cost = Date.now() - startTime;
            console.log('vscode buildWithCodebaseContext failed, requestId:', requestId, 'cost:', cost + 'ms', error_message);
            reject(new Error('Failed to call buildWithCodebaseContext, error_message: ' + error_message));
          }
        ,requestId);
      } catch (error) {
        console.error('buildWithCodebaseContext failed, requestId:', requestId, error);
        reject(error);
      }
    });
  }

  /**
   * Check if codebase index exists
   * @returns Boolean value indicating whether the index exists
   */
  async isCodebaseIndexExists(): Promise<CodebaseExistsResponse> {
    return new Promise((resolve, reject) => {
      try {
        const param = JSON.stringify({
          'methodName': 'isCodebaseIndexExists',
          'arg': { 'data': '' }
        });

        vscodeMgr.sendMessage(param,
          function onSuccess(response) {
            console.log('vscode isCodebaseIndexExists success', response);
            resolve(response === 'true');
          },
          function onFailure(error_code, error_message) {
            console.log('vscode isCodebaseIndexExists failed', error_message);
            reject(new Error('Failed to call isCodebaseIndexExists'));
          }
        );
      } catch (error) {
        console.error('isCodebaseIndexExists failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Get currently selected file list
   * @returns Array of selected file information
   */
  async getSelectedFiles(): Promise<FileListResponse> {
    return new Promise((resolve, reject) => {
      try {
        const param = JSON.stringify({
          'methodName': 'getSelectedFiles',
          'arg': {}
        });

        vscodeMgr.sendMessage(param,
          function onSuccess(response) {
            const result = response.replace(/\\/g, '\\\\');
            console.log('vscode getSelectedFiles callback success:', result);
            resolve(JSON.parse(result));
          },
          function onFailure(error_code, error_message) {
            console.error('vscode getSelectedFiles callback failed:', error_code, error_message);
            reject(new Error('Failed to get selected file list'));
          }
        );
      } catch (error) {
        console.error('Error occurred when calling getSelectedFiles method:', error);
        reject(error);
      }
    });
  }

  /**
   * Apply code changes
   * @param params Contains code content to be applied
   */
  async codeToApply(params: CodeToApplyParams): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const param = JSON.stringify({
          'methodName': 'codeToApply',
          'arg': { 'content': params.content }
        });

        vscodeMgr.sendMessage(param,
          function onSuccess(response) {
            console.log("vscode codeToApply callback success:", response);
            resolve();
          },
          function onFailure(error_code, error_message) {
            console.error('vscode codeToApply callback failed:', error_code, error_message);
            reject(new Error('Failed to apply code changes'));
          }
        );
      } catch (error) {
        console.error('codeToApply failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Create new file
   * @param params Contains file content to be created
   */
  async codeToCreateFile(params: CodeToCreateFileParams): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const param = JSON.stringify({
          'methodName': 'codeToCreateFile',
          'arg': { 'content': params.content }
        });

        vscodeMgr.sendMessage(param,
          function onSuccess(response) {
            console.log("vscode codeToCreateFile callback success:", response);
            resolve();
          },
          function onFailure(error_code, error_message) {
            console.error('vscode codeToCreateFile callback failed:', error_code, error_message);
            reject(new Error('Failed to create file'));
          }
        );
      } catch (error) {
        console.error('codeToCreateFile failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Insert code
   * @param params Contains code content to be inserted
   */
  async codeToInsert(params: CodeToInsertParams): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const param = JSON.stringify({
          'methodName': 'codeToInsert',
          'arg': { 'content': params.content }
        });

        vscodeMgr.sendMessage(param,
          function onSuccess(response) {
            console.log("vscode codeToInsert callback success:", response);
            resolve();
          },
          function onFailure(error_code, error_message) {
            console.error('vscode codeToInsert callback failed:', error_code, error_message);
            reject(new Error('Failed to insert code'));
          }
        );
      } catch (error) {
        console.error('codeToInsert failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Write file
   * @param params Write file parameters
   */
  async writeFile(params: WriteFileParams): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const param = JSON.stringify({
          'methodName': 'writeFile',
          'arg': {
            'filePath': params.filePath,
            'content': params.content,
            'startLine': params.startLine,
            'endLine': params.endLine,
            'showDiff': params.showDiff || true
          }
        });

        vscodeMgr.sendMessage(param,
          function onSuccess(response) {
            console.log("vscode writeFile callback success:", response);
            resolve();
          },
          function onFailure(error_code, error_message) {
            console.error('vscode writeFile callback failed:', error_code, error_message);
            reject(new Error('Failed to write file'));
          }
        );
      } catch (error) {
        console.error('writeFile failed:', error);
        reject(error);
      }
    });
  }

  async getProjectConfig(): Promise<ProjectInfoResponse> {
    return new Promise((resolve, reject) => {
      try {
        const param = JSON.stringify({
          'methodName': 'getProjectConfig',
          'arg': {}
        });

        vscodeMgr.sendMessage(param,
          function onSuccess(response) {
            console.log('vscode getProjectConfig callback success:', response);
            resolve(JSON.parse(response));
          },
          function onFailure(error_code, error_message) {
            console.error('vscode getProjectConfig callback failed:', error_code, error_message);
            reject(new Error('Failed to get selected file list'));
          }
        );
      } catch (error) {
        console.error('Error occurred when calling getProjectConfig method:', error);
        reject(error);
      }
    });
  }

  closeWindow(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const param = JSON.stringify({
          'methodName': 'closeWindow',
          'arg': {}
        });

        vscodeMgr.sendMessage(param,
          function onSuccess(response) {
            console.log('vscode closeWindow callback success:', response);
            resolve();
          },
          function onFailure(error_code, error_message) {
            console.error('vscode closeWindow callback failed:', error_code, error_message);
            reject(new Error('Failed to close window'));
          }
        );
      } catch (error) {
        console.error('closeWindow failed:', error);
        reject(error);
      }
    });
  }

  async getCodebaseIndexingProgress(): Promise<string> {
    return new Promise((resolve, reject) => {
       try {
        const param = JSON.stringify({
          'methodName': 'getCodebaseIndexingProgress',
          'arg': { 'data': '' }
        });

        vscodeMgr.sendMessage(param,
          function onSuccess(response) {
            console.log('vscode getCodebaseIndexingProgress:', response);
            resolve(response);
          },
          function onFailure(error_code, error_message) {
            console.error('vscode getCodebaseIndexingProgress callback failed:', error_code, error_message);
            reject(new Error('Failed to call getCodebaseIndexingProgress'));
          }
        );

      } catch (error) {
        console.error('getCodebaseIndexingProgress error:', error);
        reject(error);
      }
    });
  }

  /**
   * Get URL content
   * @param url URL address
   * @returns HTML content string
   */
  async getUrlContent(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const param = JSON.stringify({
          'methodName': 'getUrlContent',
          'arg': { 'url': url }
        });

        vscodeMgr.sendMessage(param,
          function onSuccess(response) {
            console.log('vscode getUrlContent callback success:', url);
            const decodedResponse = base64Decode(response);
            resolve(decodedResponse);
          },
          function onFailure(error_code, error_message) {
            console.error('vscode getUrlContent callback failed:', error_code, error_message);
            reject(new Error('Failed to get URL content'));
          }
        );
      } catch (error) {
        console.error('Error occurred when calling getUrlContent method:', error);
        reject(error);
      }
    });
  }

  /**
   * Execute command
   * @param params Command parameters
   * @returns Command execution result
   */
  async executeCommand(params: ExecuteCommandParams): Promise<ExecuteCommandResponse> {
    return new Promise((resolve, reject) => {
      try {
        const param = JSON.stringify({
          'methodName': 'executeCommand',
          'arg': { 'command': params.command }
        });

        vscodeMgr.sendMessage(param,
          function onSuccess(response) {
            console.log('vscode executeCommand callback success:', response.substring(0, 500));
            resolve(response);
          },
          function onFailure(error_code, error_message) {
            console.error('vscode executeCommand callback failed:', error_code, error_message);
            reject(new Error('Failed to execute command'));
          }
        );
      } catch (error) {
        console.error('Error occurred when calling executeCommand method:', error);
        reject(error);
      }
    });
  }

  /**
   * Execute script
   * @param params Script parameters
   * @returns Request ID for tracking script execution
   */
  async executeScript(params: ExecuteScriptParams): Promise<ExecuteScriptResponse> {
    return new Promise((resolve, reject) => {
      try {
        const param = JSON.stringify({
          'methodName': 'executeScript',
          'arg': {
            'script': params.script,
            'requestId': params.requestId
          }
        });

        vscodeMgr.sendMessage(param,
          function onSuccess(response) {
            console.log('vscode executeScript callback success:', response);
            resolve(params.requestId);
          },
          function onFailure(error_code, error_message) {
            console.error('vscode executeScript callback failed:', error_code, error_message);
            reject(new Error('Failed to execute script'));
          }
        );
      } catch (error) {
        console.error('Error occurred when calling executeScript method:', error);
        reject(error);
      }
    });
  }

  /**
   * Get script execution status
   * @param params Parameters containing requestId
   * @returns Script status and output
   */
  async getScriptStatus(params: GetScriptStatusParams): Promise<ScriptStatusResponse> {
    return new Promise((resolve, reject) => {
      try {
        const param = JSON.stringify({
          'methodName': 'getScriptStatus',
          'arg': { 'requestId': params.requestId }
        });

        vscodeMgr.sendMessage(param,
          function onSuccess(response) {
            console.log('vscode getScriptStatus callback success:', response);
            resolve(JSON.parse(response));
          },
          function onFailure(error_code, error_message) {
            console.error('vscode getScriptStatus callback failed:', error_code, error_message);
            reject(new Error('Failed to get script status'));
          }
        );
      } catch (error) {
        console.error('Error occurred when calling getScriptStatus method:', error);
        reject(error);
      }
    });
  }

  /**
   * Stop script execution
   * @param params Parameters containing requestId
   * @returns Script status and output
   */
  async stopScript(params: StopScriptParams): Promise<ScriptStatusResponse> {
    return new Promise((resolve, reject) => {
      try {
        const param = JSON.stringify({
          'methodName': 'stopScript',
          'arg': { 'requestId': params.requestId }
        });

        vscodeMgr.sendMessage(param,
          function onSuccess(response) {
            console.log('vscode stopScript callback success:', response);
            resolve(JSON.parse(response));
          },
          function onFailure(error_code, error_message) {
            console.error('vscode stopScript callback failed:', error_code, error_message);
            reject(new Error('Failed to stop script'));
          }
        );
      } catch (error) {
        console.error('Error occurred when calling stopScript method:', error);
        reject(error);
      }
    });
  }
}