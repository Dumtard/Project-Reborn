var System = require ('../Shared/System');

var stage;

class RenderSystem extends System {
  constructor() {
    super();

    stage = new PIXI.Container();
    window.stage = stage;

    this.renderer = PIXI.autoDetectRenderer(
      window.innerWidth, window.innerHeight, { antialias: false }
    );
    document.body.appendChild(this.renderer.view);
  }

  update(delta, entities) {
    var len = entities.length;
    for (let i = 0; i < len; ++i) {
      var entity = entities[i];
      if (entity.render && entity.position && entity.render) {
        var pos = entity.position;
        var renderPos = entity.render.sprite.position;

        //renderPos.x = prevPos.x + (pos.x - prevPos.x) * (entity.interp / entity.interpolation.duration);
        //renderPos.y = prevPos.y + (pos.y - prevPos.y) * (entity.interp / entity.interpolation.duration);

        renderPos.x = pos.x;
        renderPos.y = pos.y;
      }
    }

    this.renderer.render(stage);
  }

  addChild(entity) {
    stage.addChild(entity.render.sprite);
  }

  removeChild(entity) {
    stage.removeChild(entity.render.sprite);
  }
}

module.exports = RenderSystem;
