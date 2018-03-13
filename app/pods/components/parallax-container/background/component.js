import Fluid from '../fluid/component';
import { isPresent } from '@ember/utils';
import { bind, schedule } from '@ember/runloop';

export default Fluid.extend({
  didInsertElement() {
    this._onResize = bind(this, computeStyleTop, this.element);

    schedule('afterRender', this, this._onResize);
    window.addEventListener('resize', this._onResize, { passive: true });
  },

  willDestroyElement() {
    if (isPresent(this._onResize)) {
      window.removeEventListener('resize', this._onResize, { passive: true });
      this._onResize = null;
    }
  }
});

function computeStyleTop(element) {
  let z = -2;
  let scale = 3;
  let frameHeight = element.parentElement.clientHeight;
  // let transform = `translateZ(${z}px) scale(${scale}) translateY(${frameHeight - element.clientHeight}px)`;
  let transform = `translateZ(${z}px) translateY(${(window.innerHeight / 2) + frameHeight - element.clientHeight}px) scale(${scale}) translateY(${element.clientHeight / (1 - scale)}px)`;

  // element.parentElement.style.height = `${frameHeight}px`;
  // element.style.top = `calc(${frameHeight}px - 50vh)`;
  // element.style.height = `${3 * frameHeight}px`;
  element.style.transform = transform;

  // middle
  // child.style['margin-top'] = `${(frameHeight - child.clientHeight) / 2}px`;
  // bottom
  // child.style['margin-top'] = `${frameHeight - child.clientHeight}px`;
}
