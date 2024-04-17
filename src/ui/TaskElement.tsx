import { createRoot, Container } from "react-dom/client";
import { TaskCsvRow } from "src/Models";

export function renderTasks(element: Container, taskList: TaskCsvRow[]) {
	const root = createRoot(element);
	console.log(taskList);
	root.render(<TaskList taskList={taskList} />);
}

export function TaskList({ taskList }: { taskList: TaskCsvRow[] }) {
	return <></>;
}

export function Task(_: TaskCsvRow) {
	return <h1>Hello</h1>;
}
