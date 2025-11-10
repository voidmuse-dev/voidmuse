import { IDEInterface } from '../IDEInterface';
import IdeaAsyncMgr from '../IdeaAsyncMgr';
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
 * IntelliJ platform IDE interface implementation
 */
export class IntelliJIDE implements IDEInterface {
  testMcpConnection(name: string): McpConnectionTestResult | PromiseLike<McpConnectionTestResult> {
    return new Promise((resolve, reject) => {
      try {
        const param = JSON.stringify({
          'methodName': 'testMcpConnection',
          'arg': {
              name: name
          }
        });

         window.callJava({
          request: param,
          onSuccess: function (response) {
            console.log('IntelliJ testMcpConnection callback success:', response.substring(0, 500));
            resolve(JSON.parse(response));
          },
          onFailure: function (error_code, error_message) {
            console.error('IntelliJ error occurred when calling testMcpConnection method:', error_code, error_message);
            reject(new Error('testMcpConnection failed'));
          }
        });

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
              // Convert Map to plain object, as Map cannot be directly serialized
              params: params.params
          }
        });

        window.callJava({
          request: param,
          onSuccess: function (response) {
            console.log('IntelliJ callMcpTool callback success:', response.substring(0, 500));
            resolve(JSON.parse(response));
          },
          onFailure: function (error_code, error_message) {
            console.error('IntelliJ error occurred when calling callMcpTool method:', error_code, error_message);
            reject(new Error('callMcpTool failed'));
          }
        });

      } catch (error) {
        console.error('Error occurred when calling getMcpTools method:', error);
        reject(error);
      }
    });
  }
  /**
   * Get MCP tools list
   * @returns Tools object
   */
  getMcpTools(): Record<string, any> | PromiseLike<Record<string, any>> {
   return new Promise((resolve, reject) => {
      try {
        const param = JSON.stringify({
          'methodName': 'getMcpTools'
        });

        window.callJava({
          request: param,
          onSuccess: function (response) {
            console.log('IntelliJ getMcpTools callback success:', response.substring(0, 500));
            resolve(JSON.parse(response));
          },
          onFailure: function (error_code, error_message) {
            console.error('IntelliJ error occurred when calling getMcpTools method:', error_code, error_message);
            reject(new Error('getMcpTools failed'));
          }
        });

      } catch (error) {
        console.error('Error occurred when calling getMcpTools method:', error);
        reject(error);
      }
    });
  }

  /**
   * Get file list
   * @param params Find file parameters
   * @returns File list information array
   */
  async getFileList(params: FindFileParams): Promise<FileListResponse> {
    return new Promise((resolve, reject) => {
      try {
        const param = JSON.stringify({
          'methodName': 'findFile',
          'arg': { 'fileName': params.fileName }
        });

        window.callJava({
          request: param,
          onSuccess: function (response) {
            const result = response.replace(/\\/g, '\\\\');
            console.log('IntelliJ getFileList callback success:', result.substring(0, 500));
            resolve(JSON.parse(result));
          },
          onFailure: function (error_code, error_message) {
            console.error('IntelliJ getFileList callback failed:', error_code, error_message);
            reject(new Error('Failed to get file list'));
          }
        });
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

        window.callJava({
          request: param,
          onSuccess: function (response) {
            const result = base64Decode(response);
            console.log(`IntelliJ getFileContent callback success:, path: ${params.path}, ${result.substring(0, 20)}`);
            resolve(result);
          },
          onFailure: function (error_code, error_message) {
            console.error('IntelliJ getFileContent callback failed:', error_code, error_message);
            resolve("");
          }
        });
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
        window.callJava({
          request: param,
          onSuccess: function (response) {
            console.log('IntelliJ jumpToFile callback success:', response);
            resolve();
          },
          onFailure: function (error_code, error_message) {
            console.error('IntelliJ jumpToFile callback failed:', error_code, error_message);
            reject(new Error('Failed to jump to file'));
          }
        });
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
        window.callJava({
          request: param,
          onSuccess: function (response) {
            console.log('IntelliJ openUrl callback success:', response);
            resolve();
          },
          onFailure: function (error_code, error_message) {
            console.error('IntelliJ openUrl callback failed:', error_code, error_message);
            reject(new Error('Failed to open URL'));
          }
        });
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
    return new Promise((resolve, reject) => {
      try {
        const param = {
          'methodName': 'buildWithCodebaseContext',
          'arg': { 'prompt': params.prompt, 'optimizePrompt': params.optimizePrompt }
        };

        IdeaAsyncMgr.sendMessage(param,
          function onSuccess(response) {
            const result = JSON.parse(response);
            console.log('IntelliJ buildWithCodebaseContext success, result length:', result.length, response.substring(0, 50));
            result.forEach((item: FileInfo) => {
              item.content = base64Decode(item.content);
            });
            resolve(result);
          },
          function onFailure(error_code, error_message) {
            console.log('IntelliJ buildWithCodebaseContext failed', error_message);
            reject(new Error('Failed to call buildWithCodebaseContext'));
          }
        );
      } catch (error) {
        console.error('buildWithCodebaseContext failed:', error);
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

        window.callJava({
          request: param,
          onSuccess: function (response) {
            console.log('IntelliJ isCodebaseIndexExists success', response);
            resolve(response === 'true');
          },
          onFailure: function (error_code, error_message) {
            console.log('IntelliJ isCodebaseIndexExists failed', error_message);
            reject(new Error('Failed to call isCodebaseIndexExists'));
          }
        });
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

        window.callJava({
          request: param,
          onSuccess: function (response) {
            const result = response.replace(/\\/g, '\\\\');
            console.log('IntelliJ getSelectedFiles callback success:', result);
            resolve(JSON.parse(result));
          },
          onFailure: function (error_code, error_message) {
            console.error('IntelliJ getSelectedFiles callback failed:', error_code, error_message);
            reject(new Error('Failed to get selected file list'));
          }
        });
      } catch (error) {
        console.error('Error occurred when calling getSelectedFiles method:', error);
        reject(error);
      }
    });
  }

  /**
   * Apply code changes
   * @param params Parameters containing code content to apply
   */
  async codeToApply(params: CodeToApplyParams): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const param = JSON.stringify({
          'methodName': 'codeToApply',
          'arg': { 'content': params.content }
        });

        window.callJava({
          request: param,
          onSuccess: function (response) {
            console.log("IntelliJ codeToApply callback success:", response);
            resolve();
          },
          onFailure: function (error_code, error_message) {
            console.error('IntelliJ codeToApply callback failed:', error_code, error_message);
            reject(new Error('Failed to apply code changes'));
          }
        });
      } catch (error) {
        console.error('codeToApply failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Create new file
   * @param params Parameters containing file content to create
   */
  async codeToCreateFile(params: CodeToCreateFileParams): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const param = JSON.stringify({
          'methodName': 'codeToCreateFile',
          'arg': { 'content': params.content }
        });

        window.callJava({
          request: param,
          onSuccess: function (response) {
            console.log("IntelliJ codeToCreateFile callback success:", response);
            resolve();
          },
          onFailure: function (error_code, error_message) {
            console.error('IntelliJ codeToCreateFile callback failed:', error_code, error_message);
            reject(new Error('Failed to create file'));
          }
        });
      } catch (error) {
        console.error('codeToCreateFile failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Insert code
   * @param params Parameters containing code content to insert
   */
  async codeToInsert(params: CodeToInsertParams): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const param = JSON.stringify({
          'methodName': 'codeToInsert',
          'arg': { 'content': params.content }
        });

        window.callJava({
          request: param,
          onSuccess: function (response) {
            console.log("IntelliJ codeToInsert callback success:", response);
            resolve();
          },
          onFailure: function (error_code, error_message) {
            console.error('IntelliJ codeToInsert callback failed:', error_code, error_message);
            reject(new Error('Failed to insert code'));
          }
        });
      } catch (error) {
        console.error('Error occurred when calling codeToInsert method:', error);
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

        window.callJava({
          request: param,
          onSuccess: function (response) {
            console.log("IntelliJ writeFile callback success:", response);
            resolve();
          },
          onFailure: function (error_code, error_message) {
            console.error('IntelliJ writeFile callback failed:', error_code, error_message);
            reject(new Error('Failed to write file'));
          }
        });
      } catch (error) {
        console.error('Error occurred when calling writeFile method:', error);
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

        window.callJava({
          request: param,
          onSuccess: function (response) {
            console.log('IntelliJ getProjectConfig callback success:', response);
            resolve(JSON.parse(response));
          },
          onFailure: function (error_code, error_message) {
            console.error('IntelliJ getProjectConfig callback failed:', error_code, error_message);
            reject(new Error('Failed to get project config'));
          }
        });
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

        window.callJava({
          request: param,
          onSuccess: function (response) {
            console.log("IntelliJ closeWindow callback success:", response);
            resolve();
          },
          onFailure: function (error_code, error_message) {
            console.error('IntelliJ closeWindow callback failed:', error_code, error_message);
            reject(new Error('Failed to close window'));
          }
        });
      } catch (error) {
        console.error('Error occurred when calling closeWindow method:', error);
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

        window.callJava({
          request: param,
          onSuccess: function (response) {
            console.log('IntelliJ getCodebaseIndexingProgress callback success:', response);
            resolve(response);
          },
          onFailure: function (error_code, error_message) {
            console.log('IntelliJ getCodebaseIndexingProgress failed:', error_message);
            reject(new Error('Failed to call getCodebaseIndexingProgress'));
          }
        });
      } catch (error) {
        console.error('Error occurred when calling getCodebaseIndexingProgress method:', error);
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
        const param = {
          'methodName': 'getUrlContent',
          'arg': { 'url': url }
        };

        IdeaAsyncMgr.sendMessage(param,
          function onSuccess(response) {
            console.log('IntelliJ getUrlContent callback success:', url);
            const decodedResponse = base64Decode(response);
            resolve(decodedResponse);
          },
          function onFailure(error_code, error_message) {
            console.error('IntelliJ getUrlContent callback failed:', error_code, error_message);
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

        window.callJava({
          request: param,
          onSuccess: function (response) {
            console.log('IntelliJ executeCommand callback success:', response.substring(0, 500));
            resolve(response);
          },
          onFailure: function (error_code, error_message) {
            console.error('IntelliJ executeCommand callback failed:', error_code, error_message);
            reject(new Error('Failed to execute command'));
          }
        });
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

        window.callJava({
          request: param,
          onSuccess: function (response) {
            console.log('IntelliJ executeScript callback success:', response);
            resolve(params.requestId);
          },
          onFailure: function (error_code, error_message) {
            console.error('IntelliJ executeScript callback failed:', error_code, error_message);
            reject(new Error('Failed to execute script'));
          }
        });
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

        window.callJava({
          request: param,
          onSuccess: function (response) {
            console.log(`IntelliJ getScriptStatus callback success [${new Date().toISOString()}]:`, response);
            resolve(JSON.parse(response));
          },
          onFailure: function (error_code, error_message) {
            console.error('IntelliJ getScriptStatus callback failed:', error_code, error_message);
            reject(new Error('Failed to get script status'));
          }
        });
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

        window.callJava({
          request: param,
          onSuccess: function (response) {
            console.log('IntelliJ stopScript callback success:', response);
            resolve(JSON.parse(response));
          },
          onFailure: function (error_code, error_message) {
            console.error('IntelliJ stopScript callback failed:', error_code, error_message);
            reject(new Error('Failed to stop script'));
          }
        });
      } catch (error) {
        console.error('Error occurred when calling stopScript method:', error);
        reject(error);
      }
    });
  }
}