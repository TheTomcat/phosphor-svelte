> [!NOTE]
> This was heavily inspired/copied from the amazing work done by redhg.

# Welcome to Phosphor.

Phosphor is a project originally created by @redhg on github.
It is a retro terminal simulator for tabletop role-playing games. I've rewritten the project in
svelte mostly because I'm learning how to use Svelte (and I have no idea how to use React).

The inspiration for this little app was [Quadra's post](https://www.traaa.sh/the-ypsilon-14-terminal)
about an ersatz terminal for [The Haunting of Ypsilon 14](https://www.mothershiprpg.com/pamphlet-adventures/#The_Haunting_Of_Ypsilon_14), a module written by D G Chapman for [the Mothership tabletop roleplaying game](https://www.mothershiprpg.com/).

Jump right in and use the configuration I've created. Or, if you're feeling adventurous, create
your own configuration file!

All the data is saved to your browser, nothing is shared with a server anywhere.
Expect bugs. Lots of bugs. And that's not even counting the game!

## How does it work

The data is loaded from your localStorage into the app. You can edit it offline using a text editor of your choice. The schema is available under `/src/lib/assets/jsonschema.json`, or the typescript definitions are in `/src/lib/PhosphorData.ts`

## Caveat Adventurer

This is by no means a completed project. I hope to add all sorts of useless stuff over time. Expect bugs!!!

## Coming soon:

- [ ] Sound effects - partially completed. I have teletext
- [ ] JSON uploading & parsing - partially completed
- [ ] Themes - shamelessly stolen from redhg's, but now they're swappable
- [ ] Smart actions, regex and variables
