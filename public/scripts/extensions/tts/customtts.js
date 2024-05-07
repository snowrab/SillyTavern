import { saveTtsProviderSettings } from './index.js';
export { GPTSoVitsProvider };

class GPTSoVitsProvider {
    //########//
    // Config //
    //########//

    settings;
    ready = false;

    defaultSettings = {
        refer_wav_path: "",
        prompt_text: "",
        prompt_language: "en",
        text: "",
        text_language: "en"
    };

    constructor() {
        this.loadSettings({});
    }

    get settingsHtml() {
        return `
            <p>使用您指定的参考音频进行文本到语音转换</p>
            <label for="refer_wav_path">Reference WAV Path:</label>
            <input id="refer_wav_path" type="text" value="${this.settings.refer_wav_path}" />
            <label for="prompt_text">Prompt Text:</label>
            <input id="prompt_text" type="text" value="${this.settings.prompt_text}" />
            <label for="prompt_language">Prompt Language:</label>
            <input id="prompt_language" type="text" value="${this.settings.prompt_language}" />
            <label for="text">Text:</label>
            <input id="text" type="text" value="${this.settings.text}" />
            <label for="text_language">Text Language:</label>
            <input id="text_language" type="text" value="${this.settings.text_language}" />
            <button onclick="saveTtsProviderSettings()">Save Settings</button>
        `;
    }

    onSettingsChange() {
        this.settings.refer_wav_path = document.getElementById('refer_wav_path').value;
        this.settings.prompt_text = document.getElementById('prompt_text').value;
        this.settings.prompt_language = document.getElementById('prompt_language').value;
        this.settings.text = document.getElementById('text').value;
        this.settings.text_language = document.getElementById('text_language').value;
    }

    async loadSettings(settings) {
        this.settings = { ...this.defaultSettings, ...settings };
    }

    async checkReady() {
        try {
            const testResponse = await fetch(`http://127.0.0.1:9880?text=测试&text_language=${this.settings.text_language}`);
            this.ready = testResponse.ok;
        } catch (error) {
            console.error('Failed to reach the TTS API', error);
            this.ready = false;
        }
    }

    async fetchTtsVoiceObjects() {
        return Promise.resolve([
            { name: "Standard Mandarin", voice_id: "voice_1", preview_url: false, lang: "zh-CN" },
            { name: "Extended Mandarin", voice_id: "voice_1", preview_url: false, lang: "zh-CN" }
        ]);
    }

    async getVoice(voiceName) {
        // Simulating fetching a voice based on voiceName
        const allVoices = await this.fetchTtsVoiceObjects();
        const voice = allVoices.find(v => v.name === voiceName);
        if (!voice) {
            throw new Error(`TTS Voice name ${voiceName} not found`);
        }
        return voice;
    }
    
    async generateTts(text, voiceId) {
    const requestBody = {
        refer_wav_path: this.settings.refer_wav_path,
        prompt_text: this.settings.prompt_text,
        prompt_language: this.settings.prompt_language,
        text: text || this.settings.text,
        text_language: this.settings.text_language
    };

    const response = await fetch('http://127.0.0.1:9880', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Error from TTS API: ${error.message}`);
    }

    return response;  // 返回音频流
}

}
