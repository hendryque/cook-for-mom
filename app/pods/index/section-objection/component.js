import Component from '@ember/component';

export default Component.extend({
  tagName: 'section',
  classNames: ['objection', 'col-10', 'offset-1'],

  childrenClass: '',
  questionComponent: 'index/section-objection/question',
  answerComponent: 'index/section-objection/answer'
});
