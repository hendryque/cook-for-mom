import Component from '@ember/component';
import { inject as service } from '@ember/service';

import share from '../../../../../utils/share';

export default Component.extend({
  metrics: service(),

  reset: null, // is optional fn
  share(platform) {
    this.get('metrics').trackEvent('Segment', {
      event: 'share',
      platform
    });

    share(platform);
  }
});
