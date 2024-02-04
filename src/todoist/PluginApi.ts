import { TodoistApi } from "@doist/todoist-api-typescript";
import { App, MarkdownPostProcessorContext } from "obsidian";

export class PluginApi {
	private api: TodoistApi;
	private app: App;

	public constructor(api: TodoistApi, app: App) {
		this.api = api;
		this.app = app;
	}

	async processQuery(
		code: string,
		el: HTMLElement,
		ctx: MarkdownPostProcessorContext
	) {
		console.log("Processing query", code);
		const projects = await this.api.getProjects();
		console.log(projects);
	}
}
