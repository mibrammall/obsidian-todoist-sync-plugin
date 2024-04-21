import { App, Component, MarkdownRenderer } from "obsidian";
import React, { createContext } from "react";
import { MouseEventHandler, useContext, useEffect, useRef } from "react";

type DataviewInit = {
	app: App;
	container: HTMLElement;
};

type DataviewContexts = DataviewInit & {
	component: Component;
};

export const DataviewContext = createContext<DataviewContexts>(undefined!);

/** Hacky preact component which wraps Obsidian's markdown renderer into a neat component. */
export function RawMarkdown({
	content,
	sourcePath,
	inline = true,
	style,
	cls,
	onClick,
}: {
	content: string;
	sourcePath: string;
	inline?: boolean;
	style?: object;
	cls?: string;
	onClick?: MouseEventHandler<HTMLSpanElement>;
}) {
	const container = useRef<HTMLElement | null>(null);
	const component = useContext(DataviewContext).component;

	useEffect(() => {
		if (!container.current) return;

		container.current.innerHTML = "";
		MarkdownRenderer.renderMarkdown(
			content,
			container.current,
			sourcePath,
			component
		).then(() => {
			if (!container.current || !inline) return;

			// Unwrap any created paragraph elements if we are inline.
			let paragraph = container.current.querySelector("p");
			while (paragraph) {
				const children = paragraph.childNodes;
				paragraph.replaceWith(...Array.from(children));
				paragraph = container.current.querySelector("p");
			}
		});
	}, [content, sourcePath, container.current]);

	return (
		<span
			ref={container}
			style={style}
			className={cls}
			onClick={onClick}
		></span>
	);
}

export const Markdown = React.memo(RawMarkdown);
