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
  let child = element.firstElementChild;
  let frameHeight = element.parentElement.clientHeight;

  element.parentElement.style.height = `${frameHeight}px`;
  element.style.top = `calc(${frameHeight}px - 50vh)`;
  element.style.height = `${3 * frameHeight}px`;

  // middle
  // child.style['margin-top'] = `${(frameHeight - child.clientHeight) / 2}px`;
  // bottom
  // child.style['margin-top'] = `${frameHeight - child.clientHeight}px`;
}
