(function() {
  'use strict';

  loadPIXI('3.0.8').then(() => {
    var Game = require('../Client/Game');

    var game = new Game();
    window.game = game;
  });

  /**
   * Loads the given version of pixi off of cloudflare CDN
   * @param {string} version - The version to load
   * @param {function} callback - Callback after pixi has been loaded
   */
  function loadPIXI(version, callback) {
    return new Promise((resolve, reject) => {
      var pixiScript = document.createElement('script');
      pixiScript.async = true;
      pixiScript.src = '//cdnjs.cloudflare.com/ajax/libs/pixi.js/' +
        version + '/pixi.js';

        pixiScript.addEventListener('load', (event) => {
          resolve();
        });
        document.head.appendChild(pixiScript);
    });
  }
})();
