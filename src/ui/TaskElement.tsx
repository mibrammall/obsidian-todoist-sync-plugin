import { STask } from "obsidian-dataview";
import { createRoot, Container } from "react-dom/client";

export function renderTasks(element: Container, taskList: STask[]) {
	const root = createRoot(element);
	console.log(taskList);
	root.render(<Task />);
}

export function Task(_: STask) {
	return <h1>Hello</h1>;
}
