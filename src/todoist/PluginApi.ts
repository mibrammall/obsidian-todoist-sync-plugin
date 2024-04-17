import { TodoistApi } from "@doist/todoist-api-typescript";
import { App, TFile } from "obsidian";
import { Settings } from "src/Settings";
import { DataviewApi, getAPI, STask } from "obsidian-dataview";
import { renderTasks } from "src/ui/TaskElement";
const SYNC_ENDPOINT = "https://api.todoist.com/sync/v9/sync";

export type Literal =
	| boolean
	| number
	| string
	| Array<Literal>
	| null
	| HTMLElement;

export type GroupElement<T> = { key: Literal; rows: Grouping<T> };
export type Grouping<T> = T[] | GroupElement<T>[];

function syncProjectListToDictionary(projects: SyncProject[]) {
	const projectDictionary: Record<string, SyncProject> = {};

	for (const project of projects) {
		projectDictionary[project.id] = project;
	}

	return projectDictionary;
}

function syncSectionToDictionary(sections: SyncSection[]) {
	const sectionsDictionary: Record<string, SyncSection> = {};
	for (const section of sections) {
		sectionsDictionary[section.id] = section;
	}

	return sectionsDictionary;
}

function csvRowListToCsvString(rows: TaskCsvRow[]) {
	const header =
		"id,content,projectName,dueDate,isRecurring,sectionName,dateCreated\n";
	const rowsString = rows.map((row) => {
		return `${row.id},${row.content},${row.projectName},${row.dueDate},${row.isRecurring},${row.sectionName},${row.dateCreated}\n`;
	});

	return header + rowsString.join("");
}

interface TaskCsvRow {
	id: string;
	completed: boolean;
	completedAt?: string;
	dateCreated: string;
	content: string;
	projectName: string;
	sectionName: string;
	dueDate?: string;
	isRecurring: boolean;
}

const filename = "Tasks.csv";
export class PluginApi {
	private api: TodoistApi;
	private app: App;
	private settings: Settings;
	private dv: DataviewApi = getAPI();

	public constructor(api: TodoistApi, app: App, settings: Settings) {
		this.api = api;
		this.app = app;
		this.settings = settings;
	}

	async readSync() {
		console.info("Reading sync");

		const syncToken = "*";

		const data = `sync_token=${syncToken}&resource_types=["all"]`;

		const response = await fetch(SYNC_ENDPOINT, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${this.settings.accessToken}`,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: data,
		});

		const json = (await response.json()) as SyncResponse;
		const { projects, items } = json;

		const projectLookup = syncProjectListToDictionary(projects);
		const sectionLookup = syncSectionToDictionary(json.sections);

		const itemList = items.map((item) => {
			const project = projectLookup[item.project_id];
			const projectName = project ? project.name : "No project";
			const dueDate = item.due?.date || "";
			const isRecurring = item.due?.is_recurring || false;
			const section = sectionLookup[item.section_id];
			const sectionName = section ? section.name : "No section";
			return {
				id: item.id,
				content: item.content,
				projectName,
				dueDate,
				isRecurring,
				sectionName,
				completed: !!item.completed_at,
				dateCreated: item.added_at,
			};
		});

		const csv = csvRowListToCsvString(itemList);

		const file = this.app.vault.getAbstractFileByPath(filename) as TFile;

		if (!file) {
			console.log("Creating file");
			console.log(csv);
			try {
				await this.app.vault.create(filename, csv);
			} catch (e) {
				console.log(e);
			}
		} else {
			console.log("Updating file");
			this.app.vault.modify(file, csv);
		}
	}

	async renderQuery(query: string, element: HTMLElement) {
		const { value: result }: { value: TaskCsvRow[] } =
			await this.dv.index.csv.get(filename);

		const taskList: STask[] = [];

		console.log(result);

		for (const task of result) {
			const stask: STask = {
				created: task.dateCreated,
				modified: new Date(),
				children: [],
				task: true,
				text: task.content,
				path: "TodoistTasks",
			};
			taskList.push(stask);
		}

		return renderTasks(element, taskList);
	}
}

interface SyncProject {
	child_order: number;
	color: number;
	created_at: string;
	id: string;
	is_archived: number;
	is_deleted: number;
	name: string;
	parent_id: string;
	shared: boolean;
}

interface DueDate {
	date: string;
	is_recurring: boolean;
}

interface SyncSection {
	id: string;
	name: string;
	project_id: string;
}

interface SyncItem {
	checked: number;
	child_order: number;
	content: string;
	added_at: string;
	completed_at: string;
	due: DueDate;
	id: string;
	in_history: number;
	is_deleted: number;
	labels: string[];
	parent_id: string;
	priority: number;
	project_id: string;
	responsible_uid: string;
	section_id: string;
	updated_at: string;
}

interface SyncResponse {
	items: SyncItem[];
	projects: SyncProject[];
	sections: SyncSection[];
	sync_token: string;
}
