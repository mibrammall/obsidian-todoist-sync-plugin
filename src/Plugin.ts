import { MarkdownPostProcessorContext, Plugin } from "obsidian";
import { SettingsTab } from "./SettingsTab";
import { DEFAULT_SETTINGS } from "./DefaultSettings";
import { Settings } from "./Settings";
import { TodoistApi } from "@doist/todoist-api-typescript";
import { PluginApi } from "./todoist/PluginApi";

export class TodoistSyncPlugin extends Plugin {
	settings: Settings;

	async onload() {
		await this.loadSettings();

		if (!this.settings.accessToken) {
			// TODO: Show a message to the user that they need to set the access token
			console.log("No access token set");
			return;
		}

		const todoist = new TodoistApi(this.settings.accessToken);
		const pluginApi = new PluginApi(todoist, this.app);
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingsTab(this.app, this));
		this.registerMarkdownCodeBlockProcessor(
			"todoist-query",
			(
				code: string,
				el: HTMLElement,
				ctx: MarkdownPostProcessorContext
			) => {
				pluginApi.processQuery(code, el, ctx);
			}
		);
	}

	onunload() {}

	async loadSettings() {
		const storedSettings = await this.loadData();
		this.settings = Object.assign({}, DEFAULT_SETTINGS, storedSettings);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
