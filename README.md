# Sample Customize MDC

[Material Components for the web (MDC Web)](https://github.com/material-components/material-components-web) helps developers execute [Material Design](Material Components for the web (MDC Web) helps developers execute Material Design.). With the latest updates, MDC can support people to building their own branding complies to Material Design in a very simple way.

This repository demonstrates the idea how people could depends on MDC and build their own UI library in a easily maintainable way.


# Quick start

Fork this repository and install the dependency libraries

```
npm install
```

This will install:

- material components web
- webpack and related loaders
- stylelint
- a couple of other development tools

Now you can simply run the following command and visit localhost:8080 to see a simple demo of customized mdc button

```
npm run dev
```


# How to build customized UI layer

MDC provides powerful mixins that could simply be used to build your UI components.

For example, you can create a variation of raised button by:

```
@import "@material/button/mixins";

.my-button.mdc-button {
  mdc-button-filled-accessible(#00ffff);
}
```

For more available mixins, see [component documents for MDC](https://material.io/components/web/catalog/)


# Lint you code frequently

The sample repository follows MDC using BEM style for all CSS classes.
You could find the rules at ```.stylelintrc.yaml``` under root folder of this repository. In case you are using an other modifier than the one I defined, you need to change the selector rules there to let lint pass.


# Visualize your changes

It is important to visualize and validate the changes. I set up a webpack-dev-server to build and run the demo site following the inspiration of MDC. To start the dev server, simply run:

```
npm run dev
```


# How about MDC JS

Unfortunately, webpack cannot simply bundle JS without adding wrappers, which will forbid us using global variables.
So instead as a compromise, I ask people to directly include the script tag to use MDC's js features.

```
<script src="/js/material-components-web.min.js" async></script>
```

It is pretty ugly to have this implicit dependency. I will try to see if there is a solution to this shortly.
