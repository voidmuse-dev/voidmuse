import { PluginConfig } from '../PluginConfig';
import SettingsService from './SettingsService';
import { Constants } from '../common/Constants';

export class EmbeddingsSettings {

    getCodeBaseEnable(): boolean {
        return PluginConfig.get(Constants.SETTING_CODEBASE_ENABLE, false);
    }

    // 配置没用
    getSelectedEmbeddingModel(): string{
        return PluginConfig.get(Constants.SETTING_SELECTED_EMBEDDING_MODEL, "");
    }

    // function: 获取embedding模型列表，转换为json对象数组
    getEmbeddingModels(): any[] {
        let models = PluginConfig.get(Constants.SETTING_EMBEDDING_MODELS, '[]');
        return JSON.parse(models) as any[];
    }
    
    /**
     * function: 获取embeddings的模型名称，配置内容：
     *         "global:embeddingModels": "[{\"key\":\"1752222055608\",\"name\":\"gte-Qwen2-1.5B-instruct-f16:latest\",\"provider\":\"OpenAI\",\"enabled\":true,\"modelId\":\"gte-Qwen2-1.5B-instruct-f16:latest\",\"apiKey\":\"~\",\"baseUrl\":\"xxx\",\"isCustomModel\":true}]",
        "global:selectedEmbeddingModel": "1752222055608",
        "global:isAutoEmbedding": "false",
     * 遍历embeddingModels，转换为json对象，取enabled=true的name
     * 如果没有enabled=true的模型，返回空字符串
     * @returns 模型名称，如：gte-Qwen2-1.5B-instruct-f16:latest
     */
    getEnabledEmbeddingModelId(): string {
        const embeddingModels = this.getEmbeddingModels();
        for(let model of embeddingModels){
            if(model.enabled){
                return model.modelId;
            }
        }
        return "";
    }

    getCodeBaseMaxSearchResult(): number {
        return PluginConfig.get(Constants.SETTING_CODEBASE_MAX_SEARCH_RESULT, 10);
    }

}

export default new EmbeddingsSettings();
