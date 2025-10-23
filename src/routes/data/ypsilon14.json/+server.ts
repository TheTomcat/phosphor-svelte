import ypsilon from '$lib/assets/ypsilon14.json'; // or readFile if truly external

export const GET = () =>
	new Response(JSON.stringify(ypsilon), {
		headers: {
			'content-type': 'application/json',
			'content-disposition': 'attachment; filename="ypsilon14.json"'
		}
	});
