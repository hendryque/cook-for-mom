import Component from '@ember/component';
import { isPresent } from '@ember/utils';
import { bind, next } from '@ember/runloop';

export default Component.extend({
  z: -1,
  scale: 2, // todo: compute this from z, with #math

  didInsertElement() {
    this._onResize = bind(this, computeTransform);

    next(this, this._onResize);
    window.addEventListener('resize', this._onResize, { passive: true });
  },

  willDestroyElement() {
    if (isPresent(this._onResize)) {
      window.removeEventListener('resize', this._onResize, { passive: true });
      this._onResize = null;
    }
  }
});

function computeTransform() {
  let { element, z, scale, userAgent } =
    this.getProperties('element', 'z', 'scale', 'userAgent');
  let frameHeight = element.parentElement.clientHeight;
  let originalHeight = element.clientHeight;

  let transforms = [
    `translateY(${frameHeight - originalHeight}px)`, // normalize frame + elem bottom
    `translateZ(${z}px)`, // translate to back plane
    `scale(${scale})`, // scale back to same visual size; todo compute scale factor dynamically
  ];

  if (userAgent.get('browser.isChrome') && !userAgent.get('os.isIOS')) {
    element.style.transform = transforms.join(' ');
  }
}
