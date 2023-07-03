export const readInput = () =>
	new Promise<string[]>((resolve, reject) => {
		const stdin = process.stdin;
		let data = '';

		stdin.setEncoding('utf8');
		stdin.on('data', function (chunk) {
			data += chunk;
		});
		stdin.on('end', () => {
			const lines = data.split('\n');
			/** Error message are in lines 2 - (n-2) */
			const onlyUsefulLines = lines.slice(2).slice(0, -2);
			const joinedLines = onlyUsefulLines.reduce((acc: string[], line) => {
				if (line.startsWith(' ')) {
					const accLength = acc.length;

					const prevLine = acc[accLength - 1];
					acc[accLength - 1] = `${prevLine} ${line}`;
					return acc;
				}
				return [...acc, line];
			}, []);

			resolve(joinedLines);
		});

		stdin.on('error', (error) => reject(error));
	});
