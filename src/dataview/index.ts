import { DataviewApi, STask } from "obsidian-dataview";
import { OrderedFilter } from "./Models";

export interface GetTasksProps {
	date: string;
	includeCompleted?: boolean;
	filter?: OrderedFilter;
}

export async function getDataviewTasks(
	api: DataviewApi,
	props: GetTasksProps
): Promise<STask[]> {
	const query = buildQuery(props);

	const tasks = await api.query(query);

	return tasks.value.values;
}

function buildQuery(props: GetTasksProps) {
	const { date, filter, includeCompleted } = props;
	const filterOperator = getFilter(filter ?? OrderedFilter.EQ);
	let query = `TASK WHERE due ${filterOperator} date(${date})`;

	if (!includeCompleted) {
		query += " AND !completed";
	}

	return query;
}

function getFilter(filter: OrderedFilter) {
	switch (filter) {
		case OrderedFilter.EQ:
			return "=";
		case OrderedFilter.GT:
			return ">";
		case OrderedFilter.GTE:
			return ">=";
		case OrderedFilter.LT:
			return "<";
		case OrderedFilter.LTE:
			return "<=";
		default:
			throw new Error(`Unrecognised filter: ${filter}`);
	}
}
