export function getUrlParameter(name) {
  let regex;
  let results;

  name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
  regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  results = regex.exec(window.location.search);

  return results === null ?
    '' :
    decodeURIComponent(results[1].replace(/\+/g, ' '));
}
