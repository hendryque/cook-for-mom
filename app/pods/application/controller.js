import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';

import md5 from 'md5';

export default Controller.extend({
  metrics: service(),
  router: service(),

  fingerprint: null, // n.b. set on init
  canNudgeUser: false,
  didSubmit: computed(function() {
    return typeof FastBoot === 'undefined' && localStorage.getItem('didSubmit');
  }),

  isNudging: null, // is object
  _nudgesRequested: null, // is array

  init() {
    this._super(...arguments);
    this._nudgesRequested = [];
  },

  nudge(application, topic, name) {
    application.set('isNudging', true);

    application.get('metrics').trackEvent('Segment', {
      event: 'nudge',
      topic,
      name
    });
  },

  requestNudgeFor(application, topic, name) {
    if (!application.get('canNudgeUser') || application.get('isNudging')) {
      return;
    }

    let requested = application.get('_nudgesRequested');
    let isRepeatRequest = requested.any(({ topic: _topic, name: _name }) => {
      return _topic === topic && _name === name;
    });

    if (!isRepeatRequest) {
      requested.addObject({ topic, name, timestamp: new Date() });
      application.nudge(application, topic, name);

      return true;
    }
  },

  onEmailSubmitted(application, email, source) {
    if (isBlank(email)) {
      return; // n.b. for some reason this is firing when the navbar modal closes
    }

    let distinctId = md5(email);
    let metrics = application.get('metrics');

    metrics.identify('Segment', { distinctId, email });
    metrics.trackEvent('Segment', {
      event: 'signup',
      source
    });

    application.set('didSubmit', true);
    localStorage.setItem('didSubmit', true);
  },

  trackAffiliate(application, merchant, item, { target } = { target: {} }) {
    let { href } = target;

    application.get('metrics').trackEvent('Segment', {
      event: 'affiliate',
      merchant,
      item,
      href
    });
  }
});
