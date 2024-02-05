(self.webpackChunkvisyn_core=self.webpackChunkvisyn_core||[]).push([[991],{"./node_modules/@mdx-js/react/lib/index.js":(e,s,t)=>{"use strict";t.d(s,{NF:()=>o,Zo:()=>d,ah:()=>i,pC:()=>n});var r=t("./node_modules/react/index.js");let n=r.createContext({});function o(e){return function(s){let t=i(s.components);return r.createElement(e,{...s,allComponents:t})}}function i(e){let s=r.useContext(n);return r.useMemo(()=>"function"==typeof e?e(s):{...s,...e},[s,e])}let a={};function d({components:e,children:s,disableParentContext:t}){let o;return o=t?"function"==typeof e?e({}):e||a:i(e),r.createElement(n.Provider,{value:o},s)}},"./node_modules/@storybook/addon-docs/dist/chunk-HLWAVYOI.mjs":(e,s,t)=>{"use strict";t.d(s,{r:()=>d});var r=t("./node_modules/react/index.js"),n=t("./node_modules/@storybook/react-dom-shim/dist/react-18.mjs"),o=t("./node_modules/@storybook/blocks/dist/index.mjs"),i={code:o.bD,a:o.Ct,...o.lO},a=class extends r.Component{constructor(){super(...arguments),this.state={hasError:!1}}static getDerivedStateFromError(){return{hasError:!0}}componentDidCatch(e){let{showException:s}=this.props;s(e)}render(){let{hasError:e}=this.state,{children:s}=this.props;return e?null:r.createElement(r.Fragment,null,s)}},d=class{constructor(){this.render=async(e,s,d)=>{let l={...i,...s?.components},c=o.WI;return new Promise((o,i)=>{t.e(433).then(t.bind(t,"./node_modules/@mdx-js/react/index.js")).then(({MDXProvider:t})=>(0,n.l)(r.createElement(a,{showException:i,key:Math.random()},r.createElement(t,{components:l},r.createElement(c,{context:e,docsParameter:s}))),d)).then(()=>o())})},this.unmount=e=>{(0,n.K)(e)}}}},"./src/stories/Introduction.stories.mdx":(e,s,t)=>{"use strict";t.r(s),t.d(s,{__namedExportsOrder:()=>c,__page:()=>a,default:()=>l}),t("./node_modules/react/index.js");var r=t("./node_modules/@mdx-js/react/lib/index.js");t("./node_modules/@storybook/addon-docs/dist/chunk-HLWAVYOI.mjs");var n=t("./node_modules/@storybook/blocks/dist/index.mjs"),o=t("./node_modules/react/jsx-runtime.js");function i(e){let s=Object.assign({h1:"h1",p:"p",strong:"strong",code:"code",a:"a"},(0,r.ah)(),e.components);return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(n.h_,{title:"Example/Introduction"}),"\n",(0,o.jsx)("style",{children:`
  .subheading {
    --mediumdark: '#999999';
    font-weight: 900;
    font-size: 13px;
    color: #999;
    letter-spacing: 6px;
    line-height: 24px;
    text-transform: uppercase;
    margin-bottom: 12px;
    margin-top: 40px;
  }

  .link-list {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
    row-gap: 10px;
  }

  @media (min-width: 620px) {
    .link-list {
      row-gap: 20px;
      column-gap: 20px;
      grid-template-columns: 1fr 1fr;
    }
  }

  @media all and (-ms-high-contrast:none) {
  .link-list {
      display: -ms-grid;
      -ms-grid-columns: 1fr 1fr;
      -ms-grid-rows: 1fr 1fr;
    }
  }

  .link-item {
    display: block;
    padding: 20px 30px 20px 15px;
    border: 1px solid #00000010;
    border-radius: 5px;
    transition: background 150ms ease-out, border 150ms ease-out, transform 150ms ease-out;
    color: #333333;
    display: flex;
    align-items: flex-start;
  }

  .link-item:hover {
    border-color: #1EA7FD50;
    transform: translate3d(0, -3px, 0);
    box-shadow: rgba(0, 0, 0, 0.08) 0 3px 10px 0;
  }

  .link-item:active {
    border-color: #1EA7FD;
    transform: translate3d(0, 0, 0);
  }

  .link-item strong {
    font-weight: 700;
    display: block;
    margin-bottom: 2px;
  }
  
  .link-item img {
    height: 40px;
    width: 40px;
    margin-right: 15px;
    flex: none;
  }

  .link-item span {
    font-size: 14px;
    line-height: 20px;
  }

  .tip {
    display: inline-block;
    border-radius: 1em;
    font-size: 11px;
    line-height: 12px;
    font-weight: 700;
    background: #E7FDD8;
    color: #66BF3C;
    padding: 4px 12px;
    margin-right: 10px;
    vertical-align: top;
  }

  .tip-wrapper {
    font-size: 13px;
    line-height: 20px;
    margin-top: 40px;
    margin-bottom: 40px;
  }

  .tip-wrapper code {
    font-size: 12px;
    display: inline-block;
  }

  
  `}),"\n",(0,o.jsx)(s.h1,{id:"welcome-to-storybook",children:"Welcome to Storybook"}),"\n",(0,o.jsxs)(s.p,{children:["Storybook helps you build UI components in isolation from your app's business logic, data, and context.\nThat makes it easy to develop hard-to-reach states. Save these UI states as ",(0,o.jsx)(s.strong,{children:"stories"})," to revisit during development, testing, or QA."]}),"\n",(0,o.jsxs)(s.p,{children:["Browse example stories now by navigating to them in the sidebar.\nView their code in the ",(0,o.jsx)(s.code,{children:"src/stories"})," directory to learn how they work.\nWe recommend building UIs with a ",(0,o.jsx)(s.a,{href:"https://componentdriven.org",target:"_blank",rel:"nofollow noopener noreferrer",children:(0,o.jsx)(s.strong,{children:"component-driven"})})," process starting with atomic components and ending with pages."]}),"\n",(0,o.jsx)("div",{className:"subheading",children:"Configure"}),"\n",(0,o.jsxs)("div",{className:"link-list",children:[(0,o.jsx)("a",{className:"link-item",href:"https://storybook.js.org/docs/react/addons/addon-types",target:"_blank",children:(0,o.jsx)("span",{children:(0,o.jsxs)(s.p,{children:[(0,o.jsx)("strong",{children:"Presets for popular tools"}),"\nEasy setup for TypeScript, SCSS and more."]})})}),(0,o.jsx)("a",{className:"link-item",href:"https://storybook.js.org/docs/react/configure/webpack",target:"_blank",children:(0,o.jsx)("span",{children:(0,o.jsxs)(s.p,{children:[(0,o.jsx)("strong",{children:"Build configuration"}),"\nHow to customize webpack and Babel"]})})}),(0,o.jsx)("a",{className:"link-item",href:"https://storybook.js.org/docs/react/configure/styling-and-css",target:"_blank",children:(0,o.jsx)("span",{children:(0,o.jsxs)(s.p,{children:[(0,o.jsx)("strong",{children:"Styling"}),"\nHow to load and configure CSS libraries"]})})}),(0,o.jsx)("a",{className:"link-item",href:"https://storybook.js.org/docs/react/get-started/setup#configure-storybook-for-your-stack",target:"_blank",children:(0,o.jsx)("span",{children:(0,o.jsxs)(s.p,{children:[(0,o.jsx)("strong",{children:"Data"}),"\nProviders and mocking for data libraries"]})})})]}),"\n",(0,o.jsx)("div",{className:"subheading",children:"Learn"}),"\n",(0,o.jsxs)("div",{className:"link-list",children:[(0,o.jsx)("a",{className:"link-item",href:"https://storybook.js.org/docs",target:"_blank",children:(0,o.jsx)("span",{children:(0,o.jsxs)(s.p,{children:[(0,o.jsx)("strong",{children:"Storybook documentation"}),"\nConfigure, customize, and extend"]})})}),(0,o.jsx)("a",{className:"link-item",href:"https://storybook.js.org/tutorials/",target:"_blank",children:(0,o.jsx)("span",{children:(0,o.jsxs)(s.p,{children:[(0,o.jsx)("strong",{children:"In-depth guides"}),"\nBest practices from leading teams"]})})}),(0,o.jsx)("a",{className:"link-item",href:"https://github.com/storybookjs/storybook",target:"_blank",children:(0,o.jsx)("span",{children:(0,o.jsxs)(s.p,{children:[(0,o.jsx)("strong",{children:"GitHub project"}),"\nView the source and add issues"]})})}),(0,o.jsx)("a",{className:"link-item",href:"https://discord.gg/storybook",target:"_blank",children:(0,o.jsx)("span",{children:(0,o.jsxs)(s.p,{children:[(0,o.jsx)("strong",{children:"Discord chat"}),"\nChat with maintainers and the community"]})})})]}),"\n",(0,o.jsx)("div",{className:"tip-wrapper",children:(0,o.jsxs)(s.p,{children:[(0,o.jsx)("span",{className:"tip",children:"Tip"}),"Edit the Markdown in"," ","\n",(0,o.jsx)("code",{children:"src/stories/Introduction.stories.mdx"})]})})]})}let a=()=>{throw Error("Docs-only story")};a.parameters={docsOnly:!0};let d={title:"Example/Introduction",tags:["stories-mdx"],includeStories:["__page"]};d.parameters=d.parameters||{},d.parameters.docs={...d.parameters.docs||{},page:function(e={}){let{wrapper:s}=Object.assign({},(0,r.ah)(),e.components);return s?(0,o.jsx)(s,{...e,children:(0,o.jsx)(i,{...e})}):i(e)}};let l=d,c=["__page"]},"./node_modules/memoizerific sync recursive":e=>{function s(e){var s=Error("Cannot find module '"+e+"'");throw s.code="MODULE_NOT_FOUND",s}s.keys=()=>[],s.resolve=s,s.id="./node_modules/memoizerific sync recursive",e.exports=s},"./node_modules/react/cjs/react-jsx-runtime.production.min.js":(e,s,t)=>{"use strict";/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var r=t("./node_modules/react/index.js"),n=Symbol.for("react.element"),o=Symbol.for("react.fragment"),i=Object.prototype.hasOwnProperty,a=r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,d={key:!0,ref:!0,__self:!0,__source:!0};function l(e,s,t){var r,o={},l=null,c=null;for(r in void 0!==t&&(l=""+t),void 0!==s.key&&(l=""+s.key),void 0!==s.ref&&(c=s.ref),s)i.call(s,r)&&!d.hasOwnProperty(r)&&(o[r]=s[r]);if(e&&e.defaultProps)for(r in s=e.defaultProps)void 0===o[r]&&(o[r]=s[r]);return{$$typeof:n,type:e,key:l,ref:c,props:o,_owner:a.current}}s.Fragment=o,s.jsx=l,s.jsxs=l},"./node_modules/react/jsx-runtime.js":(e,s,t)=>{"use strict";e.exports=t("./node_modules/react/cjs/react-jsx-runtime.production.min.js")}}]);