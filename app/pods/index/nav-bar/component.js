import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { bind, once } from '@ember/runloop';
import { isPresent } from '@ember/utils';

export default Component.extend({
  userAgent: service(),

  tagName: 'nav',
  classNames: ['container-fluid'],

  isButtonVisible: true,
  isNudging: false,

  didSubmit: false,
  onSubmit: function() {},

  _didNudgeOnHover: false,

  didInsertElement() {
    setActiveAnchor.call(this);
    this._anchorChangeListener = bind(this, once, this, setActiveAnchor);
    this._hoverNudgeListener = bind(this, once, this, hoverNudgeListener);

    window.addEventListener('scroll', this._anchorChangeListener, {
      capture: true,
      passive: true
    });

    window.addEventListener('resize', this._anchorChangeListener, {
      capture: true,
      passive: true
    });

    this.element.addEventListener('mouseover', this._hoverNudgeListener, {
      capture: true,
      passive: true
    });

    if (this.get('userAgent.browser.isFirefox')) {
      this.element.style.height = this.element.clientHeight;
      this.element.style['overflow-y'] = 'hidden';
    }
  },

  willDestroyElement() {
    window.removeEventListener('scroll', this._anchorChangeListener, {
      capture: true,
      passive: true
    });

    window.removeEventListener('resize', this._anchorChangeListener, {
      capture: true,
      passive: true
    });

    this._anchorChangeListener = null;

    if (isPresent(this._hoverNudgeListener)) {
      this.element.removeEventListener('mouseover', this._hoverNudgeListener, {
        capture: true,
        passive: true
      });

      this._hoverNudgeListener = null;
    }
  }
});

function setActiveAnchor() {
  let sections = Array.from(document.querySelectorAll('section.info'));
  let anchorLinks = this.element.querySelectorAll('a');
  let minTop = window.innerHeight * .5;

  // n.b. `reverse` reverses the array in place, so we count down
  let firstVisibleIndex = (sections.length - 1) - sections.reverse()
    .findIndex((elem) => elem.getBoundingClientRect().top <= minTop);

  anchorLinks.forEach((elem, index) => {
    if (index === firstVisibleIndex) {
      if (elem !== this.element.querySelector('.active')) {
        scrollToElem.call(this, elem);
      }

      elem.classList.add('active');
    } else {
      elem.classList.remove('active');
    }
  });
}

function scrollToElem(elem) {
  let ulElem = this.element.querySelector('ul');
  let { right: ulRight } = ulElem.getBoundingClientRect();
  let { left, right } = elem.getBoundingClientRect();

  if (right > ulRight) {
    ulElem.scrollLeft = ulElem.scrollLeft + (right - ulRight);
  } else if (left < 0) {
    ulElem.scrollLeft = ulElem.scrollLeft + left;
  }
}

function hoverNudgeListener() {
  if (this.element.getBoundingClientRect().top > 0) {
    return;
  }

  if (this.get('requestNudgeFor')('exit-hover')) {
    this._hoverNudgeListener = null;
  }
}
