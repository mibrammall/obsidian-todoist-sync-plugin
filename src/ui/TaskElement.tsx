import { createRoot, Container } from "react-dom/client";
import { TaskCsvRow } from "src/Models";

export function renderTasks(element: Container, taskList: TaskCsvRow[]) {
	const root = createRoot(element);
	console.log(taskList);
	root.render(<TaskList taskList={taskList} />);
}

export function TaskList({ taskList }: { taskList: TaskCsvRow[] }) {
	return (
		<>
			{taskList.map((task) => (
				<Task task={task} key={task.id} />
			))}
		</>
	);
}

export function Task({ task }: { task: TaskCsvRow }) {
	const isString = typeof task.content === "string";
	return <div>{isString ? task.content : task.content.path}</div>;
}
