export interface GetTasksQuery {
	date: string;
	includeCompleted?: boolean;
	filter?: OrderedFilter;
}

export enum OrderedFilter {
	LT = "<",
	LTE = "<=",
	GT = ">",
	GTE = ">=",
	EQ = "==",
}
export interface TaskCsvRow {
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
