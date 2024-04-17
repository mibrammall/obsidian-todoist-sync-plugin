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
