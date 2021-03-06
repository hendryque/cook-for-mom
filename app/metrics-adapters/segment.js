import SegmentAdapter from 'ember-metrics/metrics-adapters/segment';

import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import { next, schedule } from '@ember/runloop';
import { isPresent } from '@ember/utils';
import { task, timeout, waitForProperty } from 'ember-concurrency';

import md5 from 'md5';
import { getUrlParameter } from '../utils/url';

export default SegmentAdapter.extend({
  fingerprintjs: service(),
  firebase: service(),
  raven: service(),

  init() {
    this._super(...arguments);
    this.get('waitForFingerprint').perform();
  },

  isReady: false,
  waitForFingerprint: task(function *() {
    if (typeof FastBoot === 'undefined' && !this.get('isReady')) {
      yield waitForProperty(this.get('fingerprintjs'), 'fingerprint');

      let { firebase, raven } = this.getProperties('firebase', 'raven');
      let { result, components } = this.get('fingerprintjs.fingerprint');

      registerRaven(raven, result);
      findOrCreateFirebaseFingerprint(firebase, result, components);

      while (typeof get(window, 'analytics.user') !== 'function') {
        yield timeout(1);
      }

      registerClientAnonymousId(result);
      this.set('isReady', true);
    }
  }),

  alias: ensureFingerprintBefore('alias'),
  identify: ensureFingerprintBefore('identify'),
  trackEvent: ensureFingerprintBefore('trackEvent'),
  trackPage: ensureFingerprintBefore('trackPage')
});

function ensureFingerprintBefore(funcName) {
  return function (options) {
    if (typeof FastBoot !== 'undefined') {
      return;
    }

    if (!this.get('isReady')) {
      next(this, schedule, 'afterRender', this, funcName, options);
    } else {
      let mcReferrer = getUrlParameter('mc_referrer');

      if (isPresent(mcReferrer)) {
        options.mc_referrer = md5(mcReferrer);
      }

      options.fingerprint = options.fingerprint ||
        this.get('fingerprintjs.fingerprint.result');

      this._super(options);
    }
  }
}

function registerClientAnonymousId(id) {
  window.analytics.user().anonymousId(id);
}

function findOrCreateFirebaseFingerprint(firebase, id, components) {
  firebase.firestore()
    .collection('fingerprints')
    .doc(id)
    .set({ components })
    .catch((err) => {
      if (err.code === 'permission-denied') {
        return; // document exists
      }

      throw err;
    });
}

function registerRaven(raven, id) {
  // n.b. handle sentry separately since its client is wrapped by an ember service
  raven.callRaven('setUserContext', { id });
}
