import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { cwd } from 'process';

import type { FilesSuggestions } from './extractFilesSuggestions';

export const applySuggestions = async (filesSuggestions: FilesSuggestions) => {
	const promises = filesSuggestions.map(async (fileSuggestions) => {
		const fileAbsolutePath = join(cwd(), fileSuggestions.fileName);
		const fileContent = await readFile(fileAbsolutePath, 'utf-8');
		const fileLines = fileContent.split('\n');

		const updatedLines = fileSuggestions.suggestions.reduce(
			(lines, suggestion) =>
				lines.map((line, index) => {
					const lineNumber = index + 1;
					if (
						lineNumber !== suggestion.lineNumber &&
						!suggestion.renameGlobally
					)
						return line;

					const dotIfNotGlobal = suggestion.renameGlobally ? '' : '.';
					const commonEdges = '\\s{}:,;()\\[\\]<>';
					const startEdges = `[${commonEdges}${dotIfNotGlobal}]`;
					const endEdges = `[${commonEdges}.]`;
					const replaceRegexp = new RegExp(
						`((?<=${startEdges})|^)${suggestion.currentName}((?=${endEdges})|$)`,
						'g',
					);

					return line.replaceAll(replaceRegexp, suggestion.suggestedName);
				}),
			fileLines,
		);
		const updatedFileContent = updatedLines.join('\n');

		await writeFile(fileAbsolutePath, updatedFileContent, 'utf-8');
	});
	await Promise.all(promises);
};
