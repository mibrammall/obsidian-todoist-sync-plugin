import { createRoot, Container } from "react-dom/client";
import { TaskCsvRow } from "src/Models";

export function renderTasks(element: Container, taskList: TaskCsvRow[]) {
	const root = createRoot(element);
	console.log(taskList);
	root.render(<TaskList taskList={taskList} />);
}

export function TaskList({ taskList }: { taskList: TaskCsvRow[] }) {
	return (
		<ul className="contains-task-list">
			{taskList.map((task) => (
				<Task task={task} key={task.id} />
			))}
		</ul>
	);
}

export function Task({ task }: { task: TaskCsvRow }) {
	const checked = false;
	const onClicked = () => {};
	const onChecked = () => {};
	const onChanged = () => {};
	const isString = typeof task.content === "string";
	return (
		<li
			className={
				"dataview task-list-item" + (checked ? " is-checked" : "")
			}
			onClick={onClicked}
			// data-task={item.status}
		>
			<input
				className="dataview task-list-item-checkbox"
				type="checkbox"
				checked={checked}
				onChange={onChanged}
				onClick={onChecked}
			/>
			{isString ? task.content : task.content.path}
		</li>
	);
	return <div></div>;
}
