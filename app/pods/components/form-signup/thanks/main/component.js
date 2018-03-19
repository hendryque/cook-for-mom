import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  metrics: service(),

  clickedSocial(platform) {
    this.get('metrics').trackEvent('Segment', {
      event: 'clickedSocial',
      platform
    });
  }
});
