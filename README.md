# ozp-iwc
Updating gh-pages. This should be migrated into a grunt task. Tags/permalinks need to be updated so that banners 
can be dynamically added to content to notify the viewer if the documentation does not pertain to the latest release.

Tested this script with version 1.2.0 to 1.2.1 migration.

If no new documentation is being added, only step 1 is needed. The grunt task will release the new version to the root of the 
gh-pages to ensure latest IWC bus is used (`/iframe_peer.html`).

### 1) To update gh-pages

(From master branch):

* Run `grunt update-gh-pages` and the version of IWC on current master will be updated on its gh-pages directory


### 2) Only If updating IWC version
(From gh-pages branch):
#### New Version Directory
* Copy `tutorial` directory from previous version to new version directory.
  * Replace `tag: <previous version>` with `tag: <current version>` for all markdowns in `tutorial` directory
  * Replace `permalink: "<previous version>/tutorial/index.html"` with `permalink: "<current version>/tutorial/index.html"` for file `tutorial/00_index.md`

* Copy `examples` directory from previous version to new version directory.
  * Replace `tag: <previous version>` with  `tag: <current version>` for all markdowns in `example` directory
  * Replace `permalink: "<previous version>/examples/index.html"` with `permalink: "<current version>/examples/index.html"` for file `examples/00_sharedControl.md`

* Copy `app.js` and `index.html` from previous version to new version directory.
  * Replace `tag: <previous version>` with `tag: <current version>` in `index.html`
  * Add `<previous version>` to `releases:`  in `index.html`

#### Old Version Directory
* Replace `layout: examples` with `layout: old_examples` for all markdowns in the `examples` directory of the now old version.
* Replace `layout: tutorial` with  `layout: old_tutorial` for all markdowns in the `tutorials` directory of the now old version.
* Replace `layout: default` with `layout: old_default` for `index.html`
* Remove `redirect_from` from all markdowns in the old version. These files contain it:
  * `index.html`
  * `tutorial/00_index.md`
  * `examples/00_sharedControl.md`
