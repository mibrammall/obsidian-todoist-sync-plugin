import { STask } from "obsidian-dataview";
import { createRoot, Container } from "react-dom/client";

export function renderTasks(element: Container, taskList: STask[]) {
	const root = createRoot(element);
	console.log(taskList);
	root.render(<TaskList taskList={taskList} />);
}

export function TaskList({ taskList }: { taskList: STask[] }) {
	return (
		<ul className="contains-task-list">
			{taskList.map((task) => (
				<Task task={task} key={task.id} />
			))}
		</ul>
	);
}

export function Task({ task }: { task: STask }) {
	const onClicked = () => {};
	const onChecked = () => {};
	const onChanged = () => {};
	const isString = typeof task.content === "string";
	return (
		<li
			className={
				"dataview task-list-item" + (task.checked ? " is-checked" : "")
			}
			onClick={onClicked}
			data-task={task.status}
		>
			<input
				className="dataview task-list-item-checkbox"
				type="checkbox"
				checked={task.checked}
				onChange={onChanged}
				onClick={onChecked}
			/>
			{isString ? task.visual : task.text}
		</li>
	);
}
