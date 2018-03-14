import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { next, bind, schedule } from '@ember/runloop';

export default Component.extend({
  userAgent: service(),

  z: -1,
  scale: 2, // todo: compute this from z, with #math

  didInsertElement() {
    this._onResize = bind(this, computeStyleTop);

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

function computeStyleTop() {
  let p = 1; // todo read this somehow
  let { element, z, scale, verticalAlign, userAgent } =
    this.getProperties('element', 'z', 'scale', 'verticalAlign', 'userAgent');
  let frameHeight = element.parentElement.clientHeight;
  let originalHeight = element.clientHeight;
  let projectedHeight = originalHeight * (1 + (z / (p - z)));

  let transforms = [
    `translateY(${frameHeight - element.clientHeight}px)`, // normalize frame + elem bottom
    `translateZ(${z}px)`, // translate to back plane
    `scale(${scale})`, // scale back to same visual size; todo compute scale factor dynamically
  ];

  if (!userAgent.get('browser.isSafari')) {
    let matchedBottoms = (projectedHeight - projectedHeight * scale) / 2

    transforms.push(`translateY(${matchedBottoms}px)`);
  }

  element.style.transform = transforms.join(' ');

  // default verticalAlign = bottom
  if (verticalAlign === 'middle') {
    let child = element.firstElementChild;
    let translationToCenter = (projectedHeight * scale - projectedHeight) / 2;

    child.style.transform = `translateY(${translationToCenter}px)`;
  }

  // middle
  // child.style['margin-top'] = `${(frameHeight - child.clientHeight) / 2}px`;
  // bottom
  // child.style['margin-top'] = `${frameHeight - child.clientHeight}px`;
}
