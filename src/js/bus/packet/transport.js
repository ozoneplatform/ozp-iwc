/**
 * @module ozpIwc
 * @submodule ozpIwc.packet
 */


/**
 * @class Transport
 * @namespace ozpIwc.packet

 */

/**
 * The participant address that sent this packet.
 * @property {String} src
 */

/**
 * The intended recipient of this packet.
 * @property {String} dst
 */

/**
 * Protocol version.
 * @property {Number} ver
 */

/**
 * A unique id for this packet.
 * @property {Number} msgId
 */

/**
 * The payload of this packet.
 * @property {Object} entity
 */

/**
 * Permissions required to see the payload of this packet.
 * @property {Object} [permissions]
 */

/**
 * Time in milliseconds since epoch that this packet was created.
 * @property {Number} [time]
 */

/**
 * Reference to the msgId that this is in reply to.
 * @property {Number} [replyTo]
 */

/**
 * Action to be performed.
 * @property {String} [action]
 */

/**
 * Resource to perform the action upon.
 * @property {String} [resource]
 */

/**
 * Marker for test packets.
 * @property {Boolean} [test]
 */