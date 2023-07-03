const fileNameRegexp = /^[^(]*/;
const lineNumberRegexp = /(?<=(\())\d+/;

/**
 * These expressions are based on format of TS errors
 * @example @api/requests/bankCustomerGateway.ts(2,2): error TS2724: '"../generated/bankCustomerApi"' has no exported member named 'ChallengeConfirmRequest'. Did you mean 'ChallengeConfirmRequestV2'?
 * @example src/hooks/react-query/constants/BankMutationKeys.ts(25,34): error TS2551: Property 'bcCardsCreateCardM' does not exist on type '{ readonly bcCardsActivateCardV2M: "bcCardsActivateCardV2M"; readonly bcCardsActivateCardV3M: "bcCardsActivateCardV3M"; readonly bcCardsCreateCardV2V2M: "bcCardsCreateCardV2V2M"; ... 38 more ...; readonly bcCardsVerifyCardTokenV3M: "bcCardsVerifyCardTokenV3M"; }'. Did you mean 'bcCardsCreateCardV3M'?
 * @example src/notifications/actions/useGoToChildPaymentResult.ts(23,7): error TS2345: Argument of type '{ requestedOperationSignDetailRequest: { operationUuid: string; }; }' is not assignable to parameter of type 'Omit<SignsApiRequestedOperationSignDetailV2Request, keyof AuthorizationAndCorrelationIdConstraint>'.   Object literal may only specify known properties, but 'requestedOperationSignDetailRequest' does not exist in type 'Omit<SignsApiRequestedOperationSignDetailV2Request, keyof AuthorizationAndCorrelationIdConstraint>'. Did you mean to write 'requestedOperationSignDetailRequestV2'?
 */
const currentNameImportRegexp = /(?<=(has no exported member named '))[^']*/;
const currentNameAccessedPropertyRegexp = /([^']*(?=(' does not exist on)))/;
const currentNamePropertyRegexp =
	/(?<=(Object literal may only specify known properties, but '))[^']*/;

const didYouMeanSuggestedNameRegexp = /(?<=(Did you mean '))[^']*/;
const didYouMeanToWriteSuggestedNameRegexp =
	/(?<=(Did you mean to write '))[^']*/;

type Suggestion = {
	lineNumber: number;
	currentName: string;
	suggestedName: string;
	renameGlobally: boolean;
};
type FileSuggestion = {
	fileName: string;
	suggestions: Suggestion[];
};
export type FilesSuggestions = FileSuggestion[];

export const extractFilesSuggestions = (errors: string[]) =>
	errors.reduce<FilesSuggestions>((acc, error) => {
		const fileName = error.match(fileNameRegexp)?.[0];
		const lineNumber = error.match(lineNumberRegexp)?.[0];
		if (!fileName || lineNumber === undefined) return acc;

		const numberifiedLineNumber = +lineNumber;

		const currentNameImport = error.match(currentNameImportRegexp)?.[0];
		const currentNameAccessedProperty = error.match(
			currentNameAccessedPropertyRegexp,
		)?.[0];
		const currentNameProperty = error.match(currentNamePropertyRegexp)?.[0];
		const currentName =
			currentNameImport ?? currentNameAccessedProperty ?? currentNameProperty;

		const didYouMeanSuggestedName = error.match(
			didYouMeanSuggestedNameRegexp,
		)?.[0];
		const didYouMeanToWriteSuggestedName = error.match(
			didYouMeanToWriteSuggestedNameRegexp,
		)?.[0];
		const suggestedName =
			didYouMeanSuggestedName ?? didYouMeanToWriteSuggestedName;

		if (!currentName || !suggestedName) return acc;


		const suggestion: Suggestion = {
			currentName,
			suggestedName,
			lineNumber: numberifiedLineNumber,
			renameGlobally: !!currentNameImport,
		};

		const processedFile = acc.find((file) => file.fileName === fileName);
		if (processedFile) {
			processedFile.suggestions.push(suggestion);
			return acc;
		}

		const newProcessedFile: FileSuggestion = {
			fileName,
			suggestions: [suggestion],
		};
		acc.push(newProcessedFile);

		return acc;
	}, []);
