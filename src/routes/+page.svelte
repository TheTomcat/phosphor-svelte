<div class="container">
	<h1>Welcome to Phosphor.</h1>
	<div>
		Phosphor is a project originally created by <a href="https://github.com/redhg/phosphor"
			>@redhg</a
		>
		on github.
	</div>
	<div>
		It is a retro terminal simulator for tabletop role-playing games. I've rewritten the project in
		svelte mostly because I'm learning how to use Svelte (and I have no idea how to use React).
	</div>
	<div>
		The inspiration for this little app was <a href="https://www.traaa.sh/the-ypsilon-14-terminal"
			>Quadra's post</a
		>
		about an ersatz terminal for The Haunting of Ypsilon 14, a module written by D G Chapman for the
		<a href="https://www.mothershiprpg.com/">Mothership tabletop roleplaying game</a>.
	</div>
	<div>
		Jump right in and use the configuration I've created. Or, if you're feeling adventurous, create
		your own configuration file!
	</div>
	<div>All the data is saved to your browser, nothing is shared with a server anywhere.</div>
	<div>Expect bugs. Lots of bugs. And that's not even counting the game!</div>
	<div class="hcontainer">
		<div class="button">
			<a href="/app">Run app with your settings</a>
		</div>
		<div class="button">
			<a href="/validate">Try out this (buggy) editor</a>
		</div>
		<div class="button">
			<a href="/import">Edit Settings. Import JSON or change theme.</a>
		</div>
	</div>
	<div class="button">
		<a href="/default">Or, use my version.</a>
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
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
