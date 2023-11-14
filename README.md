# Extension Installation and Local Run Guide

Follow these steps to install and run the extension locally:

1. Run `npm i` in the terminal.
2. Run `tsc`.
3. Run `npx webpack` to create the dist file.
4. Go to Chrome extension and enable developer mode.
5. Load unpacked in the root file.
6. Visit LinkedIn and search for any keyword.
7. Click on the extension in the LinkedIn page (top right) and click on "Start Campaign."
8. Inspect your browser and check `indexedDB -> LinkedInLeads -> leads` for the leads' information.