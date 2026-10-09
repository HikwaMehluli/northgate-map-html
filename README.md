# Northgate Estates - Interactive Map

An Interactive Map for a real estate development called Northgate Estates in Harare, Zimbabwe. Please note this is a demo project using plain HTML/CSS/SASS/JS. If you would love to see the completed project send me a DM or Tweet [Twitter](https://twitter.com/HikwaMehluli "Ask for Demo")

I hope this inspires you on how to create interactive maps. If you do work on something please share with me.

Demo Page - https://northgate-maps.vercel.app/

Live Page - Coming Soon

## Production Dependencies
#### TippyJS, Micromodal.JS and Driver.js

```
npm i tippy.js

npm i micromodal --save

npm i driver.js
```

Driver.js powers the guided tour (`js/tour.js`); its CSS is bundled into `app.js`.

#### svgPanZoom.JS and Hammer.JS
svgPanZoom & HammerJS are imported from /js folder into /js/script.js and compiled using webpack
```
import svgPanZoom from'./svg-pan-zoom.min.js';
import './hammer.js';
```

## Sections Overlay Map

`phase-one-overlay.html` shows the Phase One stands with the 5 section shapes layered on top (50% opacity, 100% on hover; click a section to open its page). Both the page and `SVG/phase-one-sections-overlay.svg` are generated from `SVG/phase-one.svg` + `SVG/phase-one-sections.svg`:

```
node build-overlay.js
```

## Development Dependencies
#### Install SASS, Webpack & Webpack CLI

You do not need to install these development dependencies if you have theme installed globally on your machine.

```
npm i sass webpack webpack-cli --save-dev
```

#### Bundling CSS from npm packages

Webpack is configured with `css-loader` / `style-loader` so CSS imported from npm packages (e.g. `driver.js/dist/driver.css`) compiles into `js/app.js`:

```
npm i css-loader style-loader --save-dev
```

#### If you have any Questions or Need help expanding on this, hit me up!

[Website](https://thatafro.netlify.app/ "Personal Website") | [Twitter](https://twitter.com/HikwaMehluli "Follow @thatafro on Twitter") | [Instagram](https://www.instagram.com/thatafro "Digital Illustrations") 
