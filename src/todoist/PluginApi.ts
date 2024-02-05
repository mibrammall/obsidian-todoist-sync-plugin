import { Task, TodoistApi } from "@doist/todoist-api-typescript";
import { App, MarkdownPostProcessorContext, Vault } from "obsidian";
import { Settings } from "src/Settings";

const SYNC_ENDPOINT = "https://api.todoist.com/sync/v9/sync";

export class PluginApi {
	private api: TodoistApi;
	private app: App;
	private settings: Settings;

	public constructor(api: TodoistApi, app: App, settings: Settings) {
		this.api = api;
		this.app = app;
		this.settings = settings;
	}

	async processQuery(
		_: string,
		el?: HTMLElement,
		__?: MarkdownPostProcessorContext
	) {
		const projects = await this.api.getProjects();

		for (const project of projects) {
			// TODO: Handle nested projects
			const projectPath = `${this.settings.localProjectsFolder}/${project.name}`;
			const tasksFile = `${projectPath}/Tasks.md`;
			if (!doesPathExistInVault(this.app.vault, projectPath)) {
				this.app.vault.createFolder(projectPath);
			}

			if (!doesPathExistInVault(this.app.vault, tasksFile)) {
				const tasks = await this.api.getTasks({
					projectId: project.id,
				});
				const uniqueTaskSectionIds = new Set(
					tasks.map((task) => task.sectionId)
				);

				const allContent = [];

				for (const sectionId of uniqueTaskSectionIds) {
					if (sectionId) {
						const sectionTasks = tasks.filter(
							(task) => task.sectionId === sectionId
						);
						const section = await this.api.getSection(sectionId);

						allContent.push(`\n### ${section.name}\n\n`);
						allContent.push(
							sectionTasks.map(taskToMarkdown).join("\n")
						);
					} else {
						const sectionTasks = tasks.filter(
							(task) => !task.sectionId
						);
						allContent.push(`\n### Uncategorized\n\n`);
						allContent.push(
							sectionTasks.map(taskToMarkdown).join("\n")
						);
					}
				}

				const tasksContent = allContent.join("");

				this.app.vault.create(tasksFile, tasksContent);
			}

			el?.append(projectPath);
		}
	}

	async readSync() {
		const data = 'sync_token=*&resource_types=["all"]';

		const response = await fetch(SYNC_ENDPOINT, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${this.settings.accessToken}`,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: data,
		});

		const json = await response.json();

		console.log(json);
	}
}

const taskToMarkdown = (task: Task) => {
	return task.due?.date
		? `- [ ] ${task.content} #todo 📅 ${task.due?.date}`
		: `- [ ] ${task.content} #todo;`;
};

const doesPathExistInVault = (vault: Vault, path: string) => {
	const file = vault.getAbstractFileByPath(path);
	return file !== null;
};
