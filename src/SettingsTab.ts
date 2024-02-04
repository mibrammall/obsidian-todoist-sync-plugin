import { App, PluginSettingTab, Setting } from "obsidian";
import { TodoistSyncPlugin } from "./Plugin";

export class SettingsTab extends PluginSettingTab {
	plugin: TodoistSyncPlugin;

	constructor(app: App, plugin: TodoistSyncPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Todoist Access Token")
			.setDesc("Use this token to authenticate with Todoist's API.")
			.addText((text) =>
				text
					.setPlaceholder("Enter your auth token")
					.setValue(this.plugin.settings.accessToken ?? "")
					.onChange(async (value) => {
						this.plugin.settings.accessToken = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Projects folder")
			.setDesc("The folder to sync todoist to.")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.localProjectsFolder ?? "")
					.onChange(async (value) => {
						this.plugin.settings.localProjectsFolder = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
