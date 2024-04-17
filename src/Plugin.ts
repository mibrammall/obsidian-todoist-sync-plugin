import { Plugin } from "obsidian";
import { SettingsTab } from "./SettingsTab";
import { DEFAULT_SETTINGS } from "./DefaultSettings";
import { Settings } from "./Settings";
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

		const pluginApi = new PluginApi(this.app, this.settings);
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingsTab(this.app, this));
		this.registerMarkdownCodeBlockProcessor(
			"todoist-query",
			(code: string, el: HTMLElement) => {
				pluginApi.renderQuery(code, el);
			}
		);

		this.addRibbonIcon("dice", "Sample Plugin", (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			// pluginApi.processQuery("", undefined, undefined);
			pluginApi.readSync();
		});
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
