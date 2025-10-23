import schema from '$lib/assets/jsonschema.json';
export const GET = () =>
	new Response(JSON.stringify(schema), {
		headers: {
			'content-type': 'application/json',
			'content-disposition': 'attachment; filename="jsonschema.json"'
		}
	});
