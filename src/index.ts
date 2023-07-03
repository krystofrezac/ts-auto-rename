import { applySuggestions } from './applySuggestions';
import { extractFilesSuggestions } from './extractFilesSuggestions';
import { readInput } from './readInput';

(async () => {
	const input = await readInput();

	const start = performance.now();

	const suggestions = extractFilesSuggestions(input);
	await applySuggestions(suggestions);

	const end = performance.now();
	const totalTime = end - start;

	// eslint-disable-next-line no-console
	console.log(`Auto renaming took ${totalTime}ms`);
})();
