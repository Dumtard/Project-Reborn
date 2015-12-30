(function () {
  'use strict';

  var EventEmitter = require('../Shared/EventEmitter');
  var Entity = require('../Shared/Entity');

  /**
   * This class is used to create and manage all entities.
   * @class
   */
  class EntityManager {
    /**
     * @constructor
     */
    constructor() {
      this.currentID = 1;
      this.availableIDs = [];
      this.entities = [];
    }

    /**
     * Create new entity by marking next available id as in use.
     * @return {Entity} - The entity
     */
    createEntity(id) {
      if (this.availableIDs.length === 0) {
        id = id || this.currentID++;
      } else {
        id = id || this.availableIDs.pop();
      }

      var entity = new Entity(id);

      this.entities.push(entity);

      EventEmitter.emit('entityCreated', {
        entity: entity
      });

      return entity;
    }

    /**
     * Remove the reference to the entity from the manager and list the id as
     * available. Removes all the components for the id from the
     * ComponentManager.
     * @param {Entity} entity - The entity to remove
     * @return {boolean} - If the removal succeeded or not
     */
    removeEntity(entity) {
      if (!this.isValidEntity(entity)) {
        return false;
      }

      this.availableIDs.push(entity.id);

      for (let i = 0, len = this.entities.length; i < len; ++i) {
        if (this.entities[i].id === entity.id) {
          this.entities[i] = undefined;
          this.entities.splice(i, 1);
          break;
        }
      }

      EventEmitter.emit('entityRemoved', {
        entity: entity
      });

      return true;
    }

    removeAllEntities() {
      for (let i = 0, len = this.entities.length; i < len; ++i) {
        this.availableIDs.push(this.entities[i].id);

        EventEmitter.emit('entityRemoved', {
          entity: this.entities[i]
        });

        this.entities[i] = undefined;
      }
      this.entities = [];

      return true;
    }

    /**
     * Get an entity object from the id
     * @param {number} id - The id of the entity you want to get
     * @return {Entity} - The entity object
     */
    getEntity(id) {
      for (let i = 0, len = this.entities.length; i < len; ++i) {
        if (this.entities[i].id === id) {
          return this.entities[i];
        }
      }
      return undefined;
    }

    /**
     * Add component to the entity.
     * @param {Entity} entity - The entity to add the component to
     * @param {string} name - The component name to add to the entity
     * @param {object} data - The data of the component to add to the entity
     * @return {boolean} - If adding the component succeeded or not
     */
    addComponent(entity, name, data) {
      if (!this.isValidEntity(entity)) {
        return undefined;
      }

      entity[name] = data;

      EventEmitter.emit('componentAdded', {
        entity: entity,
        component: name
      });

      return this;
    }

    /**
     * Remove component from the entity.
     * @param {Entity} entity - The entity to remove the component from
     * @param {name} name - The component to remove from the entity
     * @return {boolean} - If removing the component succeeded or not
     */
    removeComponent(entity, name) {
      if (!this.isValidEntity(entity)) {
        return undefined;
      }

      if (!entity[name]) {
        return this;
      }

      entity[name] = undefined;
      delete entity[name];

      EventEmitter.emit('componentAdded', {
        entity: entity,
        component: name
      });

      return this;
    }

    /**
     * Check if the id for the entity is marked as being used or not by the
     * EntityManager. This check must succeed to manipulate the entity and it's
     * components.
     * @param {Entity} entity - The entity to check
     * @return {boolean} - Is the entity valid or not
     */
    isValidEntity(entity) {
      var retValue = false;

      if (entity instanceof Entity) {
        for (let i = 0, len = this.entities.length; i< len; ++i) {
          if (entity.id === this.entities[i].id) {
            retValue = true;
            break;
          }
        }
      }

      return retValue;
    }
  }

  module.exports = EntityManager;
})();
