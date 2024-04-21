import { App, TFile } from "obsidian";
import { Settings } from "src/Settings";
import { DateTime } from "luxon";
import { DataviewApi, STask, getAPI } from "obsidian-dataview";
import { renderTasks } from "src/ui/TaskElement";
import { TaskCsvRow } from "src/Models";
import { SYNC_ENDPOINT, TASKS_FILENAME } from "./Constants";
import { getDataviewTasks } from "src/dataview";
import { OrderedFilter } from "src/dataview/Models";

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

export class PluginApi {
	private app: App;
	private settings: Settings;
	private dv: DataviewApi = getAPI();

	public constructor(app: App, settings: Settings) {
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
		console.log(items);

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

		const file = this.app.vault.getAbstractFileByPath(
			TASKS_FILENAME
		) as TFile;

		if (!file) {
			console.log("Creating file");
			console.log(csv);
			try {
				await this.app.vault.create(TASKS_FILENAME, csv);
			} catch (e) {
				console.log(e);
			}
		} else {
			console.log("Updating file");
			await this.app.vault.modify(file, csv);
		}
	}

	async renderQuery(_: string, element: HTMLElement) {
		const { value: queryResult }: { value: TaskCsvRow[] } =
			await this.dv.index.csv.get(TASKS_FILENAME);
		const todoistTasks = queryResult.map(convertTaskToSTask);
		const dvTasks = await getDataviewTasks({
			date: "2024-04-18",
			filter: OrderedFilter.EQ,
			includeCompleted: false,
		});

		const combinedTasks = dvTasks.concat(todoistTasks);

		return renderTasks(element, combinedTasks);
	}
}

function convertTaskToSTask(task: TaskCsvRow): STask {
	return {
		annotated: true,
		due: DateTime.fromISO(task.dueDate ?? ""),
		text: task.content,
		tags: ["#todo"],
	};
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
	completed_at?: string;
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
