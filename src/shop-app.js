import { rootPath as rootPath$0 } from '@polymer/polymer/lib/utils/settings.js';
import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { stylesFromTemplate, stylesFromModuleImports } from '@polymer/polymer/lib/utils/style-gather.js';
import { resolveCss, resolveUrl as resolveUrl$0 } from '@polymer/polymer/lib/utils/resolve-url.js';
import { DomModule } from '@polymer/polymer/lib/elements/dom-module.js';
import { PropertyEffects } from '@polymer/polymer/lib/mixins/property-effects.js';
import { PropertiesMixin } from '@polymer/polymer/lib/mixins/properties-mixin.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';


const ElementMixin = dedupingMixin(base => {

  const polymerElementBase = PropertiesMixin(PropertyEffects(base));

  function propertyDefaults(constructor) {
    if (!constructor.hasOwnProperty(
      JSCompiler_renameProperty('__propertyDefaults', constructor))) {
      constructor.__propertyDefaults = null;
      let props = constructor._properties;
      for (let p in props) {
        let info = props[p];
        if ('value' in info) {
          constructor.__propertyDefaults = constructor.__propertyDefaults || {};
          constructor.__propertyDefaults[p] = info;
        }
      }
    }
    return constructor.__propertyDefaults;
  }

  function ownObservers(constructor) {
    if (!constructor.hasOwnProperty(
      JSCompiler_renameProperty('__ownObservers', constructor))) {
        constructor.__ownObservers =
        constructor.hasOwnProperty(JSCompiler_renameProperty('observers', constructor)) ?
        /** @type {PolymerElementConstructor} */ (constructor).observers : null;
    }
    return constructor.__ownObservers;
  }

  function createPropertyFromConfig(proto, name, info, allProps) {
    // computed forces readOnly...
    if (info.computed) {
      info.readOnly = true;
    }
    if (info.computed && !proto._hasReadOnlyEffect(name)) {
      proto._createComputedProperty(name, info.computed, allProps);
    }
    if (info.readOnly && !proto._hasReadOnlyEffect(name)) {
      proto._createReadOnlyProperty(name, !info.computed);
    }
    if (info.reflectToAttribute && !proto._hasReflectEffect(name)) {
      proto._createReflectedProperty(name);
    }
    if (info.notify && !proto._hasNotifyEffect(name)) {
      proto._createNotifyingProperty(name);
    }
    // always add observer
    if (info.observer) {
      proto._createPropertyObserver(name, info.observer, allProps[info.observer]);
    }
    // always create the mapping from attribute back to property for deserialization.
    proto._addPropertyToAttributeMap(name);
  }

  function processElementStyles(klass, template, is, baseURI) {
    const templateStyles = template.content.querySelectorAll('style');
    const stylesWithImports = stylesFromTemplate(template);
    // insert styles from <link rel="import" type="css"> at the top of the template
    const linkedStyles = stylesFromModuleImports(is);
    const firstTemplateChild = template.content.firstElementChild;
    for (let idx = 0; idx < linkedStyles.length; idx++) {
      let s = linkedStyles[idx];
      s.textContent = klass._processStyleText(s.textContent, baseURI);
      template.content.insertBefore(s, firstTemplateChild);
    }
    // keep track of the last "concrete" style in the template we have encountered
    let templateStyleIndex = 0;
    // ensure all gathered styles are actually in this template.
    for (let i = 0; i < stylesWithImports.length; i++) {
      let s = stylesWithImports[i];
      let templateStyle = templateStyles[templateStyleIndex];
      // if the style is not in this template, it's been "included" and
      // we put a clone of it in the template before the style that included it
      if (templateStyle !== s) {
        s = s.cloneNode(true);
        templateStyle.parentNode.insertBefore(s, templateStyle);
      } else {
        templateStyleIndex++;
      }
      s.textContent = klass._processStyleText(s.textContent, baseURI);
    }
    if (window.ShadyCSS) {
      window.ShadyCSS.prepareTemplate(template, is);
    }
  }

  class PolymerElement extends polymerElementBase {

   static _finalizeClass() {
      super._finalizeClass();
      if (this.hasOwnProperty(
        JSCompiler_renameProperty('is', this)) &&  this.is) {
        register(this.prototype);
      }
      const observers = ownObservers(this);
      if (observers) {
        this.createObservers(observers, this._properties);
      }
      // note: create "working" template that is finalized at instance time
      let template = /** @type {PolymerElementConstructor} */ (this).template;
      if (template) {
        if (typeof template === 'string') {
          let t = document.createElement('template');
          t.innerHTML = template;
          template = t;
        } else {
          template = template.cloneNode(true);
        }
      }

      this.prototype._template = template;
    }

     static createProperties(props) {
      for (let p in props) {
        createPropertyFromConfig(this.prototype, p, props[p], props);
      }
    }

    static createObservers(observers, dynamicFns) {
      const proto = this.prototype;
      for (let i=0; i < observers.length; i++) {
        proto._createMethodObserver(observers[i], dynamicFns);
      }
    }

    static get template() {
      if (!this.hasOwnProperty(JSCompiler_renameProperty('_template', this))) {
        this._template = DomModule && DomModule.import(
          /** @type {PolymerElementConstructor}*/ (this).is, 'template') ||
          // note: implemented so a subclass can retrieve the super
          // template; call the super impl this way so that `this` points
          // to the superclass.
          Object.getPrototypeOf(/** @type {PolymerElementConstructor}*/ (this).prototype).constructor.template;
      }
      return this._template;
    }

    static get importPath() {
      if (!this.hasOwnProperty(JSCompiler_renameProperty('_importPath', this))) {
          const module = DomModule && DomModule.import(/** @type {PolymerElementConstructor} */ (this).is);
          this._importPath = module ? module.assetpath : '' ||
          Object.getPrototypeOf(/** @type {PolymerElementConstructor}*/ (this).prototype).constructor.importPath;
      }
      return this._importPath;
    }

    constructor() {
      super();
      /** @type {HTMLTemplateElement} */
      this._template;
      /** @type {string} */
      this._importPath;
      /** @type {string} */
      this.rootPath;
      /** @type {string} */
      this.importPath;
      /** @type {StampedTemplate | HTMLElement | ShadowRoot} */
      this.root;
      /** @type {!Object<string, !Element>} */
      this.$;
    }

    _initializeProperties() {
      instanceCount++;
      this.constructor.finalize();
      const importPath = this.constructor.importPath;
      // note: finalize template when we have access to `localName` to
      // avoid dependence on `is` for polyfilling styling.
      this.constructor._finalizeTemplate(/** @type {!HTMLElement} */(this).localName);
      super._initializeProperties();
      // set path defaults
      this.rootPath = rootPath$0;
      this.importPath = importPath;
      // apply property defaults...
      let p$ = propertyDefaults(this.constructor);
      if (!p$) {
        return;
      }
      for (let p in p$) {
        let info = p$[p];
        // Don't set default value if there is already an own property, which
        // happens when a `properties` property with default but no effects had
        // a property set (e.g. bound) by its host before upgrade
        if (!this.hasOwnProperty(p)) {
          let value = typeof info.value == 'function' ?
            info.value.call(this) :
            info.value;
          // Set via `_setProperty` if there is an accessor, to enable
          // initializing readOnly property defaults
          if (this._hasAccessor(p)) {
            this._setPendingProperty(p, value, true);
          } else {
            this[p] = value;
          }
        }
      }
    }

    static _processStyleText(cssText, baseURI) {
      return resolveCss(cssText, baseURI);
    }

    static _finalizeTemplate(is) {
      /** @const {HTMLTemplateElement} */
      const template = this.prototype._template;
      if (template && !template.__polymerFinalized) {
        template.__polymerFinalized = true;
        const importPath = this.importPath;
        const baseURI = importPath ? resolveUrl$0(importPath) : '';
        // e.g. support `include="module-name"`, and ShadyCSS
        processElementStyles(this, template, is, baseURI);
        this.prototype._bindTemplate(template);
      }
    }

    connectedCallback() {
      if (window.ShadyCSS && this._template) {
        window.ShadyCSS.styleElement(/** @type {!HTMLElement} */(this));
      }
      super.connectedCallback();
    }

    ready() {
      if (this._template) {
        this.root = this._stampTemplate(this._template);
        this.$ = this.root.$;
      }
      super.ready();
    }

    _readyClients() {
      if (this._template) {
        this.root = this._attachDom(/** @type {StampedTemplate} */(this.root));
      }
      super._readyClients();
    }

    _attachDom(dom) {
      if (this.attachShadow) {
        if (dom) {
          if (!this.shadowRoot) {
            this.attachShadow({mode: 'open'});
          }
          this.shadowRoot.appendChild(dom);
          return this.shadowRoot;
        }
        return null;
      } else {
        throw new Error('ShadowDOM not available. ' +
          // TODO(sorvell): move to compile-time conditional when supported
        'Polymer.Element can create dom as children instead of in ' +
        'ShadowDOM by setting `this.root = this;\` before \`ready\`.');
      }
    }

    updateStyles(properties) {
      if (window.ShadyCSS) {
        window.ShadyCSS.styleSubtree(/** @type {!HTMLElement} */(this), properties);
      }
    }

    resolveUrl(url, base) {
      if (!base && this.importPath) {
        base = resolveUrl$0(this.importPath);
      }
      return resolveUrl$0(url, base);
    }

    static _parseTemplateContent(template, templateInfo, nodeInfo) {
      templateInfo.dynamicFns = templateInfo.dynamicFns || this._properties;
      return super._parseTemplateContent(template, templateInfo, nodeInfo);
    }

  }

  return PolymerElement;
});

let instanceCount = 0;
const registrations = [];

function _regLog(prototype) {
  console.log('[' + prototype.is + ']: registered');
}

function register(prototype) {
  registrations.push(prototype);
  undefined && _regLog(prototype);
}

function dumpRegistrations() {
  registrations.forEach(_regLog);
}

const updateStyles = function(props) {
  if (window.ShadyCSS) {
    window.ShadyCSS.styleDocument(props);
  }
};

const PolymerElement = ElementMixin(HTMLElement);


class ShopApp extends PolymerElement {
  static get template() {
    return html`
    <shop-cart-data id="cart" cart="{{cart}}" num-items="{{numItems}}" total="{{total}}"></shop-cart-data>
`;
  }

  static get is() { return 'shop-app'; }

  static get properties() { return {
    numItems: {
      type: Number,
      value: 0
    },
  }}

  static get observers() { return [
    '_routePageChanged(routeData.page)'
  ]}

  constructor() {
    super();
    window.performance && performance.mark && performance.mark('shop-app.created');
  }

}

const div = document.createElement('div');
document.body.appendChild(div);
div.innerHTML = '<shop-app unresolved>SHOP</shop-app>';

customElements.define(ShopApp.is, ShopApp);
