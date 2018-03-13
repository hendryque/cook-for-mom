import Controller, { inject as controller } from '@ember/controller';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  email: [
    validator('presence', true),
    validator('format', { type: 'email' })
  ]
});

export default Controller.extend(Validations, {
  application: controller(),

  email: '',
  isHeroFormShowing: true
});
