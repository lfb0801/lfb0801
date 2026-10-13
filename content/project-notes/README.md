# Additional project notes

Use **Add project notes** on a project page to submit extra Markdown through an issue. The automation creates a pull request adding `content/project-notes/<repository-name>.md`. Merge that pull request to publish the notes alongside the repository's README.

You can also add or edit these files directly. The next synchronization includes them. Notes for projects that become private or unavailable remain here, but are excluded from the website catalog.

The source repository synchronizes hourly. The hosting repository also refreshes and publishes hourly, or immediately when its **Deploy personal website to root GitHub Pages site** workflow is run manually.

For issue-to-PR automation, enable **Allow GitHub Actions to create and approve pull requests** in this repository's Actions settings. If an existing `PAGES_DISPATCH_TOKEN` is available, the notes workflow uses it instead.
