<div class="container">
	<h1>Welcome to Phosphor.</h1>
	<div>
		Phosphor is a project originally created by <a href="https://github.com/redhg/phosphor"
			>@redhg</a
		>
		on github. The source code for this version can be found
		<a href="https://github.com/thetomcat/phosphor-svelte">on my github.</a>
	</div>
	<div>
		It is a retro terminal simulator for tabletop role-playing games. I've rewritten the project in
		svelte mostly because I'm learning how to use Svelte (and I have no idea how to use React).
	</div>
	<div>
		Credit is ultimately owed to Quadra whose <a href="https://www.traaa.sh/the-ypsilon-14-terminal"
			>idea</a
		> spawned the whole thing.
	</div>
	<div>
		<a href="/default">Jump right in and use the configuration I've created.</a> Or, if you're feeling
		adventurous, create your own configuration file!
	</div>
	<div>
		All the data is saved to your browser, nothing is shared with a server anywhere. When I say
		'upload', all that is happening is the json file specified is validated then stored in
		localStorage on your own browser.
	</div>
	<div>Expect bugs. Lots of bugs. And that's not even counting the game!</div>
	<div class="hcontainer">
		<div class="button">
			<a href="/validate">Try out this (buggy) editor</a>
		</div>
		<div class="button">
			<a href="/import">Settings. 'Upload' JSON or change theme.</a>
		</div>
	</div>
	<div class="hcontainer">
		<div class="button">
			<a href="/app">Run app with your settings</a>
		</div>
		<div class="button">
			<a href="/default">Or, use my version.</a>
		</div>
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		font-size: smaller;
	}
	h1 {
		font-size: larger;
	}
	a {
		text-decoration: underline;
	}
	.hcontainer {
		align-items: center;
		justify-content: center;
		display: flex;
		flex-direction: row;
		gap: 1rem;
	}
	.button {
		border: 1px solid;
		box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.3);
		padding: 0.5rem;
		text-align: center;
	}
</style>
